// Small wrappers around dnd-kit so every sortable list in the editor
// (sections, feature items, gallery images...) works the same way.
import { createContext, useContext } from 'react';
import { flushSync } from 'react-dom';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis, restrictToParentElement } from '@dnd-kit/modifiers';
import { CSS } from '@dnd-kit/utilities';

// Lets each item reach its list's onBeforeDrag without passing it as a prop.
const BeforeDragContext = createContext(null);

// A vertical list whose children can be reordered.
// `items` must be an array of objects with a stable `id`;
// `onReorder` receives the new array.
// `onBeforeDrag` (optional) runs just before a drag can start, e.g. to collapse
// an open card, so dnd-kit measures the items at the size they'll be dragged at.
// Lists can be nested: each SortableList has its own DndContext,
// so dragging a gallery image never moves the section it lives in.
export function SortableList({ items, onReorder, onBeforeDrag, className, children }) {
  // Sensors decide how a drag starts: mouse/touch (after moving 5px, so
  // normal clicks still work) or keyboard (focus a handle, Space, arrows, Space).
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const from = items.findIndex((item) => item.id === active.id);
    const to = items.findIndex((item) => item.id === over.id);
    onReorder(arrayMove(items, from, to));
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis, restrictToParentElement]}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
        <BeforeDragContext.Provider value={onBeforeDrag}>
          <div className={className}>{children}</div>
        </BeforeDragContext.Provider>
      </SortableContext>
    </DndContext>
  );
}

// Keys that start a keyboard drag (dnd-kit's defaults).
const DRAG_START_KEYS = ['Space', 'Enter'];

// Registers one item with the surrounding SortableList.
// Put `ref` + `style` on the element that moves, and spread
// `handleProps` on the drag handle so only the handle starts a drag.
export function useSortableItem(id) {
  const onBeforeDrag = useContext(BeforeDragContext);
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  // Run onBeforeDrag *before* dnd-kit sees the event. flushSync applies the
  // state change to the DOM immediately, so when dnd-kit measures the items
  // to start the drag, they already have their final (collapsed) size.
  const beforeDrag = () => {
    if (onBeforeDrag) flushSync(onBeforeDrag);
  };

  const handleListeners = {
    onPointerDown: (event) => {
      beforeDrag();
      listeners?.onPointerDown?.(event);
    },
    onKeyDown: (event) => {
      if (DRAG_START_KEYS.includes(event.code)) beforeDrag();
      listeners?.onKeyDown?.(event);
    },
  };

  return {
    ref: setNodeRef,
    style: { transform: CSS.Transform.toString(transform), transition },
    isDragging,
    handleProps: { ref: setActivatorNodeRef, ...attributes, ...handleListeners },
  };
}

export function DragHandle({ handleProps, label }) {
  return (
    <button
      type="button"
      className="drag-handle"
      title="Drag to reorder"
      aria-label={label}
      {...handleProps}
    >
      ⠿
    </button>
  );
}

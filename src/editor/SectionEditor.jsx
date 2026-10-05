import { registry } from '../registry.js';
import FieldInput from './FieldInput.jsx';
import { DragHandle, useSortableItem } from './Sortable.jsx';

export default function SectionEditor({
  section,
  isOpen,
  isFirst,
  isLast,
  onToggle,
  onChangeProp,
  onMove,
  onDelete,
}) {
  const Component = registry[section.type];
  const fields = Component?.fields ?? [];

  const { ref, style, isDragging, handleProps } = useSortableItem(section.id);

  return (
    <div
      ref={ref}
      style={style}
      className={`section-editor ${isOpen ? 'open' : ''} ${isDragging ? 'dragging' : ''}`}
    >
      <div className="section-editor__header">
        <DragHandle handleProps={handleProps} label={`Reorder ${Component?.label ?? section.type}`} />
        <button type="button" className="section-editor__title" onClick={onToggle}>
          {isOpen ? '▾' : '▸'} {Component?.label ?? section.type}
        </button>
        <div className="section-editor__actions">
          <button type="button" title="Move up" disabled={isFirst} onClick={() => onMove(-1)}>
            ↑
          </button>
          <button type="button" title="Move down" disabled={isLast} onClick={() => onMove(1)}>
            ↓
          </button>
          <button type="button" title="Delete" className="danger" onClick={onDelete}>
            ✕
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="section-editor__body">
          {fields.map((field) => {
            // A <label> forwards clicks to its first control; a list contains
            // several buttons, so it gets a plain wrapper instead.
            const Wrapper = field.type === 'list' ? 'div' : 'label';
            return (
              <Wrapper key={field.name} className="field">
                <span>{field.label}</span>
                <FieldInput
                  field={field}
                  value={section.props[field.name]}
                  onChange={(value) => onChangeProp(field.name, value)}
                />
              </Wrapper>
            );
          })}
        </div>
      )}
    </div>
  );
}

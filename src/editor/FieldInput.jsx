import { useState } from 'react';
import { newId } from '../ids.js';
import { DragHandle, SortableList, useSortableItem } from './Sortable.jsx';

// Renders the right form control for a field definition.
// Section components describe their editable props via `fields`,
// so the editor never needs to know about specific section types.
export default function FieldInput({ field, value, onChange }) {
  switch (field.type) {
    case 'textarea':
      return <textarea rows={3} value={value ?? ''} onChange={(e) => onChange(e.target.value)} />;
    case 'color':
      return (
        <input type="color" value={value ?? '#000000'} onChange={(e) => onChange(e.target.value)} />
      );
    case 'toggle':
      return (
        <input
          type="checkbox"
          className="toggle"
          checked={!!value}
          onChange={(e) => onChange(e.target.checked)}
        />
      );
    case 'number':
      // An empty box stays empty instead of turning into 0.
      return (
        <input
          type="number"
          min={field.min}
          max={field.max}
          step={field.step}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
        />
      );
    case 'range':
      return (
        <div className="range-input">
          <input
            type="range"
            min={field.min}
            max={field.max}
            step={field.step}
            value={value ?? field.min}
            onChange={(e) => onChange(Number(e.target.value))}
          />
          <output>
            {value ?? field.min}
            {field.unit}
          </output>
        </div>
      );
    case 'emoji':
      return <EmojiInput value={value} onChange={onChange} />;
    case 'select':
      return (
        <select value={value ?? ''} onChange={(e) => onChange(e.target.value)}>
          {field.options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );
    case 'list':
      return <ListInput field={field} value={value ?? []} onChange={onChange} />;
    default:
      return <input type="text" value={value ?? ''} onChange={(e) => onChange(e.target.value)} />;
  }
}

const commonEmojis = [
  '⭐', '⚡', '🎯', '🤝', '❤️', '🔥', '✨', '🚀',
  '💡', '✅', '📈', '💰', '🛡️', '⏱️', '📦', '🎨',
  '🧁', '🥐', '☕', '🍰', '📷', '🎵', '🌱', '🏆',
  '📞', '✉️', '📍', '🌍', '🔒', '🛠️', '😊', '👍',
];

// A text box (any emoji can still be typed or pasted) plus a grid of common ones.
function EmojiInput({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="emoji-input">
      <div className="emoji-input__row">
        <input type="text" value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
        <button
          type="button"
          className="small"
          aria-expanded={isOpen}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? 'Close' : 'Pick'}
        </button>
      </div>
      {isOpen && (
        <div className="emoji-input__grid">
          {commonEmojis.map((emoji) => (
            <button
              key={emoji}
              type="button"
              title={emoji}
              className={emoji === value ? 'selected' : ''}
              onClick={() => {
                onChange(emoji);
                setIsOpen(false);
              }}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// An editable, reorderable list (feature cards, gallery images...).
// Items are matched by `id`, not by index, so they keep their identity when moved.
function ListInput({ field, value, onChange }) {
  const updateItem = (id, name, newValue) =>
    onChange(value.map((item) => (item.id === id ? { ...item, [name]: newValue } : item)));

  const removeItem = (id) => onChange(value.filter((item) => item.id !== id));

  // Items are collapsed by default so the list stays short and easy to drag.
  const [openId, setOpenId] = useState(null);

  const addItem = () => {
    const id = newId();
    onChange([...value, { ...field.newItem, id }]);
    setOpenId(id);
  };

  return (
    <div className="list-input">
      <SortableList items={value} onReorder={onChange} onBeforeDrag={() => setOpenId(null)}>
        {value.map((item, index) => (
          <ListItem
            key={item.id}
            item={item}
            index={index}
            field={field}
            isOpen={openId === item.id}
            onToggle={() => setOpenId(openId === item.id ? null : item.id)}
            onChange={(name, v) => updateItem(item.id, name, v)}
            onRemove={() => removeItem(item.id)}
          />
        ))}
      </SortableList>
      <button type="button" className="small" onClick={addItem}>
        + Add item
      </button>
    </div>
  );
}

function ListItem({ item, index, field, isOpen, onToggle, onChange, onRemove }) {
  const { ref, style, isDragging, handleProps } = useSortableItem(item.id);

  // `itemLabel` says which field names the item (title, caption...).
  const name = item[field.itemLabel ?? field.itemFields[0].name] || `Item ${index + 1}`;

  return (
    <div ref={ref} style={style} className={`list-item ${isDragging ? 'dragging' : ''}`}>
      <div className="list-item__header">
        <DragHandle handleProps={handleProps} label={`Reorder ${name}`} />
        <button type="button" className="list-item__name" onClick={onToggle}>
          {isOpen ? '▾' : '▸'} {name}
        </button>
        <button type="button" className="link danger" onClick={onRemove}>
          Remove
        </button>
      </div>
      {isOpen &&
        field.itemFields.map((sub) => (
          <label key={sub.name}>
            <span>{sub.label}</span>
            <FieldInput field={sub} value={item[sub.name]} onChange={(v) => onChange(sub.name, v)} />
          </label>
        ))}
    </div>
  );
}

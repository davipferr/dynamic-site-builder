import { useState } from 'react';
import { registry } from '../registry.js';
import { newId, withItemIds } from '../ids.js';
import FieldInput from './FieldInput.jsx';
import SectionEditor from './SectionEditor.jsx';
import { SortableList } from './Sortable.jsx';

const themeFields = [
  { name: 'primaryColor', label: 'Primary color', type: 'color' },
  { name: 'backgroundColor', label: 'Background', type: 'color' },
  { name: 'textColor', label: 'Text color', type: 'color' },
  {
    name: 'font',
    label: 'Font',
    type: 'select',
    options: [
      'system-ui, sans-serif',
      'Georgia, serif',
      '"Courier New", monospace',
      '"Trebuchet MS", sans-serif',
    ],
  },
];

// The editor only ever produces a new version of the site config.
// It doesn't render the site itself; the PageRenderer does that.
export default function Editor({ site, onChange }) {
  const [openId, setOpenId] = useState(null);
  const [newType, setNewType] = useState(Object.keys(registry)[0]);

  const updateTheme = (name, value) => onChange({ ...site, theme: { ...site.theme, [name]: value } });

  const updateSections = (sections) => onChange({ ...site, sections });

  const updateSectionProp = (id, name, value) =>
    updateSections(
      site.sections.map((s) => (s.id === id ? { ...s, props: { ...s.props, [name]: value } } : s))
    );

  const moveSection = (index, direction) => {
    const sections = [...site.sections];
    const target = index + direction;
    [sections[index], sections[target]] = [sections[target], sections[index]];
    updateSections(sections);
  };

  const deleteSection = (id) => updateSections(site.sections.filter((s) => s.id !== id));

  const addSection = () => {
    const id = newId();
    const props = withItemIds(structuredClone(registry[newType].defaults));
    updateSections([...site.sections, { id, type: newType, props }]);
    setOpenId(id);
  };

  return (
    <div className="editor">
      <h3>Site</h3>
      <label>
        <span>Site name</span>
        <input
          type="text"
          value={site.name}
          onChange={(e) => onChange({ ...site, name: e.target.value })}
        />
      </label>

      <h3>Theme</h3>
      <div className="theme-grid">
        {themeFields.map((field) => (
          <label key={field.name}>
            <span>{field.label}</span>
            <FieldInput
              field={field}
              value={site.theme[field.name]}
              onChange={(v) => updateTheme(field.name, v)}
            />
          </label>
        ))}
      </div>

      <h3>Sections</h3>
      {/* Collapse the open section while dragging: cards of very different
          heights make moving with the keyboard skip places. */}
      <SortableList
        items={site.sections}
        onReorder={updateSections}
        onBeforeDrag={() => setOpenId(null)}
        className="section-list"
      >
        {site.sections.map((section, index) => (
          <SectionEditor
            key={section.id}
            section={section}
            isOpen={openId === section.id}
            isFirst={index === 0}
            isLast={index === site.sections.length - 1}
            onToggle={() => setOpenId(openId === section.id ? null : section.id)}
            onChangeProp={(name, value) => updateSectionProp(section.id, name, value)}
            onMove={(direction) => moveSection(index, direction)}
            onDelete={() => deleteSection(section.id)}
          />
        ))}
      </SortableList>

      <div className="add-section">
        <select value={newType} onChange={(e) => setNewType(e.target.value)}>
          {Object.entries(registry).map(([type, Component]) => (
            <option key={type} value={type}>
              {Component.label}
            </option>
          ))}
        </select>
        <button type="button" onClick={addSection}>
          + Add section
        </button>
      </div>
    </div>
  );
}

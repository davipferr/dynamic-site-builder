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

// One click sets the whole theme. The user can still tweak each value after.
const themePresets = [
  {
    name: 'Light',
    theme: { primaryColor: '#2563eb', backgroundColor: '#ffffff', textColor: '#1f2937', font: 'system-ui, sans-serif' },
  },
  {
    name: 'Dark',
    theme: { primaryColor: '#a78bfa', backgroundColor: '#0f0f14', textColor: '#e5e5ef', font: 'system-ui, sans-serif' },
  },
  {
    name: 'Warm',
    theme: { primaryColor: '#c2410c', backgroundColor: '#fffaf3', textColor: '#292524', font: 'Georgia, serif' },
  },
  {
    name: 'Pastel',
    theme: { primaryColor: '#db2777', backgroundColor: '#fdf2f8', textColor: '#4a044e', font: '"Trebuchet MS", sans-serif' },
  },
  {
    name: 'Forest',
    theme: { primaryColor: '#15803d', backgroundColor: '#f0fdf4', textColor: '#14532d', font: 'Georgia, serif' },
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

  const toggleHidden = (id) =>
    updateSections(site.sections.map((s) => (s.id === id ? { ...s, hidden: !s.hidden } : s)));

  // The copy goes right below the original. It and its list items get new
  // ids, otherwise drag and drop would confuse them with the originals.
  const duplicateSection = (index) => {
    const original = site.sections[index];
    const props = structuredClone(original.props);
    for (const [key, value] of Object.entries(props)) {
      if (Array.isArray(value)) {
        props[key] = value.map((item) =>
          item && typeof item === 'object' ? { ...item, id: newId() } : item
        );
      }
    }
    const copy = { ...original, id: newId(), props };
    const sections = [...site.sections];
    sections.splice(index + 1, 0, copy);
    updateSections(sections);
    setOpenId(copy.id);
  };

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
      <div className="theme-presets">
        {themePresets.map((preset) => (
          <button
            key={preset.name}
            type="button"
            title={`Apply the ${preset.name} theme`}
            onClick={() => onChange({ ...site, theme: { ...preset.theme } })}
          >
            <span className="theme-presets__swatch">
              <span style={{ background: preset.theme.backgroundColor }} />
              <span style={{ background: preset.theme.primaryColor }} />
              <span style={{ background: preset.theme.textColor }} />
            </span>
            {preset.name}
          </button>
        ))}
      </div>
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
            onDuplicate={() => duplicateSection(index)}
            onToggleHidden={() => toggleHidden(section.id)}
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

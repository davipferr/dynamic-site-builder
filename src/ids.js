// Drag and drop (and React keys in general) need a stable id for every item
// in a list. Using the array index doesn't work: when items move, the index
// moves with them. These helpers give ids to list items that don't have one.

export const newId = () => crypto.randomUUID();

// Adds an `id` to every object inside the array props of a section.
export function withItemIds(props) {
  const result = { ...props };
  for (const [key, value] of Object.entries(props)) {
    if (Array.isArray(value)) {
      result[key] = value.map((item) =>
        item && typeof item === 'object' && !item.id ? { ...item, id: newId() } : item
      );
    }
  }
  return result;
}

// Applies withItemIds to every section of every site. Used when loading data,
// so configs saved before list items had ids keep working.
export function ensureIds(sites) {
  const result = {};
  for (const [siteId, site] of Object.entries(sites)) {
    result[siteId] = {
      ...site,
      sections: site.sections.map((section) => ({
        ...section,
        id: section.id ?? newId(),
        props: withItemIds(section.props),
      })),
    };
  }
  return result;
}

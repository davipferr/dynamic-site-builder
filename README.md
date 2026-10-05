# Dynamic Site Builder (React)

A small **schema-driven / config-driven UI** site builder. Each "client" has a site described entirely as JSON, and React turns that JSON into a page.

## Run it

```bash
npm install
npm run dev
```

Open the URL Vite prints. Pick a client in the toolbar (or use `?site=studio` in the URL).

## How it works

```
site config (JSON)  ──►  PageRenderer  ──►  registry[type]  ──►  React components
        ▲
        └── Editor (forms generated from each section's `fields`)
```

| File | Role |
| --- | --- |
| `src/defaultSites.js` | Example data: one config per client |
| `src/registry.js` | Maps a `type` string to a React component |
| `src/sections/*.jsx` | Section components. Each one also declares `label`, `fields` (what's editable) and `defaults` |
| `src/renderer/PageRenderer.jsx` | Walks the config and renders sections; turns the theme into CSS variables |
| `src/editor/*` | Generic editor: builds forms from `fields`, produces a new config |
| `src/storage.js` | Persistence (localStorage today; swap for an API later) |

## Adding a new section type

1. Create `src/sections/MySection.jsx` with the component plus `MySection.label`, `MySection.fields` and `MySection.defaults`.
2. Add it to `src/registry.js`.

The editor and renderer pick it up automatically.

## Drag and drop

Sections, and the items inside list fields (feature cards, gallery images), can be reordered by dragging the ⠿ handle (built with `@dnd-kit`). It also works from the keyboard: Tab to a handle, press Space, use the arrow keys, then press Space again.

- `src/editor/Sortable.jsx`: the shared pieces (`SortableList`, `useSortableItem`, `DragHandle`). Every sortable list uses them, and nested lists each get their own `DndContext`, so dragging an image never moves its section.
- `src/ids.js`: drag and drop needs a stable `id` per item (array indexes change when items move). Ids are added automatically when data is loaded, so older saved configs keep working.

## Ideas for next steps

- Create and delete client sites from the UI
- Routing: a public `/site/:id` page without the editor (React Router)
- A backend: Node/Express + MongoDB (or Supabase) and replace `storage.js` with `fetch` calls
- Multiple pages per site (`pages: [{ path, sections }]`)
- Undo/redo (keep a history array of configs)

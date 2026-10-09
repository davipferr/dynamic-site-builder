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

## Forms: conditional fields and validation as JSON

The **Form** section is a mini Typeform. Each question can have a `showIf` condition and a list of `validation` rules. Both are plain JSON, so they're saved with the rest of the site config. The engine is in `src/forms/rules.js`.

```json
{
  "label": "What's your pet's name?",
  "name": "petName",
  "type": "text",
  "showIf": { "field": "hasPet", "equals": "yes" },
  "validation": [{ "rule": "required" }, { "rule": "maxLength", "value": 30 }]
}
```

**Conditions** (`showIf`, and `when` on a rule):

| Operator | Example |
| --- | --- |
| `equals`, `notEquals` | `{ "field": "hasPet", "equals": "yes" }` (text ignores case) |
| `in`, `notIn` | `{ "field": "plan", "in": ["Pro", "Business"] }` |
| `contains` | `{ "field": "topics", "contains": "design" }` (text or picked options) |
| `filled` | `{ "field": "phone", "filled": true }` |
| `gt`, `gte`, `lt`, `lte` | `{ "field": "age", "gte": 18, "lt": 65 }` (every operator must pass) |
| `all`, `any`, `not` | `{ "any": [ {…}, {…} ] }`, `{ "not": {…} }` |

**Rules**: `required`, `minLength`, `maxLength`, `min`, `max`, `email`, `pattern`, `sameAs` (`"field": "password"`), `minSelected`, `maxSelected`. Each rule can have a custom `message` and a `when` condition. Rules other than `required` skip empty answers, so optional fields can stay blank.

How it behaves:

- Questions are checked top to bottom, so a condition should point to a question **above** it. A hidden question counts as unanswered, so chains (C depends on B, B depends on A) collapse together.
- Hidden questions are never validated or submitted.
- In the editor, a JSON box only updates the config once it's valid JSON with known operators and rules. Until then it shows what's wrong.
- The editor uses the same engine for itself: any entry in a section's `fields` (or a list's `itemFields`) can have `showIf`. For example, "Options" only shows for select/radio questions.

## Ideas for next steps

- Create and delete client sites from the UI
- Routing: a public `/site/:id` page without the editor (React Router)
- A backend: Node/Express + MongoDB (or Supabase) and replace `storage.js` with `fetch` calls
- Multiple pages per site (`pages: [{ path, sections }]`)
- Undo/redo (keep a history array of configs)

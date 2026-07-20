# ww-stack

A draggable and sortable **stack** component for [weweb.io](https://www.weweb.io/), built on
[vuedraggable](https://github.com/SortableJS/vue.draggable.next) (SortableJS). It renders a
collection of items that users can reorder by dragging, and can drag items between multiple
stacks that share the same group — the building block for a kanban-style board.

## How it works

- Bind a list of data to the **Items** property. Each item is rendered through the `itemElement`
  dropzone, so you design the item's look once in WeWeb and it repeats for every entry.
- The component keeps its own `internalItems` copy of the list and syncs it whenever the bound
  data changes. Reordering mutates this internal copy and emits an event with the updated list —
  it does **not** write back to your data source, so you persist the new order yourself in the
  event workflow (e.g. update a collection or call an API).
- Set a **Group** to allow drag-and-drop between stacks: any stacks sharing the same group string
  can exchange items. This is how you build columns in a board.
- Items are tracked by a unique key (the `itemKey` component prop, defaulting to `id`) so the
  list stays stable while reordering.
- Dragging can be triggered from anywhere on an item (default) or restricted to a specific
  handle element via **Custom drag** + a class name.
- In the WeWeb editor, dragging is disabled while editing so you can select and configure items.
  It's also disabled when **Read only** is on.

### Drop preview

While an item is being dragged, a placeholder is shown at the position where it will be dropped.
It matches the dragged element's dimensions but renders as a styleable **dashed outline** (the
item's content is hidden) instead of a copy of the item. The outline is SortableJS's ghost
element, styled via the `previewBorder`, `previewBorderRadius` and `previewBackground` properties.

## Properties

### Settings

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `group` | Text | `common` | Stacks sharing this group can exchange items. |
| `items` | Array (bind) | `[]` | The collection of items to render and reorder. |
| `sortable` | On/Off | `true` | Allow reordering items within the stack. |
| `readonly` | On/Off | `false` | Disable drag-and-drop entirely. |
| `customDragHandle` | On/Off | `false` | Only start dragging from a specific handle element. |
| `handleClass` | Text | `draggable` | Class that marks the drag handle (when Custom drag is on). Add it to an element via Settings > HTML attributes > Class. |

### Style

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `direction` | Select | `vertical` | Stack items vertically or horizontally. |
| `wrap` | On/Off | `false` | Wrap items onto multiple lines. |
| `gap` | Number (px) | `0` | Space between items. |
| `showHeader` | On/Off | `false` | Show the header dropzone. |
| `showFooter` | On/Off | `false` | Show the footer dropzone. |
| `previewBorder` | Border | `2px dashed #9CA3AF` | Border of the drop placeholder. |
| `previewBorderRadius` | Spacing | `0px` | Corner radius of the drop placeholder. |
| `previewBackground` | Color | `transparent` | Background of the drop placeholder. |

## Slots (dropzones)

- **itemElement** — template rendered for each item (receives the item data and index).
- **headerElement** — content shown at the top of the stack (when Header is on).
- **footerElement** — content shown at the bottom of the stack (when Footer is on).

## Events

- **item:moved** — an item was reordered within the stack.
  `{ item, oldIndex, newIndex, updatedList }`
- **item:added** — an item was dropped into the stack from another stack.
  `{ item, newIndex, updatedList }`
- **item:removed** — an item was dragged out of the stack into another.
  `{ item, oldIndex, updatedList }`

## States & variables

- **readonly** — state applied while the stack is read-only.
- **isDragging** — internal boolean component variable, `true` while a drag is in progress.

## Development

Install dependencies:

```bash
npm i
```

Serve locally, then add the custom element in the WeWeb editor's developer popup:

```bash
npm run serve --port=[PORT]
```

Check for build errors before release (both flags are required, and note the `--`):

```bash
npm run build -- --name=ww-stack --type=wwobject
```

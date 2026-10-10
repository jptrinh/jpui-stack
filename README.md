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

### Item dragged

The item that follows the pointer is SortableJS's fallback copy, used for the mouse as well as touch
(`forceFallback`): the browser's native drag image is a snapshot CSS can't style. Its look is set by
`draggedTransform` (e.g. `scale(1.05) rotate(2deg)`, applied from the grab point and animated over the
Sort animation duration), `draggedOpacity` and `draggedBorder` (an overlay drawn by the item's `::after`, inside
its edges, over its content: it keeps the item's size and corner radius and follows the transform). A mouse press
only starts a drag after 3 px of movement, so clicks on items still work, and items aren't text-selectable.

On drag start, the device vibrates briefly (`hapticFeedback`). Android browsers only: iOS Safari has no
Vibration API.

## Properties

### Settings

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `group` | Text | `common` | Stacks sharing this group can exchange items. |
| `items` | Array (bind) | `[]` | The collection of items to render and reorder. |
| `sortable` | On/Off | `true` | Allow reordering items within the stack. |
| `readonly` | On/Off | `false` | Disable drag-and-drop entirely. |
| `hapticFeedback` | On/Off | `true` | Vibrate briefly when an item starts dragging (Android browsers only). |
| `touchDragDelay` | Number (ms) | `200` | Touch only: how long a finger must rest on an item before it drags. A finger that moves earlier scrolls the page; the mouse drags at once. `0` = drag at once (the old behaviour, which blocks scrolling over the items). |
| `customDragHandle` | On/Off | `false` | Only start dragging from a specific handle element. |
| `handleClass` | Text | `draggable` | Class that marks the drag handle (when Custom drag is on). Add it to an element via Settings > HTML attributes > Class. |

### Style

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `layout` | Select | `flex` | `flex` (a row or column, see Direction / Wrap) or `grid`. |
| `direction` | Select | `vertical` | Flex only: stack items vertically or horizontally. |
| `wrap` | On/Off | `false` | Flex only: wrap items onto multiple lines. |
| `gridTemplateColumns` | Text | `repeat(auto-fill, minmax(128px, 1fr))` | Grid only: any CSS `grid-template-columns` value. Rows align to the top; the header and footer span the full row. |
| `rowGap` / `columnGap` | Length | – | Space between rows / columns (px, rem or a token). Empty = the legacy Gap. |
| `gap` | Number (px) | `0` | Legacy, hidden in the editor: the fallback for Row gap / Column gap, so existing instances keep their spacing. |
| `animation` | Number (ms) | `150` | How long the other items take to move aside while dragging (0 = none). |
| `showHeader` | On/Off | `false` | Show the header dropzone. |
| `showFooter` | On/Off | `false` | Show the footer dropzone. |
| `previewBorder` | Border | `2px dashed #9CA3AF` | Border of the drop placeholder. |
| `previewBorderRadius` | Spacing | `0px` | Corner radius of the drop placeholder. |
| `previewBackground` | Color | `transparent` | Background of the drop placeholder. |
| `draggedTransform` | Text | – | CSS transform of the item that follows the pointer, e.g. `scale(1.05) rotate(2deg)`. Empty = none. |
| `draggedOpacity` | Number (0–1) | `0.8` | Opacity of the item that follows the pointer. |
| `draggedBorder` | Border | – | Border of the item that follows the pointer, drawn inside its edges (same size, same corner radius). Empty = none. |

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

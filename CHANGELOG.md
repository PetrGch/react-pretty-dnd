# Changelog

## 14.0.0

### Breaking changes

- Peer dependencies now require **React 18.2+ or React 19** (React 16/17 no longer supported).
- Prefer the new `environment` prop on `<DragDropContext />` over legacy `dndContext`.
- Removed unused `dndContext` props from `<Draggable />` / `<Droppable />` (pass environment only on the context).

### Features

- **`environment` prop** for Shadow DOM and encapsulated / proxy windows:

  ```js
  <DragDropContext
    environment={{ window, root: shadowRoot }}
    onDragEnd={onDragEnd}
  >
  ```

  - `window` — scroll, event bindings, `getComputedStyle`
  - `root` — `querySelectorAll` discovery (Document, ShadowRoot, or Element)
- Legacy `dndContext` still accepted for one major version (Window-like or query-root-like values are normalized).
- Shadow-aware scroll parent walking (`parentElement` → shadow `host`).

### React / tooling

- Upgraded to React 19 in development, `react-redux` 8, Testing Library (enzyme removed).
- CI image bumped to Node 20.
- Package version: **14.0.0**.

---

This project adheres to [Semantic Versioning 2.0](http://semver.org/).
Older release notes for the upstream fork history can be found on the original [Github Releases](https://github.com/atlassian/react-beautiful-dnd/releases) page.

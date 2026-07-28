// @flow

export type QueryRoot = Document | ShadowRoot | Element;

export type DragDropEnvironment = {|
  // Host window used for scroll, events, and getComputedStyle
  window: typeof window,
  // Root used for querySelector / querySelectorAll (Document, ShadowRoot, or Element)
  root: QueryRoot,
  // Document associated with the window (styles, body, announcer nodes)
  document: Document,
|};

export type EnvironmentInput = {|
  window: typeof window,
  root?: QueryRoot,
|};

// Legacy overloaded value: Window-like OR query-root-like
export type LegacyDndContext = any;

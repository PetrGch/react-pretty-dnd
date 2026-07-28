// @flow
import { warning } from '../../dev-warning';
import type {
  DragDropEnvironment,
  EnvironmentInput,
  LegacyDndContext,
  QueryRoot,
} from './types';

function isWindowLike(value: mixed): boolean %checks {
  return (
    value != null &&
    typeof value === 'object' &&
    // pageXOffset exists on Window; ShadowRoot / Element do not
    typeof (value: any).pageXOffset === 'number' &&
    (value: any).document != null
  );
}

function isQueryRoot(value: mixed): boolean %checks {
  return (
    value != null &&
    typeof value === 'object' &&
    typeof (value: any).querySelectorAll === 'function'
  );
}

function getDefaultWindow(): typeof window {
  // SSR / node: no global window. Effects that need a real window are
  // skipped via useIsomorphicLayoutEffect (useEffect on the server).
  if (typeof window === 'undefined') {
    // $FlowFixMe - intentional SSR placeholder
    return {
      document: {
        querySelectorAll: () => [],
        querySelector: () => null,
        createElement: () => ({}),
        body: null,
        head: null,
      },
      pageXOffset: 0,
      pageYOffset: 0,
      addEventListener() {},
      removeEventListener() {},
    };
  }
  return window;
}

export function createEnvironment(
  input?: ?EnvironmentInput,
): DragDropEnvironment {
  const win: typeof window = (input && input.window) || getDefaultWindow();
  const doc: Document = win.document;
  const root: QueryRoot = (input && input.root) || doc;

  return {
    window: win,
    document: doc,
    root,
  };
}

export function normalizeEnvironment(args: {|
  environment?: ?EnvironmentInput,
  // legacy prop — Window OR query root
  dndContext?: LegacyDndContext,
|}): DragDropEnvironment {
  const { environment, dndContext } = args;

  if (environment) {
    if (process.env.NODE_ENV !== 'production' && dndContext != null) {
      warning(`
        You have provided both "environment" and legacy "dndContext" to <DragDropContext />.
        "environment" will be used and "dndContext" will be ignored.
      `);
    }
    return createEnvironment(environment);
  }

  if (dndContext == null) {
    return createEnvironment();
  }

  // Window-like → use as window + document as root
  if (isWindowLike(dndContext)) {
    return createEnvironment({
      window: dndContext,
      root: dndContext.document,
    });
  }

  // Query-root-like (ShadowRoot / Document / Element) → keep global window
  if (isQueryRoot(dndContext)) {
    if (process.env.NODE_ENV !== 'production') {
      warning(`
        Legacy "dndContext" was provided as a query root (ShadowRoot/Document/Element).
        The global window will still be used for scroll and event bindings.
        Prefer the "environment" prop: { window, root } for full Shadow DOM support.
      `);
    }
    return createEnvironment({
      window: getDefaultWindow(),
      root: dndContext,
    });
  }

  if (process.env.NODE_ENV !== 'production') {
    warning(`
      Invalid "dndContext" value provided to <DragDropContext />.
      Falling back to the global window / document.
    `);
  }

  return createEnvironment();
}

export default createEnvironment;

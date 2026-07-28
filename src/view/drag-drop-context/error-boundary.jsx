// @flow
import React, { type Node } from 'react';
import { warning, error } from '../../dev-warning';
import { noop } from '../../empty';
import bindEvents from '../event-bindings/bind-events';
import { RbdInvariant } from '../../invariant';
import type { AppCallbacks } from './drag-drop-context-types';

type Props = {|
  children: (setCallbacks: (callbacks: AppCallbacks) => void) => Node,
  window?: typeof window,
|};

type State = {|
  // Flipped on rbd invariant so React 19 recovers via getDerivedStateFromError
  hasRbdError: boolean,
|};

// Lame that this is not in flow
type ErrorEvent = Event & {
  error: ?Error,
};

export default class ErrorBoundary extends React.Component<Props, State> {
  // Last mounted boundary — used to abort drag from getDerivedStateFromError
  // (React 19 may recover without calling componentDidCatch in some paths)
  static latest: ?ErrorBoundary = null;

  callbacks: ?AppCallbacks = null;
  unbind: () => void = noop;
  state: State = { hasRbdError: false };

  componentDidMount() {
    const win: typeof window = this.props.window || window;
    this.unbind = bindEvents(win, [
      {
        eventName: 'error',
        fn: this.onWindowError,
      },
    ]);
  }

  // React 19 requires getDerivedStateFromError for error recovery
  static getDerivedStateFromError(err: mixed): ?State {
    if (err instanceof RbdInvariant) {
      const boundary: ?ErrorBoundary = ErrorBoundary.latest;
      if (boundary && boundary.callbacks && boundary.callbacks.isDragging()) {
        boundary.callbacks.tryAbort();
      }

      if (process.env.NODE_ENV !== 'production') {
        // $FlowFixMe - message exists on RbdInvariant
        error(err.message);
      }

      return { hasRbdError: true };
    }
    // Re-throw so parent boundaries / React can handle non-rbd errors
    // eslint-disable-next-line no-restricted-syntax
    throw err;
  }

  componentDidCatch(err: mixed) {
    if (err instanceof RbdInvariant) {
      // Abort again defensively (no-op if already aborted in GDSFE)
      if (this.callbacks && this.callbacks.isDragging()) {
        this.callbacks.tryAbort();
      }
      // Allow future errors to be handled again
      this.setState({ hasRbdError: false });
      return;
    }

    // throwing error for other error boundaries
    // eslint-disable-next-line no-restricted-syntax
    throw err;
  }

  componentWillUnmount() {
    this.unbind();
    if (ErrorBoundary.latest === this) {
      ErrorBoundary.latest = null;
    }
  }

  onWindowError = (event: ErrorEvent) => {
    const callbacks: AppCallbacks = this.getCallbacks();

    if (callbacks.isDragging()) {
      callbacks.tryAbort();
      warning(`
        An error was caught by our window 'error' event listener while a drag was occurring.
        The active drag has been aborted.
      `);
    }

    const err: ?Error = event.error;

    if (err instanceof RbdInvariant) {
      // Marking the event as dealt with.
      // This will prevent any 'uncaught' error warnings in the console
      event.preventDefault();
      if (process.env.NODE_ENV !== 'production') {
        error(err.message);
      }
    }
  };

  getCallbacks = (): AppCallbacks => {
    if (!this.callbacks) {
      // eslint-disable-next-line no-restricted-syntax
      throw new Error('Unable to find AppCallbacks in <ErrorBoundary/>');
    }
    return this.callbacks;
  };

  setCallbacks = (callbacks: AppCallbacks) => {
    this.callbacks = callbacks;
  };

  render() {
    ErrorBoundary.latest = this;
    return this.props.children(this.setCallbacks);
  }
}

// @flow
import type { Position } from 'css-box-model';
import rafSchd from 'raf-schd';
import { invariant } from '../invariant';
import bindEvents from './event-bindings/bind-events';
import type { EventBinding } from './event-bindings/event-types';
import getWindowScroll from './window/get-window-scroll';
import { noop } from '../empty';
import type { DragDropEnvironment } from './environment';

type OnWindowScroll = (newScroll: Position) => void;

type Args = {|
  onWindowScroll: OnWindowScroll,
  environment?: ?DragDropEnvironment,
|};

type Result = {|
  start: () => void,
  stop: () => void,
  isActive: () => boolean,
|};

function getWindowScrollBinding(
  update: () => void,
  win: typeof window,
): EventBinding {
  return {
    eventName: 'scroll',
    // ## Passive: true
    // Eventual consistency is fine because we use position: fixed on the item
    // ## Capture: false
    // Scroll events on elements do not bubble, but they go through the capture phase
    // https://twitter.com/alexandereardon/status/985994224867819520
    // Using capture: false here as we want to avoid intercepting droppable scroll requests
    options: { passive: true, capture: false },
    fn: (event: UIEvent) => {
      // IE11 fix
      // All scrollable events still bubble up and are caught by this handler in ie11.
      // On a window scroll the event.target should be the window or the document.
      // If this is not the case then it is not a 'window' scroll event and can be ignored
      if (event.target !== win && event.target !== win.document) {
        return;
      }

      update();
    },
  };
}

export default function getScrollListener({
  onWindowScroll,
  environment,
}: Args): Result {
  const win: typeof window = environment ? environment.window : window;

  function updateScroll() {
    // letting the update function read the latest scroll when called
    onWindowScroll(getWindowScroll(win));
  }

  const scheduled = rafSchd(updateScroll);
  const binding: EventBinding = getWindowScrollBinding(scheduled, win);
  let unbind: () => void = noop;

  function isActive(): boolean {
    return unbind !== noop;
  }

  function start() {
    invariant(!isActive(), 'Cannot start scroll listener when already active');
    // $FlowFixMe - window is an EventTarget
    unbind = bindEvents(win, [binding]);
  }
  function stop() {
    invariant(isActive(), 'Cannot stop scroll listener when not active');
    scheduled.cancel();
    unbind();
    unbind = noop;
  }

  return { start, stop, isActive };
}

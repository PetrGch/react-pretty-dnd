// @flow
import getClosestScrollable, {
  getParentCrossingShadow,
} from './get-closest-scrollable';
import type { DragDropEnvironment } from '../environment';

export type Env = {|
  closestScrollable: ?Element,
  isFixedOnPage: boolean,
|};

// TODO: do this check at the same time as the closest scrollable
// in order to avoid double calling getComputedStyle
// Do this when we move to multiple scroll containers
const getIsFixed = (
  el: ?Element,
  win: typeof window,
): boolean => {
  if (!el) {
    return false;
  }
  const style: CSSStyleDeclaration = win.getComputedStyle(el);
  if (style.position === 'fixed') {
    return true;
  }
  return getIsFixed(getParentCrossingShadow(el), win);
};

export default (
  start: Element,
  environment?: ?DragDropEnvironment,
): Env => {
  const win: typeof window = environment ? environment.window : window;
  const closestScrollable: ?Element = getClosestScrollable(start, environment);
  const isFixedOnPage: boolean = getIsFixed(start, win);

  return {
    closestScrollable,
    isFixedOnPage,
  };
};

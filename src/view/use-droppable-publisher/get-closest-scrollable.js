// @flow
import { invariant } from '../../invariant';
import { warning } from '../../dev-warning';
import getBodyElement from '../get-body-element';
import type { DragDropEnvironment } from '../environment';

type Overflow = {|
  overflowX: string,
  overflowY: string,
|};

const isEqual = (base: string) => (value: string): boolean => base === value;
const isScroll = isEqual('scroll');
const isAuto = isEqual('auto');
const isVisible = isEqual('visible');
const isEither = (overflow: Overflow, fn: (value: string) => boolean) =>
  fn(overflow.overflowX) || fn(overflow.overflowY);
const isBoth = (overflow: Overflow, fn: (value: string) => boolean) =>
  fn(overflow.overflowX) && fn(overflow.overflowY);

// Walk parent chain, crossing open Shadow DOM boundaries via host
export function getParentCrossingShadow(el: Element): ?Element {
  if (el.parentElement) {
    return el.parentElement;
  }

  // At a shadow root edge: continue from the host element
  // nodeType 11 === DOCUMENT_FRAGMENT_NODE (ShadowRoot)
  const root: Node | Document = el.getRootNode ? el.getRootNode() : el;
  if (
    root &&
    root.nodeType === 11 &&
    // $FlowFixMe - ShadowRoot.host
    typeof (root: any).host === 'object' &&
    (root: any).host
  ) {
    return (root: any).host;
  }

  return null;
}

const isElementScrollable = (
  el: Element,
  win: typeof window,
): boolean => {
  const style: CSSStyleDeclaration = win.getComputedStyle(el);
  const overflow: Overflow = {
    overflowX: style.overflowX,
    overflowY: style.overflowY,
  };

  return isEither(overflow, isScroll) || isEither(overflow, isAuto);
};

// Special case for a body element
// Playground: https://codepen.io/alexreardon/pen/ZmyLgX?editors=1111
const isBodyScrollable = (
  env?: ?DragDropEnvironment,
  win: typeof window,
): boolean => {
  // Because we always return false for now, we can skip any actual processing in production
  if (process.env.NODE_ENV === 'production') {
    return false;
  }

  const body: HTMLBodyElement = getBodyElement(env);
  const doc: Document = env ? env.document : document;
  const html: ?HTMLElement = doc.documentElement;
  invariant(html);

  // 1. The `body` has `overflow-[x|y]: auto | scroll`
  if (!isElementScrollable(body, win)) {
    return false;
  }

  const htmlStyle: CSSStyleDeclaration = win.getComputedStyle(html);
  const htmlOverflow: Overflow = {
    overflowX: htmlStyle.overflowX,
    overflowY: htmlStyle.overflowY,
  };

  if (isBoth(htmlOverflow, isVisible)) {
    return false;
  }

  warning(`
    We have detected that your <body> element might be a scroll container.
    We have found no reliable way of detecting whether the <body> element is a scroll container.
    Under most circumstances a <body> scroll bar will be on the <html> element (document.documentElement)

    Because we cannot determine if the <body> is a scroll container, and generally it is not one,
    we will be treating the <body> as *not* a scroll container

    More information: https://github.com/atlassian/react-beautiful-dnd/blob/master/docs/guides/how-we-detect-scroll-containers.md
  `);
  return false;
};

const getClosestScrollable = (
  el: ?Element,
  env?: ?DragDropEnvironment,
): ?Element => {
  const win: typeof window = env ? env.window : window;
  const doc: Document = env ? env.document : document;

  // cannot do anything else!
  if (el == null) {
    return null;
  }

  // not allowing us to go higher then body
  if (el === doc.body) {
    return isBodyScrollable(env, win) ? el : null;
  }

  // Should never get here, but just being safe
  if (el === doc.documentElement) {
    return null;
  }

  if (!isElementScrollable(el, win)) {
    // keep recursing — including across shadow boundaries
    return getClosestScrollable(getParentCrossingShadow(el), env);
  }

  // success!
  return el;
};

export default getClosestScrollable;

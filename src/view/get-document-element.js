// @flow
import { invariant } from '../invariant';
import type { DragDropEnvironment } from './environment';

export default (env?: ?DragDropEnvironment): HTMLElement => {
  const doc: Document = env ? env.document : document;
  const el: ?HTMLElement = doc.documentElement;
  invariant(el, 'Cannot find document.documentElement');
  return el;
};

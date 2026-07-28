// @flow
import { invariant } from '../invariant';
import type { DragDropEnvironment } from './environment';

export default (env?: ?DragDropEnvironment): HTMLBodyElement => {
  const doc: Document = env ? env.document : document;
  const body: ?HTMLBodyElement = doc.body;
  invariant(body, 'Cannot find document.body');
  return body;
};

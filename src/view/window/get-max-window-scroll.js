// @flow
import type { Position } from 'css-box-model';
import getMaxScroll from '../../state/get-max-scroll';
import getDocumentElement from '../get-document-element';
import type { DragDropEnvironment } from '../environment';

export default (env?: ?DragDropEnvironment): Position => {
  const doc: HTMLElement = getDocumentElement(env);

  const maxScroll: Position = getMaxScroll({
    // unclipped padding box, with scrollbar
    scrollHeight: doc.scrollHeight,
    scrollWidth: doc.scrollWidth,
    // clipped padding box, without scrollbar
    width: doc.clientWidth,
    height: doc.clientHeight,
  });

  return maxScroll;
};

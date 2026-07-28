// @flow
import type { PlaceholderStyle } from '../../../../../src/view/placeholder/placeholder-types';
import { placeholder } from './data';
import * as attributes from '../../../../../src/view/data-attributes';

const parsePx = (value: string): number => {
  if (!value) {
    return 0;
  }
  return parseFloat(value);
};

export default (container: HTMLElement): PlaceholderStyle => {
  const el: ?HTMLElement = container.querySelector(
    `[${attributes.placeholder.contextId}]`,
  );
  if (!el) {
    throw new Error('Unable to find placeholder element');
  }

  return {
    display: el.style.display || placeholder.display,
    boxSizing: 'border-box',
    width: parsePx(el.style.width),
    height: parsePx(el.style.height),
    marginTop: parsePx(el.style.marginTop),
    marginRight: parsePx(el.style.marginRight),
    marginBottom: parsePx(el.style.marginBottom),
    marginLeft: parsePx(el.style.marginLeft),
    flexShrink: '0',
    flexGrow: '0',
    pointerEvents: 'none',
    transition: el.style.transition,
  };
};

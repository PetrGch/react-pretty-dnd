// @flow
import { type Position } from 'css-box-model';

// Not guarenteed to scroll by the entire amount
export default (change: Position, win?: typeof window = window): void => {
  win.scrollBy(change.x, change.y);
};

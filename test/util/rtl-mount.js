// @flow
import React, { type Element } from 'react';
import { render, type RenderResult } from '@testing-library/react';

export type Wrapper = {|
  ...RenderResult,
  setProps: (next: Object) => void,
  getDOMNode: () => HTMLElement,
  unmount: () => void,
|};

// Enzyme-compatible mount helper on top of @testing-library/react.
// Supports setProps / getDOMNode / unmount used throughout legacy unit specs.
export default function mount(ui: Element<any>): Wrapper {
  const Type = ui.type;
  let currentProps: Object = ui.props;
  const result = render(React.createElement(Type, currentProps));

  return {
    ...result,
    setProps(next: Object) {
      currentProps = { ...currentProps, ...next };
      result.rerender(React.createElement(Type, currentProps));
    },
    getDOMNode(): HTMLElement {
      const el: ?HTMLElement = (result.container.firstElementChild: any);
      if (!el) {
        throw new Error('Unable to find DOM node');
      }
      return el;
    },
    unmount() {
      result.unmount();
    },
  };
}

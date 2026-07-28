// @flow
import React from 'react';
import Placeholder from './util/placeholder-with-class';
import { expectIsFull } from './util/expect';
import getPlaceholderStyle from './util/get-placeholder-style';
import { placeholder } from './util/data';
import mount, { type Wrapper } from '../../../util/rtl-mount';
import fireTransitionEnd from '../../../util/fire-transition-end';

it('should only fire a single onClose event', () => {
  const onClose = jest.fn();

  const wrapper: Wrapper = mount(
    <Placeholder
      contextId="1"
      animate="none"
      placeholder={placeholder}
      onClose={onClose}
      onTransitionEnd={jest.fn()}
    />,
  );
  expectIsFull(getPlaceholderStyle(wrapper.container));

  wrapper.setProps({
    animate: 'close',
  });

  const el: HTMLElement = wrapper.getDOMNode();
  fireTransitionEnd(el, 'height');
  expect(onClose).toHaveBeenCalledTimes(1);
  onClose.mockClear();

  // transition events while animate="closed" of different properties will not trigger
  fireTransitionEnd(el, 'margin');
  fireTransitionEnd(el, 'width');
  expect(onClose).not.toHaveBeenCalled();
});

it('should not fire an onClose if not closing when a transitionend occurs', () => {
  const onClose = jest.fn();

  const wrapper: Wrapper = mount(
    <Placeholder
      animate="none"
      contextId="1"
      placeholder={placeholder}
      onClose={onClose}
      onTransitionEnd={jest.fn()}
    />,
  );
  const assert = () => {
    fireTransitionEnd(wrapper.getDOMNode(), 'height');
    expect(onClose).not.toHaveBeenCalled();
    onClose.mockClear();
  };
  expectIsFull(getPlaceholderStyle(wrapper.container));
  assert();

  wrapper.setProps({ animate: 'open' });
  assert();
});

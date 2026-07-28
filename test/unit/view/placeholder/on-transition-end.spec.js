// @flow
import React from 'react';
import { act } from '@testing-library/react';
import Placeholder from './util/placeholder-with-class';
import { expectIsFull } from './util/expect';
import getPlaceholderStyle from './util/get-placeholder-style';
import { placeholder } from './util/data';
import mount, { type Wrapper } from '../../../util/rtl-mount';
import fireTransitionEnd from '../../../util/fire-transition-end';

jest.useFakeTimers();

it('should only fire a single transitionend event a single time when transitioning multiple properties', () => {
  const onTransitionEnd = jest.fn();
  const onClose = jest.fn();

  const wrapper: Wrapper = mount(
    <Placeholder
      animate="open"
      placeholder={placeholder}
      onClose={onClose}
      onTransitionEnd={onTransitionEnd}
      contextId="hey"
    />,
  );
  // finish the animate open timer
  act(() => {
    jest.runOnlyPendingTimers();
  });
  expectIsFull(getPlaceholderStyle(wrapper.container));

  const el: HTMLElement = wrapper.getDOMNode();

  // first event: a 'height' event will trigger the handler
  fireTransitionEnd(el, 'height');
  expect(onTransitionEnd).toHaveBeenCalledTimes(1);
  onTransitionEnd.mockClear();

  // subsequent transition events will not trigger
  fireTransitionEnd(el, 'margin');
  fireTransitionEnd(el, 'width');
  expect(onTransitionEnd).not.toHaveBeenCalled();

  // another transition event of height would trigger the handler
  fireTransitionEnd(el, 'height');
  expect(onTransitionEnd).toHaveBeenCalledTimes(1);

  // validate: this should not have triggered any close events
  expect(onClose).not.toHaveBeenCalled();
});

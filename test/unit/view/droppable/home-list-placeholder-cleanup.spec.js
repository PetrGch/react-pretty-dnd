// @flow
import { act } from '@testing-library/react';
import { invariant } from '../../../../src/invariant';
import mount, { type DroppableWrapper } from './util/mount';
import {
  homeOwnProps,
  isNotOverHome,
  homeAtRest,
  homePostDropAnimation,
} from './util/get-props';
import * as attributes from '../../../../src/view/data-attributes';
import fireTransitionEnd from '../../../util/fire-transition-end';

const getPlaceholder = (wrapper: DroppableWrapper): ?HTMLElement =>
  wrapper.container.querySelector(`[${attributes.placeholder.contextId}]`);

it('should not display a placeholder after a flushed drag end in the home list', () => {
  // dropping
  const wrapper: DroppableWrapper = mount({
    ownProps: homeOwnProps,
    mapProps: isNotOverHome,
  });

  expect(getPlaceholder(wrapper)).toBeTruthy();

  wrapper.setProps({
    ...homeAtRest,
  });

  expect(getPlaceholder(wrapper)).toBeNull();
});

it('should animate a placeholder closed in a home list after a drag', () => {
  // dropping
  const wrapper: DroppableWrapper = mount({
    ownProps: homeOwnProps,
    mapProps: isNotOverHome,
  });

  expect(getPlaceholder(wrapper)).toBeTruthy();

  wrapper.setProps({
    ...homePostDropAnimation,
  });

  expect(getPlaceholder(wrapper)).toBeTruthy();
  expect(homePostDropAnimation.shouldAnimatePlaceholder).toBe(true);

  // finishing the animation
  act(() => {
    const el: ?HTMLElement = getPlaceholder(wrapper);
    invariant(el);
    fireTransitionEnd(el, 'height');
  });

  // placeholder is now gone
  expect(getPlaceholder(wrapper)).toBeNull();
});

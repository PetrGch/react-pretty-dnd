// @flow
import { invariant } from '../../../../src/invariant';
import mount, { type DroppableWrapper } from './util/mount';
import { homeOwnProps, isOverHome, isNotOverHome } from './util/get-props';
import type { DispatchProps } from '../../../../src/view/droppable/droppable-types';
import getMaxWindowScroll from '../../../../src/view/window/get-max-window-scroll';
import { createEnvironment } from '../../../../src/view/environment';
import * as attributes from '../../../../src/view/data-attributes';
import fireTransitionEnd from '../../../util/fire-transition-end';

const getPlaceholder = (wrapper: DroppableWrapper): HTMLElement => {
  const el: ?HTMLElement = wrapper.container.querySelector(
    `[${attributes.placeholder.contextId}]`,
  );
  invariant(el);
  return el;
};

it('should update when a placeholder animation finishes', () => {
  const dispatchProps: DispatchProps = {
    updateViewportMaxScroll: jest.fn(),
  };
  const wrapper: DroppableWrapper = mount({
    ownProps: homeOwnProps,
    mapProps: isOverHome,
    dispatchProps,
    isMovementAllowed: () => true,
  });

  fireTransitionEnd(getPlaceholder(wrapper), 'height');

  expect(dispatchProps.updateViewportMaxScroll).toHaveBeenCalledWith({
    maxScroll: getMaxWindowScroll(createEnvironment()),
  });
});

it('should update when a placeholder finishes and the list is not dragged over', () => {
  const dispatchProps: DispatchProps = {
    updateViewportMaxScroll: jest.fn(),
  };
  const wrapper: DroppableWrapper = mount({
    ownProps: homeOwnProps,
    mapProps: isNotOverHome,
    dispatchProps,
    isMovementAllowed: () => true,
  });

  fireTransitionEnd(getPlaceholder(wrapper), 'height');

  expect(dispatchProps.updateViewportMaxScroll).toHaveBeenCalledWith({
    maxScroll: getMaxWindowScroll(createEnvironment()),
  });
});

it('should not update when dropping', () => {
  const dispatchProps: DispatchProps = {
    updateViewportMaxScroll: jest.fn(),
  };
  const wrapper: DroppableWrapper = mount({
    ownProps: homeOwnProps,
    mapProps: isNotOverHome,
    dispatchProps,
    // when dropping there is no movement allowed
    isMovementAllowed: () => false,
  });

  fireTransitionEnd(getPlaceholder(wrapper), 'height');

  expect(dispatchProps.updateViewportMaxScroll).not.toHaveBeenCalled();
});

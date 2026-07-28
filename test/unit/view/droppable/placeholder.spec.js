// @flow
import mount, { type DroppableWrapper } from './util/mount';
import {
  foreignOwnProps,
  isOverForeign,
  homeOwnProps,
  isOverHome,
  isNotOverHome,
  homeAtRest,
  isNotOverForeign,
} from './util/get-props';
import * as attributes from '../../../../src/view/data-attributes';

const getPlaceholder = (wrapper: DroppableWrapper): ?HTMLElement =>
  wrapper.container.querySelector(`[${attributes.placeholder.contextId}]`);

describe('home list', () => {
  it('should not render a placeholder when not dragging', () => {
    const wrapper: DroppableWrapper = mount({
      ownProps: homeOwnProps,
      mapProps: homeAtRest,
    });

    expect(getPlaceholder(wrapper)).toBeNull();
  });

  it('should render a placeholder when dragging over', () => {
    const wrapper: DroppableWrapper = mount({
      ownProps: homeOwnProps,
      mapProps: isOverHome,
    });

    expect(getPlaceholder(wrapper)).toBeTruthy();
  });

  it('should render a placeholder when dragging over nothing', () => {
    const wrapper: DroppableWrapper = mount({
      ownProps: homeOwnProps,
      mapProps: isNotOverHome,
    });

    expect(getPlaceholder(wrapper)).toBeTruthy();
  });

  it('should render a placeholder when dragging over a foreign list', () => {
    const wrapper: DroppableWrapper = mount({
      ownProps: homeOwnProps,
      mapProps: isOverForeign,
    });

    expect(getPlaceholder(wrapper)).toBeTruthy();
  });
});

describe('foreign', () => {
  it('should not render a placeholder when not dragging', () => {
    const wrapper: DroppableWrapper = mount({
      ownProps: foreignOwnProps,
      mapProps: homeAtRest,
    });

    expect(getPlaceholder(wrapper)).toBeNull();
  });

  it('should render a placeholder when dragging over', () => {
    const wrapper: DroppableWrapper = mount({
      ownProps: foreignOwnProps,
      mapProps: isOverForeign,
    });

    expect(getPlaceholder(wrapper)).toBeTruthy();
  });

  it('should not render a placeholder when over nothing', () => {
    const wrapper: DroppableWrapper = mount({
      ownProps: foreignOwnProps,
      mapProps: isNotOverForeign,
    });

    expect(getPlaceholder(wrapper)).toBeNull();
  });
});

// @flow
import React, { useMemo } from 'react';
import { render, type RenderResult } from '@testing-library/react';
import type {
  MapProps,
  OwnProps,
  Provided,
  DispatchProps,
  StateSnapshot,
} from '../../../../../src/view/droppable/droppable-types';
import Droppable from '../../../../../src/view/droppable/droppable';
import {
  homeOwnProps,
  homeAtRest,
  dispatchProps as defaultDispatchProps,
} from './get-props';
import getStubber from './get-stubber';
import { getMarshalStub } from '../../../../util/dimension-marshal';
import AppContext, {
  type AppContextValue,
} from '../../../../../src/view/context/app-context';
import createRegistry from '../../../../../src/state/registry/create-registry';
import useFocusMarshal from '../../../../../src/view/use-focus-marshal';
import { createEnvironment } from '../../../../../src/view/environment';

type MountArgs = {|
  WrappedComponent?: any,
  ownProps?: OwnProps,
  mapProps?: MapProps,
  dispatchProps?: DispatchProps,
  isMovementAllowed?: () => boolean,
|};

type AppProps = {|
  ...OwnProps,
  ...MapProps,
  ...DispatchProps,
  isMovementAllowed: () => boolean,
  WrappedComponent: any,
|};

function App(props: AppProps) {
  const { WrappedComponent, isMovementAllowed, ...rest } = props;
  const contextId = '1';

  const focus = useFocusMarshal(contextId);
  const context: AppContextValue = useMemo(
    () => ({
      focus,
      contextId,
      canLift: () => true,
      isMovementAllowed,
      dragHandleUsageInstructionsId: 'fake-id',
      marshal: getMarshalStub(),
      registry: createRegistry(),
      environment: createEnvironment(),
      tryAbort: () => {},
    }),
    [focus, isMovementAllowed],
  );

  return (
    <AppContext.Provider value={context}>
      <Droppable {...rest}>
        {(provided: Provided, snapshot: StateSnapshot) => (
          <WrappedComponent provided={provided} snapshot={snapshot} />
        )}
      </Droppable>
    </AppContext.Provider>
  );
}

export type DroppableWrapper = {|
  ...RenderResult,
  setProps: (next: Object) => void,
  getDOMNode: () => HTMLElement,
  unmount: () => void,
|};

export default ({
  WrappedComponent = getStubber(),
  ownProps = homeOwnProps,
  mapProps = homeAtRest,
  dispatchProps = defaultDispatchProps,
  isMovementAllowed = () => true,
}: MountArgs = {}): DroppableWrapper => {
  let currentProps = {
    ...ownProps,
    ...mapProps,
    ...dispatchProps,
    isMovementAllowed,
    WrappedComponent,
  };

  const result = render(<App {...currentProps} />);

  return {
    ...result,
    setProps(next: Object) {
      currentProps = { ...currentProps, ...next };
      result.rerender(<App {...currentProps} />);
    },
    getDOMNode() {
      const el: ?HTMLElement = result.container.firstElementChild;
      if (!el) {
        throw new Error('Unable to find droppable DOM node');
      }
      return el;
    },
    unmount() {
      result.unmount();
    },
  };
};

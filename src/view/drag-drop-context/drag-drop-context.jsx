// @flow
import React, { type Node } from 'react';
import { useMemo } from 'use-memo-one';
import type { Responders, ContextId, Sensor } from '../../types';
import ErrorBoundary from './error-boundary';
import preset from '../../screen-reader-message-preset';
import App from './app';
import useUniqueContextId, {
  reset as resetContextId,
} from './use-unique-context-id';
import { reset as resetUniqueIds } from '../use-unique-id';
import {
  normalizeEnvironment,
  type EnvironmentInput,
  type LegacyDndContext,
  type DragDropEnvironment,
} from '../environment';

type Props = {|
  ...Responders,
  // We do not technically need any children for this component
  children: Node | null,
  // Read out by screen readers when focusing on a drag handle
  dragHandleUsageInstructions?: string,
  // Used for strict content security policies
  // See our [content security policy guide](/docs/guides/content-security-policy.md)
  nonce?: string,
  // See our [sensor api](/docs/sensors/sensor-api.md)
  sensors?: Sensor[],
  enableDefaultSensors?: ?boolean,
  // Preferred: pass host window + optional ShadowRoot/query root
  environment?: EnvironmentInput,
  // Legacy: Window OR query root. Prefer "environment".
  dndContext?: LegacyDndContext,
|};

// Reset any context that gets persisted across server side renders
export function resetServerContext() {
  resetContextId();
  resetUniqueIds();
}

export default function DragDropContext(props: Props) {
  const contextId: ContextId = useUniqueContextId();
  const dragHandleUsageInstructions: string =
    props.dragHandleUsageInstructions || preset.dragHandleUsageInstructions;

  // Stabilize environment so App does not recreate the Redux store on
  // every parent re-render (e.g. onBeforeCapture setState + flushSync).
  const environment: DragDropEnvironment = useMemo(
    () =>
      normalizeEnvironment({
        environment: props.environment,
        dndContext: props.dndContext,
      }),
    [props.environment, props.dndContext],
  );

  // We need the error boundary to be on the outside of App
  // so that it can catch any errors caused by App
  return (
    <ErrorBoundary window={environment.window}>
      {(setCallbacks) => (
        <App
          nonce={props.nonce}
          contextId={contextId}
          setCallbacks={setCallbacks}
          dragHandleUsageInstructions={dragHandleUsageInstructions}
          enableDefaultSensors={props.enableDefaultSensors}
          sensors={props.sensors}
          onBeforeCapture={props.onBeforeCapture}
          onBeforeDragStart={props.onBeforeDragStart}
          onDragStart={props.onDragStart}
          onDragUpdate={props.onDragUpdate}
          onDragEnd={props.onDragEnd}
          environment={environment}
        >
          {props.children}
        </App>
      )}
    </ErrorBoundary>
  );
}

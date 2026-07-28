// @flow
import { useEffect } from 'react';
import { useMemo } from 'use-memo-one';
import type { ContextId, ElementId } from '../../types';
import getBodyElement from '../get-body-element';
import useUniqueId from '../use-unique-id';
import type { DragDropEnvironment } from '../environment';

type GetIdArgs = {|
  contextId: ContextId,
  uniqueId: string,
|};

export function getElementId({ contextId, uniqueId }: GetIdArgs): ElementId {
  return `rbd-hidden-text-${contextId}-${uniqueId}`;
}

type Args = {|
  contextId: ContextId,
  text: string,
  environment?: DragDropEnvironment,
|};

export default function useHiddenTextElement({
  contextId,
  text,
  environment,
}: Args): ElementId {
  const uniqueId: string = useUniqueId('hidden-text', { separator: '-' });
  const id: ElementId = useMemo(() => getElementId({ contextId, uniqueId }), [
    uniqueId,
    contextId,
  ]);

  useEffect(
    function mount() {
      const doc: Document = environment ? environment.document : document;
      const el: HTMLElement = doc.createElement('div');

      // identifier
      el.id = id;

      // add the description text
      el.textContent = text;

      // Using `display: none` prevent screen readers from reading this element in the document flow
      el.style.display = 'none';

      // Add to body
      getBodyElement(environment).appendChild(el);

      return function unmount() {
        // checking if element exists as the body might have been changed by things like 'turbolinks'
        const body: HTMLBodyElement = getBodyElement(environment);
        if (body.contains(el)) {
          body.removeChild(el);
        }
      };
    },
    [environment, id, text],
  );

  return id;
}

// @flow
import React, { useState, useEffect, useRef, type Node } from 'react';
import ReactDOM from 'react-dom';
import { storiesOf } from '@storybook/react';
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from '../../src';

type Item = {| id: string, content: string |};

const initial: Item[] = [
  { id: '1', content: 'Shadow item 1' },
  { id: '2', content: 'Shadow item 2' },
  { id: '3', content: 'Shadow item 3' },
];

function List({ shadowRoot }: {| shadowRoot: ShadowRoot |}): Node {
  const [items, setItems] = useState<Item[]>(initial);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }
    const next = Array.from(items);
    const [removed] = next.splice(result.source.index, 1);
    next.splice(result.destination.index, 0, removed);
    setItems(next);
  };

  return (
    <DragDropContext
      environment={{ window, root: shadowRoot }}
      onDragEnd={onDragEnd}
    >
      <Droppable droppableId="shadow-list">
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            style={{ padding: 8, background: '#eee', minHeight: 120 }}
          >
            {items.map((item, index) => (
              <Draggable key={item.id} draggableId={item.id} index={index}>
                {(dragProvided) => (
                  <div
                    ref={dragProvided.innerRef}
                    {...dragProvided.draggableProps}
                    {...dragProvided.dragHandleProps}
                    style={{
                      ...dragProvided.draggableProps.style,
                      padding: 12,
                      marginBottom: 8,
                      background: 'white',
                      border: '1px solid #ccc',
                    }}
                  >
                    {item.content}
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}

function ShadowDomExample(): Node {
  const hostRef = useRef<?HTMLElement>(null);

  useEffect(() => {
    const host: ?HTMLElement = hostRef.current;
    if (!host) {
      return;
    }

    const shadowRoot: ShadowRoot =
      host.shadowRoot || host.attachShadow({ mode: 'open' });
    let mountPoint: ?HTMLElement = shadowRoot.querySelector('[data-rpd-mount]');
    if (!mountPoint) {
      mountPoint = document.createElement('div');
      mountPoint.setAttribute('data-rpd-mount', 'true');
      shadowRoot.appendChild(mountPoint);
    }

    ReactDOM.render(<List shadowRoot={shadowRoot} />, mountPoint);

    return () => {
      if (mountPoint) {
        ReactDOM.unmountComponentAtNode(mountPoint);
      }
    };
  }, []);

  return (
    <div>
      <p>
        Drag and drop mounted inside an open Shadow DOM via{' '}
        <code>environment</code>.
      </p>
      <div ref={hostRef} />
    </div>
  );
}

storiesOf('environment', module).add('shadow DOM environment', () => (
  <ShadowDomExample />
));

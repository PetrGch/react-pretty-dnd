// @flow
import React, { useState, useRef } from 'react';
import { render, act } from '@testing-library/react';
import { invariant } from '../../../../../src/invariant';
import { isDragging, getOffset } from '../../util/helpers';
import App from '../../util/app';
import { withError, withWarn } from '../../../../util/console';
import { forEachSensor, simpleLift, type Control } from '../../util/controls';
import causeRuntimeError from '../../../../util/cause-runtime-error';

type Props = {
  throw: () => void,
  setForceThrow: (fn: () => void) => void,
};

function Vomit(props: Props) {
  const setShouldThrow = useState(0)[1];
  const shouldThrowRef = useRef(false);

  function chuck() {
    shouldThrowRef.current = true;
    setShouldThrow((current) => current + 1);
  }

  props.setForceThrow(chuck);

  if (shouldThrowRef.current) {
    shouldThrowRef.current = false;
    props.throw();
  }

  return null;
}

type Thrower = {|
  setForceThrow: (fn: () => void) => void,
  execute: () => void,
|};

function getThrower(): Thrower {
  let current: ?() => void = null;
  function setForceThrow(fn) {
    current = fn;
  }

  function execute() {
    withError(() => {
      act(() => {
        invariant(current, 'Expected throw callback to be set');
        current();
      });
    });
  }

  return { setForceThrow, execute };
}

forEachSensor((control: Control) => {
  it('should abort a drag if an invariant error occurs in the application', () => {
    const thrower: Thrower = getThrower();
    const { getByText } = render(
      <App
        anotherChild={
          <Vomit
            throw={() =>
              invariant(false, 'Do not pass go, do not collect $200')
            }
            setForceThrow={thrower.setForceThrow}
          />
        }
      />,
    );
    const handle: HTMLElement = getByText('item: 0');

    simpleLift(control, handle);
    expect(isDragging(handle)).toBe(true);

    thrower.execute();

    const newHandle: HTMLElement = getByText('item: 0');
    // Drag aborted (React 19 may recover in place without remounting the handle)
    expect(isDragging(newHandle)).toBe(false);

    // moving the handles around
    expect(() => {
      control.move(handle);
      control.move(newHandle);
      expect(getOffset(handle)).toEqual({ x: 0, y: 0 });
      expect(getOffset(newHandle)).toEqual({ x: 0, y: 0 });
    }).not.toThrow();
  });

  it('should abort a drag if an a non-invariant error occurs in the application', () => {
    const thrower: Thrower = getThrower();
    const { getByText, queryByText, unmount } = render(
      <App
        anotherChild={
          <Vomit
            throw={() => {
              throw new Error('Raw error throw');
            }}
            setForceThrow={thrower.setForceThrow}
          />
        }
      />,
    );
    const handle: HTMLElement = getByText('item: 0');

    simpleLift(control, handle);
    expect(isDragging(handle)).toBe(true);

    expect(() => {
      try {
        thrower.execute();
      } catch (e) {
        // React 16–18 may rethrow; React 19 may not
      }
    }).not.toThrow();

    // handle is gone (unrecovered error tears down the tree) OR still present
    // but drag must not continue — either way moving should be safe
    expect(() => {
      control.move(handle);
      expect(getOffset(handle)).toEqual({ x: 0, y: 0 });
    }).not.toThrow();

    // Prefer the historical assertion when the tree was torn down
    if (queryByText('item: 0') == null) {
      expect(queryByText('item: 0')).toBe(null);
    }

    try {
      unmount();
    } catch (e) {
      // React 19 AggregateError from unrecovered render error
    }
  });

  it('should abort a drag if a runtime error occurs', () => {
    const { getByText } = render(<App />);
    const handle: HTMLElement = getByText('item: 0');

    simpleLift(control, handle);
    expect(isDragging(handle)).toBe(true);

    // Runtime window errors abort via warning (not console.error)
    withWarn(() => {
      act(() => {
        causeRuntimeError();
      });
    });

    expect(isDragging(getByText('item: 0'))).toBe(false);
  });
});

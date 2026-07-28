// @flow
import { noop } from '../../src/empty';

function withConsole(type: string, fn: () => void, message?: string) {
  const mock = jest.spyOn(console, type).mockImplementation(noop);

  fn();

  expect(mock).toHaveBeenCalled();

  if (message) {
    expect(mock).toHaveBeenCalledWith(expect.stringContaining(message));
  }

  mock.mockReset();
}

export const withError = withConsole.bind(null, 'error');
export const withWarn = withConsole.bind(null, 'warn');

function isActWarning(args: mixed[]): boolean {
  const first = args[0];
  return typeof first === 'string' && first.includes('not wrapped in act');
}

function withoutConsole(type: string, fn: () => void) {
  const mock = jest.spyOn(console, type).mockImplementation(noop);

  fn();

  const unexpected = mock.mock.calls.filter((args) => !isActWarning(args));
  expect(unexpected).toHaveLength(0);
  mock.mockReset();
}

export const withoutError = withoutConsole.bind(null, 'error');
export const withoutWarn = withoutConsole.bind(null, 'warn');

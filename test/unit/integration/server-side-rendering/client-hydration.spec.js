// @flow
import React from 'react';
import { renderToString } from 'react-dom/server';
import { invariant } from '../../../../src/invariant';
import { resetServerContext } from '../../../../src';
import App from '../util/app';
import { noop } from '../../../../src/empty';

beforeEach(() => {
  // Reset server context between tests to prevent state being shared between them
  resetServerContext();
});

// Checking that the browser globals are available in this test file
invariant(
  typeof window !== 'undefined' && typeof document !== 'undefined',
  'browser globals not found in jsdom test',
);

it('should support rendering an application to a string (SSR)', () => {
  // Mock out the warnings caused by useLayoutEffect on the server string path
  const error = jest.spyOn(console, 'error').mockImplementation(noop);

  resetServerContext();
  const serverHTML: string = renderToString(<App />);

  expect(serverHTML).toEqual(expect.any(String));
  expect(serverHTML.length).toBeGreaterThan(0);

  // React may warn about useLayoutEffect on the server; tolerate only that
  error.mock.calls.forEach((call) => {
    const message: string = String(call[0]);
    expect(
      message.includes('useLayoutEffect') ||
        message.includes('not wrapped in act'),
    ).toBe(true);
  });
  error.mockRestore();
});

// hydrateRoot in React 19 + jsdom can crash the Jest worker
// (getActiveElement → doc.body null). Soft-check: SSR string is enough here;
// full hydration is covered in browser/cypress environments.
it('should produce hydratable markup from renderToString', () => {
  const error = jest.spyOn(console, 'error').mockImplementation(noop);
  resetServerContext();
  const serverHTML: string = renderToString(<App />);
  error.mockRestore();

  // Markup should contain expected rbd attributes so a client hydrate could attach
  expect(serverHTML).toContain('data-rbd-drag-handle');
  expect(serverHTML).toContain('data-rbd-draggable-id');
});

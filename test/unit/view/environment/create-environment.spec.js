// @flow
import {
  createEnvironment,
  normalizeEnvironment,
} from '../../../../src/view/environment';

it('should default to the global window and document', () => {
  const env = createEnvironment();
  expect(env.window).toBe(window);
  expect(env.document).toBe(document);
  expect(env.root).toBe(document);
});

it('should use a provided window and default root to its document', () => {
  const env = createEnvironment({ window });
  expect(env.window).toBe(window);
  expect(env.root).toBe(window.document);
});

it('should accept an explicit query root (e.g. ShadowRoot)', () => {
  const host: HTMLElement = document.createElement('div');
  document.body.appendChild(host);
  const shadowRoot: ShadowRoot = host.attachShadow({ mode: 'open' });

  const env = createEnvironment({ window, root: shadowRoot });
  expect(env.root).toBe(shadowRoot);
  expect(env.window).toBe(window);

  document.body.removeChild(host);
});

it('should normalize a legacy Window-like dndContext', () => {
  const env = normalizeEnvironment({ dndContext: window });
  expect(env.window).toBe(window);
  expect(env.root).toBe(window.document);
});

it('should normalize a legacy query-root dndContext with global window', () => {
  const host: HTMLElement = document.createElement('div');
  document.body.appendChild(host);
  const shadowRoot: ShadowRoot = host.attachShadow({ mode: 'open' });

  const env = normalizeEnvironment({ dndContext: shadowRoot });
  expect(env.window).toBe(window);
  expect(env.root).toBe(shadowRoot);

  document.body.removeChild(host);
});

it('should prefer environment over legacy dndContext', () => {
  const host: HTMLElement = document.createElement('div');
  document.body.appendChild(host);
  const shadowRoot: ShadowRoot = host.attachShadow({ mode: 'open' });

  const env = normalizeEnvironment({
    environment: { window, root: shadowRoot },
    dndContext: document,
  });
  expect(env.root).toBe(shadowRoot);

  document.body.removeChild(host);
});

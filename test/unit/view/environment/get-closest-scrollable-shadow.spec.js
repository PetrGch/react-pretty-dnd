// @flow
import getClosestScrollable, {
  getParentCrossingShadow,
} from '../../../../src/view/use-droppable-publisher/get-closest-scrollable';
import { createEnvironment } from '../../../../src/view/environment';

it('should walk from a shadow child to the host via getParentCrossingShadow', () => {
  const host: HTMLElement = document.createElement('div');
  document.body.appendChild(host);
  const shadowRoot: ShadowRoot = host.attachShadow({ mode: 'open' });
  const child: HTMLElement = document.createElement('div');
  shadowRoot.appendChild(child);

  expect(getParentCrossingShadow(child)).toBe(host);

  document.body.removeChild(host);
});

it('should find a scrollable ancestor outside the shadow root', () => {
  const scrollParent: HTMLElement = document.createElement('div');
  scrollParent.style.overflow = 'auto';
  // jsdom does not compute overflow from style sheets the same way;
  // stub getComputedStyle for this element via environment window
  const env = createEnvironment();
  const original = env.window.getComputedStyle;
  // $FlowFixMe
  env.window.getComputedStyle = (el: Element) => {
    if (el === scrollParent) {
      return ({
        overflowX: 'auto',
        overflowY: 'auto',
        position: 'static',
      }: any);
    }
    return original.call(env.window, el);
  };

  document.body.appendChild(scrollParent);
  const host: HTMLElement = document.createElement('div');
  scrollParent.appendChild(host);
  const shadowRoot: ShadowRoot = host.attachShadow({ mode: 'open' });
  const child: HTMLElement = document.createElement('div');
  shadowRoot.appendChild(child);

  expect(getClosestScrollable(child, env)).toBe(scrollParent);

  // $FlowFixMe
  env.window.getComputedStyle = original;
  document.body.removeChild(scrollParent);
});

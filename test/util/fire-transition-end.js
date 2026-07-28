// @flow

// jsdom / fireEvent.transitionEnd often omit propertyName; React's
// onTransitionEnd handler needs it on the native event.
export default function fireTransitionEnd(
  el: HTMLElement,
  propertyName: string = 'height',
) {
  const event: Event = new Event('transitionend', {
    bubbles: true,
    cancelable: true,
  });
  Object.defineProperty(event, 'propertyName', {
    value: propertyName,
    enumerable: true,
  });
  el.dispatchEvent(event);
}

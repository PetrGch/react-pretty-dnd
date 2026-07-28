// @flow
import React from 'react';
import DragDropContext from '../../../../src/view/drag-drop-context';
import { resetServerContext } from '../../../../src';
import * as attributes from '../../../../src/view/data-attributes';
import mount, { type Wrapper } from '../../../util/rtl-mount';

it('should insert nonce into style tag', () => {
  const nonce = 'ThisShouldBeACryptographicallySecurePseudorandomNumber';

  resetServerContext();
  const wrapper: Wrapper = mount(
    <DragDropContext nonce={nonce} onDragEnd={() => {}}>
      {null}
    </DragDropContext>,
  );
  const styleTag = document.querySelector(`[${attributes.prefix}-always="0"]`);
  const nonceAttribute = styleTag ? styleTag.getAttribute('nonce') : '';
  expect(nonceAttribute).toEqual(nonce);

  wrapper.unmount();
});

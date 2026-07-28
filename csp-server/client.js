// @flow
/* eslint-env browser */

import React from 'react';
import { hydrateRoot } from 'react-dom/client';
import Sample from './app';

const root: Element | null = document.getElementById('root');

let nonce = null;

const cspEl = document.getElementById('csp-nonce');
if (cspEl) {
  nonce = cspEl.getAttribute('content');
}

if (root) {
  hydrateRoot(root, <Sample nonce={nonce} />);
}

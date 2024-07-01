import React from 'react';
import ReactDOM from 'react-dom/client';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';

import { BridgeWidget } from './components/BridgeWidget';
import { BITFINITY_CHAINS } from './utils';

const config = getDefaultConfig({
  appName: 'bridge-widget',
  projectId: 'YOUR_PROJECT_ID',
  chains: [...BITFINITY_CHAINS]
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BridgeWidget config={config} />
  </React.StrictMode>
);

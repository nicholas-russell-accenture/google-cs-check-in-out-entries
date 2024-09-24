'use client';

import React from 'react';

import { MarketplaceAppProvider } from '@/app/common/providers/MarketplaceAppProvider';

import CheckInOut from './CheckInOut';

const SidebarLocation = () => {
  return (
    <MarketplaceAppProvider>
      <CheckInOut />
    </MarketplaceAppProvider>
  );
};

export default SidebarLocation;

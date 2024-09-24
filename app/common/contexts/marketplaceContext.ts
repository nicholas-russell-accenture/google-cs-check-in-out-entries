/* eslint-disable @typescript-eslint/no-explicit-any */

import React from 'react';

import { KeyValueObj } from '@/app/types';
import UiLocation from '@contentstack/app-sdk/dist/src/uiLocation';

interface MarketplaceAppContextType {
  appSdk?: UiLocation;
  contextData: any;
  fieldData: any;
  entryData: any;
  setFieldData: React.Dispatch<React.SetStateAction<any>>;
  shouldShowModal: boolean;
  currentUserData: any;
  appConfig: KeyValueObj | null;
}
export default MarketplaceAppContextType;

/**
 * Context to store the app state.
 */
export const MarketplaceAppContext =
  React.createContext<MarketplaceAppContextType>({
    appSdk: undefined,
    contextData: undefined,
    fieldData: undefined,
    setFieldData: () => {},
    shouldShowModal: false,
    currentUserData: undefined,
    entryData: undefined,
    appConfig: null,
  });

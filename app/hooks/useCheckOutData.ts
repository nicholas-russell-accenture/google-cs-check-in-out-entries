/**
 * useAppSdk
 * @return the appSdk instance after initialization
 */

import { useContext } from 'react';

import MarketplaceAppContextType, {
  MarketplaceAppContext,
} from '../common/contexts/marketplaceContext';

export const useCheckOutData = () => {
  const {
    fieldData,
    setFieldData,
    currentUserData,
    shouldShowModal,
    entryData,
    contextData,
  } = useContext(MarketplaceAppContext) as MarketplaceAppContextType;
  return {
    fieldData,
    setFieldData,
    currentUserData,
    shouldShowModal,
    entryData,
    contextData,
  };
};

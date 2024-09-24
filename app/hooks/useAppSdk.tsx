/**
 * useAppSdk
 * @return the appSdk instance after initialization
 */

import { useContext } from 'react';

import MarketplaceAppContextType, {
  MarketplaceAppContext,
} from '../common/contexts/marketplaceContext';

/**
 * Getter and setter for appSdk instance.
 * To be used during Sdk initialization
 * @returns appSdk;
 *
 * Eg:
 * const appSdk = useAppSdk();
 */
export const useAppSdk = () => {
  const { appSdk } = useContext(
    MarketplaceAppContext
  ) as MarketplaceAppContextType;
  return appSdk;
};

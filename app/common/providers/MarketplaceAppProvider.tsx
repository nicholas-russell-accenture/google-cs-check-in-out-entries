/* eslint-disable @typescript-eslint/no-explicit-any */
import { isNull } from 'lodash';
import React, { useState } from 'react';

import AppFailed from '@/app/components/AppFailed';
import DefaultLoading from '@/app/components/DefaultLoading';
import { KeyValueObj } from '@/app/types';
import ContentstackAppSDK from '@contentstack/app-sdk';
import UiLocation from '@contentstack/app-sdk/dist/src/uiLocation';

import MarketplaceAppContextType, {
  MarketplaceAppContext,
} from '../contexts/marketplaceContext';

type ProviderProps = {
  children?: React.ReactNode;
};

/**
 * Marketplace App Provider
 * @param children: React.ReactNode
 */
export const MarketplaceAppProvider: React.FC<ProviderProps> = ({
  children,
}) => {
  const [failed, setFailed] = useState<boolean>(false);
  const [appSdk, setAppSdk] = useState<UiLocation>();
  const [appConfig, setConfig] = useState<KeyValueObj | null>(null);
  const [currentUserData, setCurrentUserData] = React.useState<any>(undefined);
  const [fieldData, setFieldData] = React.useState<any>(undefined);
  const [entryData, setEntryData] = React.useState<any>(undefined);
  const [shouldShowModal, setShouldShowModal] = React.useState<boolean>(false);
  const [contextData, setContextData] = React.useState<any>(undefined);

  // Initialize the SDK and track analytics event
  React.useEffect(() => {
    ContentstackAppSDK.init()
      .then(async (appSdk) => {
        setAppSdk(appSdk);

        // console.log('App SDK initialized', appSdk);

        const appConfig = await appSdk.getConfig();
        setConfig(appConfig);

        // set current user data
        const currentUser = appSdk.currentUser;
        const user = {
          uid: currentUser.uid,
          name: `${currentUser?.first_name} ${currentUser?.last_name}`,
          isAdmin:
            currentUser.is_owner ||
            currentUser.roles.filter(
              (role) =>
                role.api_key === appSdk.stack.getData().api_key &&
                role.name === 'Admin'
            ).length > 0,
        };
        setCurrentUserData(user);

        // set field data
        const customField = appSdk.location.CustomField;
        // set height to 0 to use the minimum height for the custom field
        customField?.frame.updateHeight(0);

        const cd = {
          api_key: customField?.stack.getData().api_key,
          branch: customField?.stack?.getCurrentBranch()?.uid,
        };

        setContextData(cd);

        const entry = customField?.entry;
        const d = entry?.getData();
        setEntryData({
          uid: d?.uid,
          content_type: {
            uid: entry?.content_type.uid,
          },
          locale: d?.locale,
        });
        const fd = d?.content_workflow ?? {
          user,
          status: 0,
        };
        setFieldData(fd);

        // set should show modal
        if (fd?.status === 1 && !user?.isAdmin && user.uid !== fd?.user?.uid) {
          setShouldShowModal(true);
        }
      })
      .catch(() => {
        setFailed(true);
      });
  }, []);

  // wait until the SDK is initialized. This will ensure the values are set
  // correctly for appSdk.
  if (!failed && (isNull(appSdk) || isNull(appConfig))) {
    return <DefaultLoading title="Loading..." />;
  }

  if (failed) {
    return <AppFailed />;
  }
  const value: MarketplaceAppContextType = {
    appSdk,
    appConfig,
    contextData,
    currentUserData,
    fieldData,
    setFieldData,
    entryData,
    shouldShowModal,
  };

  return (
    <MarketplaceAppContext.Provider value={value}>
      {children}
    </MarketplaceAppContext.Provider>
  );
};

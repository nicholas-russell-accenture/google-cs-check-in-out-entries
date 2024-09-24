/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React from 'react';

import ReloadModal from '@/app/components/ReloadModal';
import { useAppSdk } from '@/app/hooks/useAppSdk';
import { useCheckOutData } from '@/app/hooks/useCheckOutData';
import { cleanUpEntryPayload } from '@/app/utils';
import { Button, cbModal } from '@contentstack/venus-components';

import ShowModal from './ShowModal';

const CheckInOut = () => {
  const appSdk = useAppSdk();
  const { fieldData, currentUserData, setFieldData } = useCheckOutData();
  const [dataLoading, setDataLoading] = React.useState<boolean>(false);
  const [buttonDisabled, setButtonDisabled] = React.useState<boolean>(true);

  const saveEntry = React.useCallback(
    async (status: number, userData: any): Promise<void> => {
      if (!appSdk) return;
      let payload: any = appSdk.location.CustomField?.entry.getData();
      payload = {
        ...payload,
        content_workflow: {
          user: userData,
          status: status,
        },
      };
      const ct = appSdk.location.CustomField?.entry.content_type.uid;
      if (!ct) return;
      if (!appSdk) return;
      cleanUpEntryPayload(payload);
      console.log('Content Type', ct);
      console.log('Payload', payload);
      return appSdk.stack.ContentType(ct).Entry(payload.uid).update({
        entry: payload,
      });
    },
    [appSdk]
  );

  React.useEffect(() => {
    if (
      currentUserData.isAdmin ||
      currentUserData?.uid === fieldData?.user?.uid
    ) {
      setButtonDisabled(false);
      return;
    } else {
      setButtonDisabled(true);
    }
  }, [currentUserData.isAdmin, currentUserData?.uid, fieldData?.user?.uid]);
  if (!appSdk) return null;

  return (
    <>
      <ShowModal />
      <div className="flex flex-row justify-center items-center h-screen">
        <div>
          <Button
            buttonType="secondary"
            isFullWidth
            disabled={buttonDisabled || dataLoading}
            onClick={() => {
              setDataLoading(true);
              setFieldData((prev: any) => {
                const status = prev.status === 0 ? 1 : 0;
                const d = {
                  user: currentUserData,
                  status,
                };
                appSdk.location.CustomField?.field.setData(d).then(() => {
                  console.log('Data', d);
                  saveEntry(status, currentUserData).then(() => {
                    cbModal({
                      component: (props: any) => (
                        <ReloadModal {...props} status={status} />
                      ),
                    });

                    setDataLoading(false);
                  });
                });
                return d;
              });
            }}
            icon={fieldData?.status === 1 ? 'OpenLock' : 'Lock'}
          >
            {fieldData?.status === 1 ? 'Check In' : 'Check Out'}{' '}
          </Button>
        </div>
      </div>
    </>
  );
};

export default CheckInOut;

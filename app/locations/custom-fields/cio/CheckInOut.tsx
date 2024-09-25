/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React from 'react';

import ReloadModal from '@/app/components/ReloadModal';
import { useAppSdk } from '@/app/hooks/useAppSdk';
import { useCheckOutData } from '@/app/hooks/useCheckOutData';
import { cleanUpEntryPayload } from '@/app/utils';
import { Button, cbModal, Icon, Info } from '@contentstack/venus-components';

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
      return appSdk.stack.ContentType(ct).Entry(payload.uid).update({
        entry: payload,
      });
    },
    [appSdk]
  );

  React.useEffect(() => {
    if (
      currentUserData.isAdmin ||
      currentUserData?.uid === fieldData?.user?.uid ||
      fieldData?.status === 0
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
      {/* {fieldData.status === 1 ? (
        <div className="flex flex-row justify-center items-center pt-5 pb-10">
          <Info
            content={<div>Entry is Locked</div>}
            icon={<Icon icon="Error" />}
            type="warning"
          />
        </div>
      ) : (
        <div className="flex flex-row justify-center items-center pt-5 pb-10">
          <Info
            content={<div>Entry is Unlocked</div>}
            icon={<Icon icon="Success" />}
            type="success"
          />
        </div>
      )} */}

      <div className="flex flex-row justify-center items-center w-full pr-2">
        <Info
          icon={<Icon icon={fieldData?.status === 1 ? 'Error' : 'Success'} />}
          type={fieldData?.status === 1 ? 'warning' : 'success'}
          className="w-full"
          content={
            <>
              <h3 className="pb-2">
                ENTRY IS {fieldData?.status === 1 ? 'LOCKED' : 'UNLOCKED'}
              </h3>
              <div className="">
                <Button
                  buttonType="secondary"
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
                  {fieldData?.status === 1 ? 'Unlock Entry' : 'Lock Entry'}
                </Button>
              </div>
            </>
          }
        />
      </div>
    </>
  );
};

export default CheckInOut;

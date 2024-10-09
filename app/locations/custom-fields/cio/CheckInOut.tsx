/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';

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
  
  // const saveEntry = React.useCallback(
  //   async (status: number, userData: any): Promise<void> => {
  
  //     if (!appSdk) return;
  //     let payload: any = appSdk.location.CustomField?.entry.getData();
  //     payload = {
  //       ...payload,
  //       content_workflow: {
  //         user: userData,
  //         status: status,
  //       },
  //     };
  //     const ct = appSdk.location.CustomField?.entry.content_type.uid;
  //     if (!ct) return;
  //     if (!appSdk) return;
  //     cleanUpEntryPayload(payload);
  //     return appSdk.stack.ContentType(ct).Entry(payload.uid).update({
  //       entry: payload,
  //     });
  //   },
  //   [appSdk]
  // );


// Inside your CheckInOut component

  React.useEffect(() => {
    const fetchMetadata = async () => {
      const IMetadateRetrieve = {
        entity_uid: "123"
      };
console.log("use effect called----------------")
      try {
        
    console.log("currentUserData:::::::::",currentUserData)
        let entityUidToCheck = appSdk?.location.CustomField?.entry._data.uid;

        const resData = await appSdk?.metadata?.retrieveAllMetaData(IMetadateRetrieve);
        console.log("resData:::::::::::",resData)
        let filteredEntry = resData?.metadata.filter((item) => {
          return item.entity_uid === entityUidToCheck && item.EntryLocked && !item.deleted_at;
        });
        console.log("filteredEntry::::::::::",filteredEntry)
        if (filteredEntry?.length !=0) {
          setFieldData(() => ({ status: 1 }));
        }
      } catch (error) {
        console.error("Error retrieving metadata:", error);
      }
    };

    fetchMetadata();
  }, [appSdk, currentUserData]); // Add dependencies as necessary


  const createEntryLock = React.useCallback(
    async (): Promise<void> => {
      
      let entryId:any = appSdk?.location?.CustomField?.entry?._data?.uid
      if (!appSdk) return;
      appSdk?.metadata.createMetaData({
        entity_uid: entryId, // "bltffa9a5309e5e7e1f";
        type: "entry", // default: "asset"
        _content_type_uid: "sdp_knowledge_article",
        //locale?: string;
        EntryLocked: true,
        extension_uid: 'bltffa9a5309e5e7e1f'
      })
        .then(response => {
          console.log("EntryLocked:", response);  // Log the "EntryLocked" field
        })
        .catch(error => {
          console.error("Error:", error);
        });
      console.log("createEntryLock :::2end::::::::::::", appSdk.metadata);

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
                ENTRY IS {fieldData?.status === 1 ? 'LOCKED by ' + currentUserData.name : 'UNLOCKED'}
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
                        createEntryLock().then(() => {
                          console.log("status-------",status)
                          cbModal({
                            component: (props: any) => (
                              <ReloadModal {...props} status={status} currentUserData={currentUserData} />
                            ),
                          });
                          setDataLoading(false);
                        });
                      });
                      return d;
                    });
                  }}
                  icon={fieldData?.status == 1 ? 'OpenLock' : 'Lock'}
                >
                  {fieldData?.status == 1 ? 'Unlock Entry' : 'Lock Entry'}
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


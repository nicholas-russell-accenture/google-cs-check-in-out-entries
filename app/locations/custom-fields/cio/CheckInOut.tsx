/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React from 'react';

import ReloadModal from '@/app/components/ReloadModal';
import { useAppSdk } from '@/app/hooks/useAppSdk';
import { useCheckOutData } from '@/app/hooks/useCheckOutData';
import { cleanUpEntryPayload } from '@/app/utils';
import { Button, cbModal, Icon, Info } from '@contentstack/venus-components';
import RequestUnlockModal from '@/app/components/RequestUnlockModal';

import ShowModal from './ShowModal';

const CheckInOut = () => {

  const appSdk = useAppSdk();
  const { fieldData, currentUserData, setFieldData } = useCheckOutData();
  const [dataLoading, setDataLoading] = React.useState<boolean>(false);
  const [buttonDisabled, setButtonDisabled] = React.useState<boolean>(true);
  const [currentMetaData, setCurrentMetaData] = React.useState<any>(null);

  // Create a ref to hold the latest currentMetaData
  const currentMetaDataRef = React.useRef(currentMetaData);
  
  // Effect to update the ref when currentMetaData changes
  React.useEffect(() => {
    currentMetaDataRef.current = currentMetaData;
  }, [currentMetaData]);

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


  // for check entry is locked or not
  React.useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const entityUidToCheck = appSdk?.location.CustomField?.entry._data.uid;
        const resData = await appSdk?.metadata?.retrieveAllMetaData();
        let filteredEntry: any = resData?.metadata.filter((item) => {
          return item.entity_uid === entityUidToCheck && item.EntryLocked && !item.deleted_at;
        });

        if (filteredEntry?.length != 0) {
          setFieldData(() => ({ status: 1 }));
          setCurrentMetaData(filteredEntry[0])
          if (filteredEntry[0].created_by !== currentUserData.uid) {
            cbModal({
              component: (props: any) => (
                <RequestUnlockModal currentMetaData={filteredEntry[0]} />
              ),
            });
          }
        } else {
          setFieldData(() => ({ status: 0 }));
          setCurrentMetaData(null)
        }
      } catch (error) {
        console.error("Error retrieving metadata:", error);
      }
    };

    fetchMetadata();
  }, [appSdk, currentUserData]);

  // for unlock entry
  const unLockEntry = React.useCallback(
    async (): Promise<void> => {
      console.log("unlock entry calleddd............................")
      if (!appSdk) return;
      // Check if currentMetaData matches the entry being unlocked
      if (currentMetaDataRef.current?.entity_uid === appSdk?.location?.CustomField?.entry?._data?.uid) {
        try {
          await appSdk.metadata.deleteMetaData({ uid: currentMetaDataRef.current.uid });
          // Update field data to 0 after successfully unlocking
          setFieldData({ status: 0 });
        } catch (error) {
          console.error("Error unlocking entry:", error);
        }
      }
    },
    [appSdk, setFieldData] // Ensure setFieldData is included in the dependency array
  );

  // for create metadata 
  const createEntryLock = React.useCallback(
    async (): Promise<void> => {
      let entryId: any = appSdk?.location?.CustomField?.entry?._data?.uid
      if (!appSdk) return;
      try {
        let response = await appSdk?.metadata.createMetaData({
          entity_uid: entryId,
          type: "entry",
          _content_type_uid: "sdp_knowledge_article",
          EntryLocked: true,
          extension_uid: 'bltbce177efe7284a0f',
          createdByUserName: currentUserData?.name,
        })

        if (response) {
          setFieldData(() => ({ status: 1 }));
          setCurrentMetaData(response.metadata)
        } else {
          console.log("entry creation failed")
        }
      } catch (error) {
        console.error("Error creating entry lock:", error);
      }
    },
    [appSdk, currentUserData]
  );

  // for handle onChange event
  React.useEffect(() => {
    const handleChange = async () => {
      console.log("currentMetaDataRef:::::::::::", currentMetaDataRef)
      console.log("fieldData------------", fieldData.status)
      if (currentMetaDataRef.current === null && fieldData?.status === 0) {
        await createEntryLock();
      }
    }
    const entry: any = appSdk?.location.CustomField?.entry;
    entry.onChange(handleChange);
  }, [appSdk, createEntryLock, fieldData]);

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
                        currentMetaData.created_by === currentUserData.uid ? unLockEntry().then(() => {
                          cbModal({
                            component: (props: any) => (
                              <ReloadModal {...props} status={fieldData?.status} currentUserData={currentUserData} />
                            ),
                          });
                          setDataLoading(false);
                        }) : cbModal({
                          component: () => (
                            <RequestUnlockModal currentMetaData={currentMetaData} />
                          ),
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


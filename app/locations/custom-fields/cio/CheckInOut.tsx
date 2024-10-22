/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";

import { useAppSdk } from "@/app/hooks/useAppSdk";
import { useCheckOutData } from "@/app/hooks/useCheckOutData";
import { Button, cbModal, Icon, Info } from "@contentstack/venus-components";
import RequestUnlockModal from "@/app/components/RequestUnlockModal";

import ShowModal from "./ShowModal";

const CheckInOut = () => {
  const appSdk = useAppSdk();
  const { fieldData, currentUserData } = useCheckOutData();
  const [dataLoading, setDataLoading] = React.useState<boolean>(false);
  const [buttonDisabled, setButtonDisabled] = React.useState<boolean>(true);
  const [currentMetaData, setCurrentMetaData] = React.useState<any>(null);

  // Create a ref to hold the latest currentMetaData
  const currentMetaDataRef = React.useRef(currentMetaData);

  // Effect to update the ref when currentMetaData changes
  React.useEffect(() => {
    // console.log("Update Current Metadata:", currentMetaData);
    currentMetaDataRef.current = currentMetaData;
  }, [currentMetaData]);

  // for check entry is locked or not
  React.useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const entityUidToCheck = appSdk?.location.CustomField?.entry._data.uid;
        const resData = await appSdk?.metadata?.retrieveAllMetaData();
        // console.log("All metadata in Stack:", resData);  
        const filteredEntry: any = resData?.metadata.filter((item) => {
          return (
            item.entity_uid === entityUidToCheck &&
            item.EntryLocked &&
            !item.deleted_at
          );
        });

        if (filteredEntry?.length != 0) {
          setCurrentMetaData(filteredEntry[0]);
          setTimeout(() => {
            if (filteredEntry[0].created_by !== currentUserData.uid) {
              cbModal({
                component: () => (
                  <RequestUnlockModal currentMetaData={filteredEntry[0]} />
                ),
              });
            }
          }, 0);
        } else {
          setCurrentMetaData(null);
        }
      } catch (error) {
        console.error("Error retrieving metadata:", error);
      }
    };

    fetchMetadata();
  }, [appSdk, currentUserData]);

  // Unlocks the entry
  const unLockEntry = React.useCallback(
    async (): Promise<void> => {
      // console.log("Unlock entry called.");
      if (!appSdk) return; // Exit if appSdk is not available.

      // Check if currentMetaData matches the entry being unlocked
      if (
        currentMetaDataRef.current?.entity_uid ===
        appSdk?.location?.CustomField?.entry?._data?.uid
      ) {
        try {
          await appSdk.metadata.deleteMetaData({
            uid: currentMetaDataRef.current.uid,
          });

          // Set CurrentMetaData and currentMetaDataRef.current to null after unlocking
          setCurrentMetaData(null);

        } catch (error) {
          console.error("Error unlocking entry:", error);
        }
      }
    },
    [appSdk]
  );

  // Create entry lock meta-data
  const createEntryLock = React.useCallback(async (): Promise<void> => {
    const entryId: any = appSdk?.location?.CustomField?.entry?._data?.uid;

    if (!appSdk) return; // App SDK is not available.

    // Get the browser's current time.
    const currentDate = new Date();
    const currentTime = currentDate.toLocaleTimeString();

    try {
      const response = await appSdk?.metadata.createMetaData({
        entity_uid: entryId,
        type: "entry",
        _content_type_uid: "sdp_knowledge_article",
        EntryLocked: true,
        extension_uid: "bltbce177efe7284a0f",
        createdByUserName: currentUserData?.name,
        currentUserTime: currentTime,
      });

      if (response) {
        setCurrentMetaData(response.metadata);
      } else {
        console.log("Entry lock meta-data entry creation failed.");
      }
    } catch (error) {
      console.error("Error creating entry lock:", error);
    }
  }, [appSdk, currentUserData]);

  // Create entry lock meta-data
  const updateEntryLock = React.useCallback(async (): Promise<void> => {
    if (!appSdk) return; // App SDK is not available.

    // Get the browser's current time.
    const currentDate = new Date();
    const currentTime = currentDate.toLocaleTimeString();

    // Update the existing entry lock metadata to include the latest timestamp.
    try {
      const response = await appSdk?.metadata.updateMetaData({
        uid: currentMetaDataRef.current.uid,
        currentUserTime: currentTime,
      });

      if (response) {
        setCurrentMetaData(response.metadata);
      } else {
        console.log("Entry lock meta-data entry creation failed.");
      }
    } catch (error) {
      console.error("Error creating entry lock:", error);
    }
  }, [appSdk, currentUserData]);

  const handleChange = async (whatChanged: any) => {
    // A function that compares the properties on whatChanged with the matching properties on appSdk?.location?.CustomField?.entry?._data to determined what changed, if anything:
    const entryHasChanged = (whatChanged: any): boolean => {
      // Iterate over each available property on whatChanged and compare with the original value on the entry:
      for (const key in whatChanged) {
        // console.log("Validate", typeof whatChanged[key], key, whatChanged[key], appSdk?.location?.CustomField?.entry?._data[key]);
        if (whatChanged[key] instanceof Object) {
          if (JSON.stringify(whatChanged[key]) !== JSON.stringify(appSdk?.location?.CustomField?.entry?._data[key])) {
            // console.log("Object Change:", key, whatChanged[key], appSdk?.location?.CustomField?.entry?._data[key]);
            return true;
          }
        } else if (whatChanged[key] !== appSdk?.location?.CustomField?.entry?._data[key]) {
          // Field with single value (i.e., a string) has changed.
          // console.log("String Change:", key, whatChanged[key], appSdk?.location?.CustomField?.entry?._data[key]);
          return true;
        }
      }

      // Else, nothing has changed.
      return false;
    };

    if (entryHasChanged(whatChanged)) {
      // Update existing lock with new timestamp if entry is locked.
      if (currentMetaDataRef?.current?.uid) {
        console.log("Update metadata for lock with last update time.");
        await updateEntryLock();
      }

      // Create a new lock if entry is unlocked.
      if (currentMetaDataRef.current === null && fieldData?.status === 0) {
        await createEntryLock();
      }
    }
  };

  // Handle onChange event
  React.useEffect(() => {
    const entry: any = appSdk?.location.CustomField?.entry;
    entry.onChange((whatChanged: any) => handleChange(whatChanged));
  }, [appSdk]);

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

  // Do not render output if appSdk is not available.
  if (!appSdk) return null;

  let entryLockMessage = "Entry is unlocked.";
  let entryIsLocked = false;
  if (currentMetaData !== null) {
    entryLockMessage = "Entry is locked.";
    entryIsLocked = true;
  }

  return (
    <>
      <ShowModal />
      <div className="flex flex-row justify-center items-center w-full pr-2">
        <Info
          icon={<Icon icon={fieldData?.status === 1 ? "Error" : "Success"} />}
          type={entryIsLocked ? "warning" : "success"}
          className="w-full"
          content={
            <>
              <h3 className="pb-2">{entryLockMessage}</h3>

              <div className="">
                <Button
                  buttonType="secondary"
                  disabled={buttonDisabled || dataLoading}
                  onClick={() => {
                    setDataLoading(true);

                    entryIsLocked
                      ? unLockEntry().then(() => {
                          setDataLoading(false);
                        })
                      : createEntryLock().then(() => {
                          setDataLoading(false);
                        });
                  }}
                  icon={entryIsLocked ? "OpenLock" : "Lock"}
                >
                  {entryIsLocked ? "Unlock Entry" : "Lock Entry"}
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

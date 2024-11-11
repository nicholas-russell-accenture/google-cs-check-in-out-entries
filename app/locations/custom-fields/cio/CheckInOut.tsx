/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { useAppSdk } from "@/app/hooks/useAppSdk";
import { useCheckOutData } from "@/app/hooks/useCheckOutData";
import { Button, cbModal, Icon, Info } from "@contentstack/venus-components";
import RequestUnlockModal from "@/app/components/RequestUnlockModal";

import ShowModal from "./ShowModal";
import UnlockEntryModal from "@/app/components/UnlockEntryModal";
import LockExpiredModal from "@/app/components/LockExpiredModal";

const CheckInOut = () => {
  const appSdk = useAppSdk();
  const { fieldData, currentUserData } = useCheckOutData();
  const [dataLoading, setDataLoading] = React.useState<boolean>(false);
  const [buttonDisabled, setButtonDisabled] = React.useState<boolean>(true);
  const [currentMetaData, setCurrentMetaData] = React.useState<any>(null);
  const [isUnlockEntryModalOpen, setIsUnlockEntryModalOpen] = React.useState(false);
  const [isLockExpriedModalOpen, setIsLockExpriedModalOpen] = React.useState(false);
  const [hasLockExpiredModalShown, setHasLockExpiredModalShown] = React.useState(false);
  const [isEntryChanged, setIsEntryChanged] = React.useState(false);
  const [extensionUid, setExtensionUid] = React.useState<string>("");

  const [isReady, setIsReady] = React.useState(false);
  // Create a ref to hold the latest currentMetaData
  const currentMetaDataRef = React.useRef(currentMetaData);

  // Effect to update the ref when currentMetaData changes
  React.useEffect(() => {
    currentMetaDataRef.current = currentMetaData;
  }, [currentMetaData]);

  // for check entry is locked or not
  React.useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const entityUidToCheck = appSdk?.location.CustomField?.entry._data.uid;
        const resData = await appSdk?.metadata?.retrieveAllMetaData();
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
                  <RequestUnlockModal
                    currentMetaData={filteredEntry[0]}
                    appSdk={appSdk}
                  />
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
  const unLockEntry = React.useCallback(async (): Promise<void> => {
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
        setDataLoading(false);
        return fieldData.status;
      } catch (error) {
        console.error("Error unlocking entry:", error);
      }
    }
  }, [appSdk]);

  // Create entry lock meta-data
  const createEntryLock = React.useCallback(async (): Promise<void> => {
    const entryId: any = appSdk?.location?.CustomField?.entry?._data?.uid;
    const contentTypeUid: any =
      appSdk?.location?.CustomField?.entry?.content_type?.uid;

    if (!appSdk || extensionUid == "") {
      console.log("Exension UID is not set, current value:", extensionUid);
      return; // App SDK is not available.
    }

    // Get the browser's current time.
    const currentDate = new Date();
    const currentTime = currentDate.toLocaleTimeString();

    try {
      // bltbce177efe7284a0f: testing extension uid.
      const response = await appSdk?.metadata.createMetaData({
        entity_uid: entryId,
        type: "entry",
        _content_type_uid: contentTypeUid,
        EntryLocked: true,
        extension_uid: extensionUid,
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
  }, [appSdk, extensionUid, currentUserData]);

  // update entry lock meta-data
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
        setIsEntryChanged(false);
      } else {
        console.log("Entry lock meta-data entry creation failed.");
      }
    } catch (error) {
      console.error("Error creating entry lock:", error);
    }
  }, [appSdk, currentUserData]);

  const handleChange = async (whatChanged: any) => {
    // Create a new lock if entry is unlocked.
    if (currentMetaDataRef.current === null && fieldData?.status === 0) {
      await createEntryLock();
    }

    // function for check is entry is changed or not
    const entryHasChanged = (whatChanged: any): boolean => {
      // Iterate over each available property on whatChanged and compare with the original value on the entry:
      for (const key in whatChanged) {
        if (whatChanged[key] instanceof Object) {
          if (
            JSON.stringify(whatChanged[key]) !==
            JSON.stringify(appSdk?.location?.CustomField?.entry?._data[key])
          ) {
            return true;
          }
        } else if (
          whatChanged[key] !== appSdk?.location?.CustomField?.entry?._data[key]
        ) {
          return true;
        }
      }

      // Else, nothing has changed.
      return false;
    };

    if (entryHasChanged(whatChanged)) {
      setIsEntryChanged(true);
    }
  };

  // set interval for 1 min
  React.useEffect(() => {
    const intervalId = setInterval(async () => {
      if (isEntryChanged) {
        // Update existing lock with new timestamp if entry is locked.
        if (currentMetaDataRef?.current?.uid) {
          console.log("Update metadata for lock with last update time.");
          await updateEntryLock();
        }
      }

      const checkTimeDifference = async () => {
        const lastUpdateAtTime: any = new Date(currentMetaDataRef.current.updated_at);
        const currentTime: any = new Date();
        const timeDifference: any = currentTime - lastUpdateAtTime;

        // Check if the time difference is more than 15 minutes (15 * 60 * 1000 milliseconds)
        if (timeDifference > 15 * 60 * 1000) {
          if (!hasLockExpiredModalShown) {
            showLockExpiredModal();
            setHasLockExpiredModalShown(true)
          }
        }
      };

      // Call the function to check time difference
      if (
        currentMetaDataRef.current && currentMetaDataRef.current.EntryLocked && currentMetaDataRef.current?.entity_uid ===
        appSdk?.location?.CustomField?.entry?._data?.uid
      ) {
        checkTimeDifference();
      }
    }, 60000);
    return () => clearInterval(intervalId);
  }, [appSdk, isEntryChanged]);

  // Handle onChange event
  React.useEffect(() => {
    const entry: any = appSdk?.location.CustomField?.entry;
    if (extensionUid === "") return;
    entry.onChange((whatChanged: any) => handleChange(whatChanged));
  }, [appSdk, extensionUid]);

  React.useEffect(() => {
    if (
      currentUserData.isAdmin ||
      currentUserData?.uid === fieldData?.user?.uid ||
      fieldData?.status === 0
    ) {
      setButtonDisabled(false);
      setDataLoading(false);
      return;
    } else {
      setDataLoading(true);
      setButtonDisabled(true);
    }
  }, [currentUserData.isAdmin, currentUserData?.uid, fieldData?.user?.uid,isUnlockEntryModalOpen]);

  const showUnlockModal = () => {
    setIsUnlockEntryModalOpen(true);
    cbModal({
      component: ({ closeModal }: { closeModal: () => void }) => (
        <UnlockEntryModal
          currentMetaData={currentMetaData}
          unlockAction={unLockEntry}
          closeModal={() => {
            closeModal();
            setIsUnlockEntryModalOpen(false); // Close the modal and update state
          }}
        />
      ),
    });
  };

  const showLockExpiredModal = () => {
    setIsLockExpriedModalOpen(true);
    cbModal({
      component: ({ closeModal }: { closeModal: () => void }) => ( 
        <LockExpiredModal 
          currentMetaData={currentMetaData} 
          unlockAction={unLockEntry} 
          closeModal={() => {
            closeModal();
            setIsLockExpriedModalOpen(false); // Close the modal and update state
            setHasLockExpiredModalShown(false);
          }}
        />
      ),
    });
  };

  const handleSaveEntry = React.useCallback(async (): Promise<void> => {
    try {
      const entry = appSdk?.location?.CustomField?.entry;
      if (!entry) return;

      entry.onSave(() => {
        unLockEntry();
      });
    } catch (error) {
      console.error("Error saving entry:", error);
    }
  }, [appSdk]);

  React.useEffect(() => {
    if (appSdk) {
      fetch("/api/contentstack/extension/metadata")
        .then((response) => response.json())
        .then((data) => {
          if (data?.extensionUid && data.extensionUid !== "") {
            setExtensionUid(data.extensionUid);
            setIsReady(true);
          }
        });
    }
  }, [appSdk]);

  React.useEffect(() => {
    if (isReady) {
      handleSaveEntry();
    }
  }, [isReady, handleSaveEntry]);

  // Do not render output if appSdk is not available.
  if (!appSdk) return null;

  let entryLockMessage = "Entry is unlocked.";
  let entryIsLocked = false;
  if (currentMetaData !== null) {
    entryLockMessage = "Entry is locked.";
    if (currentMetaData.updated_by === currentUserData.uid) {
      entryLockMessage =
        "Entry locked. Save changes before unlocking or going inactive to prevent data loss.";
    }
    entryIsLocked = true;
  }

  return (
    <>
      <ShowModal />
      <div className="flex flex-row justify-center items-center w-full pr-2">
        <Info
          icon={<Icon icon={entryIsLocked ? "Error" : "Success"} />}
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
                    if (entryIsLocked) {
                      showUnlockModal();
                    } else {
                      createEntryLock().then(() => {
                        setDataLoading(false);
                      });
                    }
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

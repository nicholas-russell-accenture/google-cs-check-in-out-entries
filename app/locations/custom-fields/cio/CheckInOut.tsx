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
  const [appToken, setAppToken] = React.useState<string | null>(null);
  const [branch, setBranch] = React.useState<string | null>(null);
  const [dataLoading, setDataLoading] = React.useState<boolean>(false);
  const [buttonDisabled, setButtonDisabled] = React.useState<boolean>(true);
  const [currentMetaData, setCurrentMetaData] = React.useState<any>(undefined);
  const [isUnlockEntryModalOpen, setIsUnlockEntryModalOpen] =
    React.useState(false);
  const [extensionUid, setExtensionUid] = React.useState<string>("");
  const [contentstackAppDomain, setContentstackAppDomain] =
    React.useState<string>("");

  const [isReady, setIsReady] = React.useState(false);

  // Create a ref to hold the latest currentMetaData
  const currentMetaDataRef = React.useRef(currentMetaData);

  // Define Refs for modals
  const lockExpiredModalVisibleRef = React.useRef(false);
  const entryIsLockedModalVisibleRef = React.useRef(false);
  const lastChangeTimestampRef = React.useRef<number | undefined>(undefined);
  const [attemptToLockFailed, setAttemptToLockFailed] = React.useState(false);

  const deleteMetadata = async (metadataId: string, appToken: string) => {

    if (branch === null) {
      console.log("Unlock attempt failed: branch value is not available for use in request.");
      return;
    }

    try {
      const entryLockMetadataApiEndpointCallResponse = await fetch(
        `/api/contentstack/extension/metadata/delete?app-token=${appToken}&metadataId=${metadataId}&branch=${branch}`,
        {
          method: "DELETE", // Set the HTTP method to DELETE
          headers: {
            "Content-Type": "application/json", // Optional, if you're sending JSON data
          },
        }
      );

      // Check if the response was successful
      if (!entryLockMetadataApiEndpointCallResponse.ok) {
        console.log(
          "Failure response:",
          entryLockMetadataApiEndpointCallResponse
        );
        throw new Error("Failed to delete metadata");
      } else {
        // Entry lock metadata was successfully deleted.
        await entryLockMetadataApiEndpointCallResponse.json();

        // Delete metadata
        currentMetaDataRef.current = undefined;
        setCurrentMetaData(undefined);
        return true;
      }
    } catch (error) {
      console.error("Error deleting metadata:", error);
    }
  };

  // Effect to update the ref when currentMetaData changes
  React.useEffect(() => {
    currentMetaDataRef.current = currentMetaData;
  }, [currentMetaData]);

  // Determine whether or not the entry is locked.
  // If locked, show the modal to request an unlock or return to dashboard.
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

        setCurrentMetaData(filteredEntry[0]);

        const showEntryIsLockedModal = () => {
          setTimeout(() => {
            cbModal({
              component: () => (
                <RequestUnlockModal
                  currentMetaData={filteredEntry[0]}
                  appSdk={appSdk}
                  contentstackAppDomain={contentstackAppDomain}
                />
              ),
              modalProps: {
                onClose: () => {
                  showEntryIsLockedModal();
                },
              },
            });
          }, 0);
        };

        if (
          filteredEntry?.length != 0 &&
          contentstackAppDomain !== "" &&
          filteredEntry[0].created_by !== currentUserData.uid &&
          !entryIsLockedModalVisibleRef.current
        ) {
          entryIsLockedModalVisibleRef.current = true;
          showEntryIsLockedModal();
        }
      } catch (error) {
        console.error("Error retrieving entry lock meta-data:", error);
      }
    };

    fetchMetadata();
  }, [appSdk, currentUserData, contentstackAppDomain, attemptToLockFailed]);

  // Unlocks the entry.
  const unLockEntry = React.useCallback(async (): Promise<void> => {
    if (!appSdk) return; // Exit if appSdk is not available.

    // Check if currentMetaData matches the entry being unlocked
    if (
      currentMetaDataRef.current?.entity_uid ===
      appSdk?.location?.CustomField?.entry?._data?.uid
    ) {
      try {
        // We need the JWT app-token from the URL for security reasons (verifies the identity of the user).
        if (appToken) {
          // Call the deleteMetadata function to unlock the entry.
          const deleteMetadataResponse = await deleteMetadata(
            currentMetaDataRef.current.uid,
            appToken
          );

          if (deleteMetadataResponse) {
            // Set CurrentMetaData and currentMetaDataRef.current to undefined after unlocking
            setCurrentMetaData(undefined);
            setDataLoading(false);
            currentMetaDataRef.current = undefined;
            lastChangeTimestampRef.current = undefined;
          } else {
            console.log("Unable to delete the entry lock metadata.");
          }
        } else {
          console.log("App Token is not set. Cannot unlock entry.");
        }

        return fieldData.status;
      } catch (error) {
        console.error("Error unlocking entry:", error);
      }
    }
  }, [appSdk, appToken]);

  // Create entry lock meta-data
  const createEntryLock = React.useCallback(async (): Promise<void> => {
    const entryId: any = appSdk?.location?.CustomField?.entry?._data?.uid;
    const contentTypeUid: any =
      appSdk?.location?.CustomField?.entry?.content_type?.uid;

    if (!appSdk || extensionUid == "") {
      console.error(
        "Error creating an entry lock meta-data entry: either the appSdk or extensionUid is not available."
      );
      return; // App SDK is not available.
    }

    // Get the browser's current time.
    const currentDate = new Date();
    const currentTime = currentDate.toLocaleTimeString();
    if (currentMetaDataRef.current == undefined) {
      try {
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
        setAttemptToLockFailed(true);
      }
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

        const currentTimestamp = Date.now();
        lastChangeTimestampRef.current = currentTimestamp;
      } else {
        console.log("Entry lock meta-data entry creation failed.");
      }
    } catch (error) {
      console.error("Error creating entry lock:", error);
    }
  }, [appSdk, currentUserData]);

  const handleChange = async (whatChanged: any) => {
    // Function to compare original/changed entry and return true if they are different
    function compareObjects(changedObject: any, originalObject: any) {
      // Do not compare if either object is undefined or null. This may create a false positive.
      if (changedObject === undefined || originalObject === undefined || changedObject === null || originalObject === null) {
        return false;
      }

      // Boolean to track if changes to the entry are detected.
      let hasChanges = false;

      // Function to recursively compare each key
      function compareKeys(changed: any, original: any, parentKey = "") {
        // Loop through the keys in the changed object
        for (const key in changed) {
          if (changed.hasOwnProperty(key)) {
            const changedValue = changed[key];
            const originalValue = original[key];

            // New content (likely a new line) in an RTE field. Ignore "entry_lock" field.
            if (original[key] === undefined && key !== "entry_lock") {
              hasChanges = true;
            }

            // Check if the tags have changed.
            if (key === 'tags' && changed.tags && original.tags) {
              for (let i = 0; i < original.tags.length; i++) {
                if (original.tags[i] !== changed.tags[i]) {
                  hasChanges = true;
                }
              }
            }

            // Construct the full path of the key
            const fullKey = parentKey ? `${parentKey}.${key}` : key;

            // If both values are objects, recursively compare them
            if (
              typeof changedValue === "object" &&
              changedValue !== null &&
              typeof originalValue === "object" &&
              originalValue !== null
            ) {
              compareKeys(changedValue, originalValue, fullKey);
            } else {
              // If the values are different, log the change and mark hasChanges as true
              if (originalValue !== undefined && changedValue !== originalValue) {
                hasChanges = true;
              }
            }
          }
        }
      }

      // Start comparing the original entry vs. the changed entry.
      compareKeys(changedObject, originalObject);

      return hasChanges;
    }

    const currentTimestamp = Date.now();
    if (lastChangeTimestampRef.current !== undefined) {
      // Get the time since the last change
      const timeSinceLastChange =
        currentTimestamp - lastChangeTimestampRef.current;

      // If the time since the last change is greater than 59 seconds.
      if (timeSinceLastChange >= 59000) {
        if (
          compareObjects(
            whatChanged,
            appSdk?.location?.CustomField?.entry?._data
          )
        ) {
          lastChangeTimestampRef.current = currentTimestamp;
          console.log(
            "Updating last changed timestamp.",
            lastChangeTimestampRef.current
          );
          updateEntryLock();
        }
      } else {
        console.log(
          "No need to update entry lock yet, it's only been",
          timeSinceLastChange,
          "milliseconds."
        );
      }
    } else {
      // Create a new lock if entry is unlocked.
      if (
        currentMetaDataRef.current === undefined &&
        fieldData?.status === 0 &&
        compareObjects(whatChanged, appSdk?.location?.CustomField?.entry?._data)
      ) {
        await createEntryLock();
        console.log("Locking Entry.");
        lastChangeTimestampRef.current = currentTimestamp;
        console.log(
          "Updating last changed timestamp.",
          lastChangeTimestampRef.current
        );
      }
    }
  };

  // Every 60 seconds, update the entry lock metadata with the latest timestamp.
  React.useEffect(() => {
    if (
      appSdk &&
      currentMetaDataRef.current &&
      currentMetaDataRef.current?.created_by === currentUserData?.uid &&
      currentMetaDataRef.current.EntryLocked
    ) {
      const intervalId = setInterval(async () => {
        const checkTimeDifference = async () => {
          const lastUpdateAtTime: any = new Date(
            currentMetaDataRef.current.updated_at
          );
          const currentTime: any = new Date();
          const timeDifference: any = currentTime - lastUpdateAtTime;

          // Check if the time difference is more than 15 minutes (15 * 60 * 1000 milliseconds)
          if (timeDifference > 15 * 60 * 1000 - 1000) {
            if (!lockExpiredModalVisibleRef.current) {
              // Stop the counter
              clearInterval(intervalId);

              try {
                // We need the JWT app-token from the URL for security reasons (verifies the identity of the user).
                if (appToken) {
                  // Call the deleteMetadata function to unlock the entry.
                  const deleteMetadataResponse = await deleteMetadata(
                    currentMetaDataRef.current.uid,
                    appToken
                  );

                  if (deleteMetadataResponse) {
                    // Set CurrentMetaData and currentMetaDataRef.current to undefined after unlocking
                    setCurrentMetaData(undefined);
                    setDataLoading(false);
                    currentMetaDataRef.current = undefined;
                    lastChangeTimestampRef.current = undefined;

                    // Show the modal that indicates that the lock is expired.
                    showLockExpiredModal();
                  } else {
                    console.log("Unable to delete the entry lock metadata.");
                  }
                } else {
                  console.log("App Token is not set. Cannot unlock entry.");
                }

                return fieldData.status;
              } catch (error) {
                console.error("Error unlocking entry:", error);
              }
            }
          }
        };

        checkTimeDifference();
      }, 60000);
      return () => clearInterval(intervalId);
    }

    // Current user has not locked the entry.
    return () => false;
  }, [appSdk, currentMetaData, currentUserData, currentMetaDataRef.current]);

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
  }, [
    currentUserData.isAdmin,
    currentUserData?.uid,
    fieldData?.user?.uid,
    isUnlockEntryModalOpen,
  ]);

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
    lockExpiredModalVisibleRef.current = true;
    cbModal({
      component: ({ closeModal }: { closeModal: () => void }) => (
        <LockExpiredModal
          currentMetaData={currentMetaData}
          unlockAction={unLockEntry}
          closeModal={() => {
            closeModal();
            lockExpiredModalVisibleRef.current = false;
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
  }, [appSdk, appToken]);

  React.useEffect(() => {
    if (appSdk) {
      // Get the current branch.
      if (appSdk?.stack?.getCurrentBranch()?.uid) {
        const branchUid = appSdk.stack.getCurrentBranch()?.uid;
        if (branchUid) {
          setBranch(branchUid);
        }
      }

      // Find existing metadata.
      fetch("/api/contentstack/extension/metadata")
        .then((response) => response.json())
        .then((data) => {
          if (
            data?.extensionUid &&
            data.extensionUid !== "" &&
            data?.contentstackAppDomain &&
            data.contentstackAppDomain !== ""
          ) {
            setExtensionUid(data.extensionUid);
            setContentstackAppDomain(data.contentstackAppDomain);
            setIsReady(true);
          }
        });

      // Get and store the signed access-token.
      const queryParams = new URLSearchParams(window.location.search);
      const token = queryParams.get("app-token"); // Extract app-token from URL
      if (token) {
        setAppToken(token); // Store the app-token in state
      }
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

  if (currentMetaData !== undefined) {
    entryLockMessage = "Entry is locked.";
    if (currentMetaData?.updated_by === currentUserData.uid) {
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

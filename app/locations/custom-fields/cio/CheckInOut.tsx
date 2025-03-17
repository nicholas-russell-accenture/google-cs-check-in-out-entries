/* eslint-disable @typescript-eslint/no-wrapper-object-types */
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
import OnSaveMandatoryFieldModal from "@/app/components/OnSaveMandatoryFieldModal";

const CheckInOut = () => {
  const appSdk = useAppSdk();
  const { fieldData, currentUserData } = useCheckOutData();
  const [appToken, setAppToken] = React.useState<string | null>(null);
  const [branch, setBranch] = React.useState<string | null>(null);
  const [dataLoading, setDataLoading] = React.useState<boolean>(false);
  const [buttonDisabled, setButtonDisabled] = React.useState<boolean>(true);
  const [currentMetaData, setCurrentMetaData] = React.useState<any>(undefined);
  const [currentAutoSaveEntryMetaData, setCurrentAutoSaveEntryMetaData] =
    React.useState<any>(undefined);
  const [isUnlockEntryModalOpen, setIsUnlockEntryModalOpen] =
    React.useState(false);
  const [extensionUid, setExtensionUid] = React.useState<string>("");
  const [contentstackAppDomain, setContentstackAppDomain] =
    React.useState<string>("");

  const [isReady, setIsReady] = React.useState(false);
  const [isDraftInActive, setIsDraftInActive] = React.useState(false);

  // Create a ref to hold the latest currentMetaData
  const currentMetaDataRef = React.useRef(currentMetaData);

  // Create a ref to hold the latest currenAutoSaveEntrytMetaData
  const currentAutoSaveEntryMetaDataRef = React.useRef<any>(undefined);

  // Define Refs for modals
  const lockExpiredModalVisibleRef = React.useRef(false);
  const entryIsLockedModalVisibleRef = React.useRef(false);
  const lastChangeTimestampRef = React.useRef<number | undefined>(undefined);
  const [attemptToLockFailed, setAttemptToLockFailed] = React.useState(false);

  // Deletes entry lock metadata.
  const deleteMetadata = async (metadataId: string, appToken: string) => {
    if (branch === null) {
      console.log(
        "Unlock attempt failed: branch value is not available for use in request."
      );
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
  const showMandatoryFieldModalRef = React.useRef(false);

  const showMandatoryFieldModal = () => {
    if (
      appSdk?.location?.CustomField?.entry?.content_type?.uid ==
        "sdp_knowledge_article" ||
      appSdk?.location?.CustomField?.entry?.content_type?.uid ==
        "sdp_troubleshooter"
    ) {
      if (showMandatoryFieldModalRef.current) return;
      showMandatoryFieldModalRef.current = true;
      cbModal({
        component: ({ closeModal }: { closeModal: () => void }) => (
          <OnSaveMandatoryFieldModal
            closeModal={() => {
              console.log("closeModal :");
              showMandatoryFieldModalRef.current = false;
              closeModal();
            }}
            appSdk={appSdk}
          />
        ),
      });
    }
  };
  // Pop up to set audience field data
  React.useEffect(() => {
    // Populate value of audience field if it is set in "Entry Lock" field storage, but is empty in "Audience" field storage
    if (
      appSdk?.location?.CustomField?.entry._data.uid &&
      appSdk?.location?.CustomField?.entry._data?.sdp_article_audience
        ?.sdp_audience !== "Googlers" &&
      appSdk?.location?.CustomField?.entry._data?.sdp_article_audience
        ?.sdp_audience !== "Resolvers" &&
      ((appSdk?.location?.CustomField?.field.getData() as String) ==
        "Googlers" ||
        (appSdk?.location?.CustomField?.field.getData() as String) ==
          "Resolvers")
    ) {
      const entry = appSdk.location.CustomField.entry;
      const audienceField = entry.getField("sdp_article_audience.sdp_audience"); // Retrieve the specific field

      // Set the new value for the sdp_audience field
      audienceField.setData(appSdk?.location?.CustomField?.field.getData());
    }

    if (
      // Entry is new and neither Entry Lock field nor Audience field is set to "Googlers" or "Resolvers".
      (!appSdk?.location?.CustomField?.field._data && // Entry lock custom field value is empty. &&
        !appSdk?.location?.CustomField?.entry._data.uid && // Entry is new (no UID exists). &&
        appSdk?.location?.CustomField?.entry?._data.sdp_article_audience
          ?.sdp_audience != "Googlers" &&
        appSdk?.location?.CustomField?.entry?._data.sdp_article_audience
          ?.sdp_audience != "Resolvers") || // or...
      // Entry is not new and neither Entry Lock field nor Audience field is set to "Googlers" or "Resolvers".
      (appSdk?.location?.CustomField?.entry._data.uid && // Entry is not new (UID exists). &&
        (appSdk?.location?.CustomField?.field.getData() as String) !==
          "Googlers" && // Entry Lock field is not "Googlers". &&
        (appSdk?.location?.CustomField?.field.getData() as String) !==
          "Resolvers" && // Entry Lock field is not "Resolvers".
        appSdk?.location?.CustomField?.entry?._data.sdp_article_audience
          ?.sdp_audience !== "Googlers" &&
        appSdk?.location?.CustomField?.entry?._data.sdp_article_audience
          ?.sdp_audience !== "Resolvers")
    ) {
      console.log("Conditions not met");
      showMandatoryFieldModal(); //opn pup up on load for setting Audience field
    }
  }, []);

  // Determine whether or not the entry is locked.
  // If locked, show the modal to request an unlock or return to dashboard.
  React.useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const entityUidToCheck = appSdk?.location.CustomField?.entry._data.uid;
        const resData = await appSdk?.metadata?.retrieveAllMetaData();
        // for check Entry lock
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

  // Effect to update the ref when currentAutoSaveEntryMetaData changes
  React.useEffect(() => {
    if (currentAutoSaveEntryMetaData !== undefined) {
      currentAutoSaveEntryMetaDataRef.current = currentAutoSaveEntryMetaData;
    }
  }, [currentAutoSaveEntryMetaData]);

  // for save entry inside auto-save extension
  const saveEntryInMetadata = React.useCallback(
    async (appToken: string): Promise<void> => {
      console.log("Attempt to save entry draft.");

      // Info about the entry and content type.
      const entryId: any = appSdk?.location?.CustomField?.entry?._data?.uid;
      const contentTypeUid: any =
        appSdk?.location?.CustomField?.entry?.content_type?.uid;
      const currentDate = new Date();
      const currentTime = currentDate.toLocaleTimeString();
      const copyOfChangedEntry: any =
        appSdk?.location?.CustomField?.entry?._changedData;

      if (copyOfChangedEntry) {
        copyOfChangedEntry._version =
          appSdk?.location?.CustomField?.entry?._data?._version || 1;
        copyOfChangedEntry.uid =
          appSdk?.location?.CustomField?.entry?._data?.uid;
        delete copyOfChangedEntry._metadata;
        delete copyOfChangedEntry._embedded_items;

        // if (currentAutoSaveEntryMetaDataRef.current === undefined) {
        // Define the API endpoint
        const apiUrl = "/api/contentstack/draft_entry";

        try {
          const branch = process.env.NEXT_PUBLIC_CONTENTSTACK_BRANCH
            ? process.env.NEXT_PUBLIC_CONTENTSTACK_BRANCH
            : "gintegration";
          // Send the POST request with the draftEntry object as the payload
          const response = await fetch(
            apiUrl + "?app-token=" + appToken + "&branch=" + branch,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json", // Ensure the server knows it's JSON
              },
              body: JSON.stringify({
                draftEntry: {
                  title: `Draft: ${contentTypeUid}: ${copyOfChangedEntry.uid}: ${currentTime}`,
                  entry_object: JSON.stringify({
                    draftEntry: {
                      entity_uid: entryId,
                      _content_type_uid: contentTypeUid,
                      entry: JSON.stringify(copyOfChangedEntry),
                      userName: currentUserData?.name,
                      currentUserTime: currentTime,
                    },
                  }),
                  entry_uid: entryId,
                  user_uid: currentUserData?.uid,
                },
              }),
            }
          );

          // Handle the response
          if (response.ok) {
            // Parse the response JSON
            const data = await response.json();
            const draftEntryUid = data?.result?.entry?.uid;
            const draftEntryCreatedAt = data?.result?.entry?.created_at;
            if (draftEntryUid) {
              addDraftInfoToMetadata(draftEntryUid, draftEntryCreatedAt);
            }
            return data; // Return the response data
          } else {
            // Handle errors, if any
            const errorData = await response.json();
            console.error("Failed to post draft entry:", errorData);
            throw new Error(errorData.error || "Failed to post draft entry");
          }
        } catch (error) {
          console.error("Error posting draft entry:", error);
          throw new Error("An error occurred while posting the draft entry.");
        }
      }
    },
    [appSdk, currentUserData]
  );

  // for update entry inside auto-save extension
  const addDraftInfoToMetadata = React.useCallback(
    async (
      draftEntryUid: string,
      draftEntryCreatedAt: string
    ): Promise<void> => {
      if (!appSdk) return; // App SDK is not available.
      const entryId: any = appSdk?.location?.CustomField?.entry?._data?.uid;
      const AutoSaveExtensionUid = process.env
        .NEXT_PUBLIC_CONTENTSTACK_AUTOSAVE_EXTENSION_UID
        ? process.env.NEXT_PUBLIC_CONTENTSTACK_AUTOSAVE_EXTENSION_UID
        : "";

      // First, find if metadata item already exists:
      const allRetrievedMetadata =
        await appSdk?.metadata?.retrieveAllMetaData();
      const draftMetadataForCurrentEntry: any =
        allRetrievedMetadata?.metadata.filter((item) => {
          return (
            item.entity_uid === entryId &&
            item.extension_uid === AutoSaveExtensionUid
          );
        });

      if (draftMetadataForCurrentEntry.length > 0) {
        console.log("Attempt to update metadata", draftMetadataForCurrentEntry);
        setCurrentAutoSaveEntryMetaData(draftMetadataForCurrentEntry);
        if (draftMetadataForCurrentEntry?.[0]?.drafts) {
          draftMetadataForCurrentEntry[0].drafts.push({
            draft_entry_uid: draftEntryUid,
            draft_entry_created_at: draftEntryCreatedAt,
            draft_entry_created_by_uid: currentUserData?.uid,
          }); // Pushes to an existing drafts array.
        }
        const updateAvailableDraftsMetadataResponse =
          await appSdk?.metadata.updateMetaData({
            uid: draftMetadataForCurrentEntry[0].uid,
            testAddingProperty: undefined, // Cleanup
            autoDraft: undefined, // Cleanup
            currentUserTime: undefined, // Cleanup
            deleted_at: undefined, // Cleanup
            updated_at: undefined, // Cleanup
            updated_by: undefined, // Cleanup
            userName: undefined, // Cleanup
            entry: undefined, // Cleanup
            drafts: draftMetadataForCurrentEntry?.[0]?.drafts
              ? draftMetadataForCurrentEntry[0].drafts
              : [
                  {
                    draft_entry_uid: draftEntryUid,
                    draft_entry_created_at: draftEntryCreatedAt,
                    draft_entry_created_by_uid: currentUserData?.uid,
                  },
                ], // Creates a new single draft.
          });
        console.log(
          "Update available drafts metadata response:",
          updateAvailableDraftsMetadataResponse
        );
      } else {
        // Create new metadata item to track this entry's drafts
        console.log("Attempt to create metadata.");
        if (
          appSdk?.location?.CustomField?.entry?.content_type?.uid !==
            undefined &&
          entryId !== undefined
        ) {
          const newMetadataResponse = await appSdk?.metadata.createMetaData({
            type: "entry",
            extension_uid: AutoSaveExtensionUid,
            _content_type_uid:
              appSdk?.location?.CustomField?.entry?.content_type?.uid,
            entity_uid: entryId,
            drafts: [
              {
                draft_entry_uid: draftEntryUid,
                draft_entry_created_at: draftEntryCreatedAt,
                draft_entry_created_by_uid: currentUserData?.uid,
              },
            ],
          });
          console.log("New metadata response:", newMetadataResponse);
        }
      }
    },
    [appSdk, currentUserData]
  );

  // useEffect to manage interval and calls for update entry in auto save extension
  React.useEffect(() => {
    // Set an interval to check 10 minutes of inactivity
    const checkFor10MinutesOfInactivityInterval = setInterval(() => {
      if (lastChangeTimestampRef.current !== undefined) {
        const now = new Date().getTime();
        console.log(
          "It's been",
          (now - lastChangeTimestampRef.current) / 1000,
          "seconds since the last update time"
        );
        const numberOfSecondsSinceLastChange =
          (now - lastChangeTimestampRef.current) / 1000;

        if (numberOfSecondsSinceLastChange >= 600) {
          console.log("It's been greater than 10 minutes.");
          if (!isDraftInActive) {
            console.log("Draft is not already active.");
            saveEntryInMetadata(appToken ? appToken : "");
            setIsDraftInActive(true);
          } else {
            console.log(
              "Draft is already created since last active timestamp."
            );
          }
        }
      }
      return () => clearInterval(checkFor10MinutesOfInactivityInterval);
    }, 5000);

    // Cleanup function to clear the interval when the component is unmounted
    return () => clearInterval(checkFor10MinutesOfInactivityInterval);
  }, [saveEntryInMetadata, isDraftInActive, appToken]);

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
            setIsDraftInActive(false);
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
    if (currentMetaDataRef.current == undefined && entryId !== undefined) {
      try {
        console.log("Attempt to lock the entry.");
        const response = await appSdk?.metadata.createMetaData({
          entity_uid: entryId,
          type: "entry",
          _content_type_uid: contentTypeUid,
          EntryLocked: true,
          extension_uid: extensionUid,
          createdByUserName: currentUserData?.name,
          currentUserTime: currentTime,
        });

        if (response && response?.metadata?.EntryLocked) {
          console.log("Entry is locked.", response);
          setCurrentMetaData(response.metadata);

          // for clear version notes field when user edit the entry form
          const currentField =
            appSdk?.location?.CustomField?.entry.getField("version_notes");
          if (currentField) {
            currentField.setData({ version_notes: "" });
          }
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
    // if pop closed without selecting value it will re open till the value is set
    // if selected value is removed then pop up will open again
    if (
      (!appSdk?.location?.CustomField?.entry._data.uid &&
        !appSdk?.location?.CustomField?.field._data) ||
      (appSdk?.location?.CustomField?.entry._data.uid &&
        whatChanged?.sdp_article_audience?.sdp_audience !== "Resolvers" &&
        whatChanged?.sdp_article_audience?.sdp_audience !== "Googlers")
    ) {
      if (!showMandatoryFieldModalRef.current) {
        showMandatoryFieldModal();
      }
    }

    // Function to compare original/changed entry and return true if they are different
    function compareObjects(changedObject: any, originalObject: any) {
      // Do not compare if either object is undefined or null. This may create a false positive.
      if (
        changedObject === undefined ||
        originalObject === undefined ||
        changedObject === null ||
        originalObject === null
      ) {
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

            // Check for tags field difference
            if (key === "tags" && Array.isArray(changed.tags) && Array.isArray(original.tags)) {
              if (changed.tags.length !== original.tags.length) {
                hasChanges = true;
              }
              for (let i = 0; i < changed.tags.length; i++) {
                if (changed.tags[i] !== original.tags[i]) {
                  hasChanges = true;
                  console.log("Tag difference detected:", i);
                }
              }
            }

            // Check for keywords field difference
            if (key === "sdp_article_keywords" && Array.isArray(changed.sdp_article_keywords) && Array.isArray(original.sdp_article_keywords)) {
              if (changed.sdp_article_keywords.length !== original.sdp_article_keywords.length) {
                hasChanges = true;
              }
              for (let i = 0; i < changed.sdp_article_keywords.length; i++) {
                if (changed.sdp_article_keywords[i] !== original.sdp_article_keywords[i]) {
                  hasChanges = true;
                  console.log("sdp_article_keywords difference detected:", i);
                }
              }
            }

            // Check for category field difference
            if (key === "taxonomies" && Array.isArray(changed.taxonomies) && Array.isArray(original.taxonomies)) {
              if (changed.taxonomies.length !== original.taxonomies.length) {
                hasChanges = true;
              }
              for (let i = 0; i < changed.taxonomies.length; i++) {
                const changedTaxonomy = changed.taxonomies[i];
                const originalTaxonomy = original.taxonomies[i];

                if (JSON.stringify(changedTaxonomy) !== JSON.stringify(originalTaxonomy)) {
                  hasChanges = true;
                  console.log("Taxonomy difference detected:", i);
                }
              }
            }

            // Check for taxonomy field difference
            if (key === "sdp_article_taxonomy" && Array.isArray(changed.sdp_article_taxonomy) && Array.isArray(original.sdp_article_taxonomy)) {
              if (changed.sdp_article_taxonomy.length !== original.sdp_article_taxonomy.length) {
                hasChanges = true;
              }
              for (let i = 0; i < changed.sdp_article_taxonomy.length; i++) {
                const changedTaxonomy = changed.sdp_article_taxonomy[i];
                const originalTaxonomy = original.sdp_article_taxonomy[i];

                if (JSON.stringify(changedTaxonomy) !== JSON.stringify(originalTaxonomy)) {
                  hasChanges = true;
                  console.log("sdp_article_taxonomy difference detected:", i);
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
              if (
                originalValue !== undefined &&
                changedValue !== originalValue
              ) {
                // Temporary debugging.
                console.log("New Value:", originalValue, changedValue);
                hasChanges = true;
              }
            }
          }
        }
      }

      // Start comparing the original entry vs. the changed entry.
      compareKeys(changedObject, originalObject);

      // Set the "Need for new draft" flag.
      if (hasChanges) {
        setIsDraftInActive(false);
      }
      return hasChanges;
    }

    const currentTimestamp = Date.now();
    if (lastChangeTimestampRef.current !== undefined) {
      // Get the time since the last change
      const timeSinceLastChange =
        currentTimestamp - lastChangeTimestampRef.current;

      // If the time since the last change is greater than 59 seconds.
      if (
        compareObjects(whatChanged, appSdk?.location?.CustomField?.entry?._data)
      ) {
        lastChangeTimestampRef.current = currentTimestamp;
        console.log(
          "Updating last changed timestamp.",
          lastChangeTimestampRef.current
        );
        if (timeSinceLastChange >= 59000) {
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

      entry.onSave(async () => {
        await unLockEntry();
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
        "Entry locked. Save changes before unlocking or going inactive to prevent data loss, or check your available Drafts saved for restoring.";
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

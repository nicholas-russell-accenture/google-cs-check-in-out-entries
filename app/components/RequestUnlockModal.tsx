/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import moment from "moment";
import {
  Button,
  ButtonGroup,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "@contentstack/venus-components";

const RequestUnlockModal = (props: any) => {
  const {
    currentMetaData,
    appSdk,
    contentstackAppDomain
  } = props;

  const GchatModel = async () => {
    const userId = currentMetaData.updated_by;
    const userEmail = appSdk.stack
      .getData()
      .collaborators?.find(
        (collaborator: any) => collaborator.uid === userId
      )?.email;
    return window.open(
      `https://moma.corp.google.com/chat?with=${encodeURIComponent(userEmail)}`,
      "_blank"
    );
  };

  return (
    <>
      <ModalHeader title="Entry Locked" />
      <ModalBody>
        <div className="dummy-body">
          <p>
            Locked at{" "}
            <b>
              {moment(currentMetaData.updated_at).format("MMM D, YYYY, h:mm A")}
            </b>{" "}
            by <b> {currentMetaData.createdByUserName}. </b>
          </p>
          <p>Refresh to check lock status. </p>
        </div>
      </ModalBody>
      <ModalFooter>
        <ButtonGroup>
          <Button buttonType="primary" onClick={GchatModel}>
            Request to unlock
          </Button>
          <Button
            buttonType="primary"
            onClick={() => {
              // Open the link in a new tab
              window.open(
                `${contentstackAppDomain}/#!/stack/${appSdk?.stack?._data?.api_key}/dashboard?branch=${appSdk?.stack?._currentBranch?.uid}`,
                "_blank" // This specifies that the link should open in a new tab
              );
              // document.location.href = `${contentstackAppDomain}/#!/stack/${appSdk?.stack?._data?.api_key}/dashboard?branch=${appSdk?.stack?._currentBranch?.uid}`;
            }}
          >
            Open Dashboard
          </Button>
        </ButtonGroup>
      </ModalFooter>
    </>
  );
};

export default RequestUnlockModal;

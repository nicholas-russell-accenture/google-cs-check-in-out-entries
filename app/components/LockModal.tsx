/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import {
  Button,
  ButtonGroup,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from '@contentstack/venus-components';

import { showSuccess } from './notifications';

const LockModal = (props: any) => {
  const { fieldData, currentUserData, entryData, contextData } = props;
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  return (
    <>
      <ModalHeader title={`Locked Entry`} />
      <ModalBody className="modalBodyCustomClass">
        <div className="body">
          This entry is currently checked out by: {fieldData?.user?.name}
        </div>
      </ModalBody>

      <ModalFooter>
        <ButtonGroup>
          <Button
            isLoading={isLoading}
            onClick={() => {
              //TODO: CALL AUTOMATE HTTP TRIGGER
              fetch(
                'https://app.contentstack.com/automations-api/run/6930d0ffd3d14d9ba928f6cfb240748f',
                {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    entryUid: entryData?.uid,
                    contentTypeUid: entryData?.content_type?.uid,
                    lockUserUid: currentUserData?.uid,
                    requestUserUid: fieldData?.user?.uid,
                    branch: contextData?.branch,
                    api_key: contextData?.api_key,
                    locale: entryData?.locale,
                  }),
                }
              ).then(() => {
                setIsLoading(false);
                showSuccess(
                  'Success',
                  `Request has been sent to ${fieldData.user.name}`
                );
              });
            }}
            icon="Send"
          >
            Request Check In
          </Button>
        </ButtonGroup>
      </ModalFooter>
    </>
  );
};

export default LockModal;

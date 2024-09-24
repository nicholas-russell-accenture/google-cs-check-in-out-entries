/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import {
  ButtonGroup,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from '@contentstack/venus-components';

const ReloadModal = (props: any) => {
  const { status } = props;
  return (
    <>
      <ModalHeader title={`${status === 1 ? 'Check Out' : 'Checked In'}`} />
      <ModalBody className="modalBodyCustomClass">
        {status === 1 && (
          <div className="dummy-body">
            The entry has been checked out. Please reload your browser for the
            change to take effect.
          </div>
        )}
        {status === 0 && (
          <div className="dummy-body">
            The entry has been checked in. Please reload your browser for the
            change to take effect.
          </div>
        )}
      </ModalBody>

      <ModalFooter>
        <ButtonGroup></ButtonGroup>
      </ModalFooter>
    </>
  );
};

export default ReloadModal;

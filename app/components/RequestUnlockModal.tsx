/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import {
    ButtonGroup,
    Button,
    ModalBody,
    ModalFooter,
    ModalHeader,
    Icon,
} from '@contentstack/venus-components';

const RequestUnlockModal = (props: any) => {
    const { currentMetaData } = props;
  
    return (
        <>
            <ModalHeader title="Locked Entry" />
            <ModalBody className="modalBodyCustomClass">
                <div className="dummy-body">
                    This Entry is currently checked out by : {currentMetaData.createdByUserName}
                </div>
            </ModalBody>
            <ModalFooter>
                <ButtonGroup>
                    <Button 
                        buttonType="secondary">
                        Go to Dashboard
                    </Button> 
                    <Button buttonType="primary"> 
                        <Icon icon='Send' />Request Unlock 
                    </Button>
                </ButtonGroup>
            </ModalFooter>
        </>
    );
}

export default RequestUnlockModal;

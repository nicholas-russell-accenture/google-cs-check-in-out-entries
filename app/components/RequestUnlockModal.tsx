/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import moment from 'moment';
import {
    Button,
    ButtonGroup,
    ModalBody,
    ModalFooter,
    ModalHeader
} from '@contentstack/venus-components';

const RequestUnlockModal = (props: any) => {
    const { currentMetaData } = props;
    return (
        <>
            <ModalHeader title="Entry Locked" />
            <ModalBody className="modalBodyCustomClass">
                <div className="dummy-body">
                    <p> This Entry was locked on <b>{moment(currentMetaData.updated_at).format('MMM D, YYYY, h:mm A')}</b> by: <b> {currentMetaData.createdByUserName} </b> - Refresh to check lock status </p>
                </div>
            </ModalBody>
            <ModalFooter>
                <ButtonGroup>
                    <Button buttonType="primary">Request to unlock</Button>
                    <Button buttonType="primary">View Live Preview</Button>
                    <Button buttonType="primary">Back to Dashboard</Button>
                </ButtonGroup>
            </ModalFooter>
        </>
    );
}

export default RequestUnlockModal;

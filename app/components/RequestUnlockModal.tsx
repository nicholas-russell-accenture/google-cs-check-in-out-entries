/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import moment from 'moment';
import {
    ModalBody,
    ModalHeader
} from '@contentstack/venus-components';

const RequestUnlockModal = (props: any) => {
    const { currentMetaData } = props;
    return (
        <>
            <ModalHeader title="Entry Locked" />
            <ModalBody className="modalBodyCustomClass">
                <div className="dummy-body">
                    <p> This Entry was locked on <b>{moment(currentMetaData.updated_at).format('MMM D, YYYY, h:mm A')}</b> by : <b> {currentMetaData.createdByUserName} </b> - Refresh to check lock status </p>
                    <br></br>
                    <p>A link to start a chat with the user who holds the current lock will be available - Link text: <a>Request to unlock</a></p>
                    <p>A link to the Live Preview - <a>View Live Preview</a></p>
                    <p>A link to go back to Dashboard -<a>Back to Dashboard</a></p>
                </div>
            </ModalBody>
        </>
    );
}

export default RequestUnlockModal;

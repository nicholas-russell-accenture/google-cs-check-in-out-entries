/* eslint-disable @typescript-eslint/no-unused-expressions */
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

import { useCheckOutData } from "@/app/hooks/useCheckOutData";
const RequestUnlockModal = (props: any) => {
    const { currentMetaData, appSdk } = props;
    const { contextData } = useCheckOutData();
    const GchatModel = async () => {
        const userId = currentMetaData.updated_by;
        const userEmail =appSdk.stack.getData().collaborators?.find((collaborator: any) => collaborator.uid === userId)?.email
        console.log("userEmail :::::::::::: ",userEmail);
        return window.open(`https://mail.google.com/chat/u/0/#chat/welcome?email=${encodeURIComponent(userEmail)}`, '_blank');
      };

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
                    <Button buttonType="primary" onClick={GchatModel}>Request to unlock</Button>
                    <Button buttonType="primary">View Live Preview</Button>
                    <Button buttonType="primary" onClick={() => {
                        document.location.href = `https://app.contentstack.com/#!/stack/${contextData?.api_key}/dashboard?branch=${contextData?.branch}`; 
                    }}>Back to Dashboard</Button>
                </ButtonGroup>
            </ModalFooter>
        </>
    );
}

export default RequestUnlockModal;

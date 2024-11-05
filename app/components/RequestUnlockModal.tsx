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
    const { currentMetaData } = props;
    const { contextData } = useCheckOutData();
    const openIframe = () => {
        const newTab = window.open('', '_blank');
        if (newTab) {
          newTab.document.write(`
            <!DOCTYPE html>
            <html>
              <head>
                <title>Iframe Example</title>
                <style>
                  body { margin: 0; }
                  iframe { width: 100%; height: 100vh; border: none; }
                </style>
              </head>
              <body>
                <iframe src="https://supportcenter.corp.google.com/preview/techstop?origin=gcp-na-app.contentstack.com&%2Ftechstop%2Farticle%2Fbltb6d6c5ab0a7f1cf9="></iframe>
              </body>
            </html>
          `);
          newTab.document.close(); // Close the document to render the content
        } else {
          alert('Please allow popups for this website');
        }
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
                    <Button buttonType="primary">Request to unlock</Button>
                    <Button buttonType="primary" onClick={openIframe}>View Live Preview</Button>
                    <Button buttonType="primary" onClick={() => {
                        document.location.href = `https://app.contentstack.com/#!/stack/${contextData?.api_key}/dashboard?branch=${contextData?.branch}`; 
                    }}>Back to Dashboard</Button>
                </ButtonGroup>
            </ModalFooter>
        </>
    );
}

export default RequestUnlockModal;

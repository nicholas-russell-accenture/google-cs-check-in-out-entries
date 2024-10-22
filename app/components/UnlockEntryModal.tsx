import React from 'react';
import {
    ButtonGroup,
    Button,
    ModalBody,
    ModalFooter,
    ModalHeader,
    cbModal
} from '@contentstack/venus-components';
import ReloadModal from './ReloadModal';

const UnlockEntryModal = (props: any) => {
    const { unlockAction, closeModal } = props;

    const handleUnlock = async () => {
        const status = await unlockAction();
        closeModal(); // Close the modal after invoking unlockAction

        // Check the returned status and open ReloadModal if status is 0
        if (status === 0) {
            cbModal({
                component: (props: any) => <ReloadModal status={status} />,
            });
        }
    };

    return (
        <>
            <ModalHeader title="Locked Entry" />
            <ModalBody className="modalBodyCustomClass">
                <div className="dummy-body">
                    <p>
                        Are you sure you want to unlock this Entry?
                    </p>
                    <br></br>
                    <p>
                        Please consider saving your changes if you have not yet. To save changes click "Cancel" and then save your changes.
                    </p>
                </div>
            </ModalBody>
            <ModalFooter>
                <ButtonGroup>
                    <Button
                        buttonType="secondary"
                        onClick={handleUnlock}
                    >
                        Continue
                    </Button>
                    <Button
                        buttonType="primary"
                        onClick={closeModal}
                    >
                        Cancel
                    </Button>
                </ButtonGroup>
            </ModalFooter>
        </>
    );
};

export default UnlockEntryModal;

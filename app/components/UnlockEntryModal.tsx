import React from "react";
import {
  ButtonGroup,
  Button,
  ModalBody,
  ModalFooter,
  ModalHeader
} from "@contentstack/venus-components";

// Define an interface for the props
interface UnlockEntryModalProps {
  unlockAction: () => Promise<void>; // Assuming unlockAction returns a Promise that resolves to a number
  closeModal: () => void;
  currentMetaData: { created_by: string };
}

const UnlockEntryModal: React.FC<UnlockEntryModalProps> = (props) => {
  const { unlockAction, closeModal } = props;

  const handleUnlock = async () => {
    const status = await unlockAction();
    closeModal(); // Close the modal after invoking unlockAction

    // Check the returned status and open ReloadModal if status is 0
    if (status !== undefined && status === 0) {
      closeModal(); // Close the modal after invoking unlockAction
    }
  };

  return (
    <>
      <ModalHeader title="Locked Entry" />
      <ModalBody className="modalBodyCustomClass">
        <div className="dummy-body">
          <p>Are you sure you want to unlock this Entry?</p>
          <br />
          <p>
            Please consider saving your changes if you have not yet. To save
            changes click &quot;Cancel&quot; and then save your changes.
          </p>
        </div>
      </ModalBody>
      <ModalFooter>
        <ButtonGroup>
          <Button buttonType="secondary" onClick={handleUnlock}>
            Continue
          </Button>
          <Button buttonType="primary" onClick={closeModal}>
            Cancel
          </Button>
        </ButtonGroup>
      </ModalFooter>
    </>
  );
};

export default UnlockEntryModal;

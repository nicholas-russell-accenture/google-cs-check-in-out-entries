import React from "react";
import {
  ButtonGroup,
  Button,
  ModalBody,
  ModalFooter,
  ModalHeader
} from "@contentstack/venus-components";

// Define an interface for the props
interface LockExpiredModalProps {
  unlockAction: () => Promise<void>; // Assuming unlockAction returns a Promise that resolves to a number
  closeModal: () => void;
  currentMetaData: { created_by: string };
}

const LockExpiredModal: React.FC<LockExpiredModalProps> = (props) => {
  const { closeModal } = props;

  return (
    <>
      <ModalHeader title="Lock Expired" />
      <ModalBody className="modalBodyCustomClass">
          <div>
            <p>The lock has expired. Unsaved changes can be restored from your Drafts. Learn more.</p>
          </div>
      </ModalBody>
      <ModalFooter>
        <ButtonGroup>
          <Button buttonType="secondary" onClick={closeModal}>
            Continue
          </Button>
        </ButtonGroup>
      </ModalFooter>
    </>
  );
};

export default LockExpiredModal;
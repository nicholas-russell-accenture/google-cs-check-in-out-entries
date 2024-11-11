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
  const { unlockAction, closeModal } = props;

  // const handleUnlock = async () => {
  //   const status = await unlockAction();
  //   closeModal(); // Close the modal after invoking unlockAction

  //   // Check the returned status and open ReloadModal if status is 0
  //   if (status !== undefined && status === 0) {
  //     closeModal(); // Close the modal after invoking unlockAction
  //   }
  // };

  return (
    <>
      <ModalHeader title="Lock Expired" />
      <ModalBody className="modalBodyCustomClass">
          <div>
            <p>The lock has expired. Please save changes to prevent data loss.</p>
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
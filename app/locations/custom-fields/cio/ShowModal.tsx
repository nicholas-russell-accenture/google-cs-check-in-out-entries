'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import LockModal from '@/app/components/LockModal';
import { useCheckOutData } from '@/app/hooks/useCheckOutData';
import { cbModal } from '@contentstack/venus-components';

export default function ShowModal() {
  const {
    shouldShowModal,
    fieldData,
    currentUserData,
    entryData,
    contextData,
  } = useCheckOutData();

  React.useEffect(() => {
    if (!shouldShowModal) return;
    const modal = cbModal({
      component: (props: any) => (
        <LockModal
          {...props}
          fieldData={fieldData}
          currentUserData={currentUserData}
          entryData={entryData}
          contextData={contextData}
        />
      ),
      modalProps: {
        size: 'customSize',
      },
    });
    return () => {
      modal.closeModal();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

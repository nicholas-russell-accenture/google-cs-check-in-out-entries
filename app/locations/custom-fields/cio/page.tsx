/* eslint-disable @typescript-eslint/ban-ts-comment */
'use client';

import '@contentstack/venus-components/build/main.css';

import dynamic from 'next/dynamic';
import React, { Suspense } from 'react';

import { useAppSdk } from '@/app/hooks/useAppSdk';

const SidebarLocation = dynamic(
  () => import('./SidebarLocation').then((mod) => mod.default),
  { ssr: false }
);

const SidebarPage = () => {
  const appSdk = useAppSdk();
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!appSdk) return;
    const iframeWrapperRef = document.getElementById('cio-root');

    //@ts-ignore
    window.iframeRef = iframeWrapperRef;
    window.postRobot = appSdk.postRobot;
  }, [appSdk]);
  return (
    <div id="cio-root" ref={ref}>
      <Suspense>
        <SidebarLocation />
      </Suspense>
    </div>
  );
};

export default SidebarPage;

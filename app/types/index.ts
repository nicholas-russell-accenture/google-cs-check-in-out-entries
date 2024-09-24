import { IInstallationData } from '@contentstack/app-sdk/dist/src/types';

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface KeyValueObj {
  [key: string]: any;
}

export interface TypeAppSdkConfigState {
  installationData: IInstallationData;
  setInstallationData: (event: any) => any;
  appSdkInitialized: boolean;
}

export interface TypeSDKData {
  config: any;
  location: any;
  appSdkInitialized: boolean;
}

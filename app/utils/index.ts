/* eslint-disable @typescript-eslint/no-explicit-any */

import { KeyValueObj } from '../types';

const mergeObjects = (target: any, source: any) => {
  // Iterate through `source` properties and if an `Object` then
  // set property to merge of `target` and `source` properties
  Object.keys(source)?.forEach((key) => {
    if (source[key] instanceof Object && key in target) {
      Object.assign(source[key], mergeObjects(target[key], source[key]));
    }
  });

  // Join `target` and modified `source`
  Object.assign(target || {}, source);
  return target;
};

const utils = {
  mergeObjects,
};

export const parseJSON = <T>(value: string | null): T => {
  try {
    return value === 'undefined' ? undefined : JSON.parse(value ?? '');
  } catch {
    console.log('parsing error on', { value });
    return undefined as T;
  }
};
export const sleep = (ms: number) => {
  return new Promise((resolve) =>
    setTimeout(() => {
      resolve(true);
    }, ms)
  );
};

export const getUrlEncodedFormData = (params: KeyValueObj) => {
  const formBody: any[] = [];
  for (const property in params) {
    const encodedKey: any = encodeURIComponent(property);
    const encodedValue: any = encodeURIComponent(params[property]);
    formBody.push(encodedKey + '=' + encodedValue);
  }
  return formBody.join('&');
};

export const cleanLocalStorageItem = (item: string) => {
  return item.replaceAll('"', '');
};

export const calculateProgress = (current: number, total: number) => {
  const newProgress = current + 100 / total;
  return newProgress > 100 ? 100 : newProgress;
};

export const throwRanddomError = (percentage: number) => {
  // //Throw an execption 20% of the time to test the retry logic.
  const threshold = 100 / percentage;
  const rand = Math.floor(Math.random() * threshold);
  if (rand === 0) {
    console.log('RANDOM ERROR, SO WE CAN TEST RETRY LOGIC');
    throw new Error('Random error');
  }
};

export const debugEnabled = process.env.NEXT_PUBLIC_NEXTJS_LOGS === 'true';

export const debug = (message?: any, ...optionalParams: any[]): void => {
  if (debugEnabled) {
    console.log(message, ...optionalParams);
  }
};
const keysToRemove = [
  'content_type_uid',
  'created_at',
  'updated_at',
  'created_by',
  'updated_by',
  'ACL',
  'stackHeaders',
  'urlPath',
  '_version',
  '_in_progress',
  '_metadata',
  'update',
  'delete',
  'fetch',
  'publish',
  'unpublish',
  'publishRequest',
  'setWorkflowStage',
  'import',
  '_rules',
  '_workflow',
  'publish_details',
];

// export const cleanUpEntryPayload = (entry: any) => {
//   keysToRemove.map((key) => delete entry[key]);
//   return entry;
// };

export const cleanUpEntryPayload = (obj: any): void => {
  try {
    for (const [k, val] of Object.entries(obj)) {
      if (keysToRemove.includes(k)) delete obj[k];
      const v = val as any;
      if (typeof v === 'object' && v.hasOwnProperty('file_size')) {
        obj[k] = v.uid;
      } else if (typeof v === 'object') {
        if (Array.isArray(v)) {
          const newArray = [];
          for (let i = 0; i < v.length; i++) {
            const subObj = v[i];
            if (
              typeof subObj === 'object' &&
              subObj.hasOwnProperty('file_size')
            ) {
              newArray.push(subObj.uid);
            } else {
              cleanUpEntryPayload(v[i]);
              newArray.push(v[i]);
            }
          }
          obj[k] = newArray;
        } else {
          cleanUpEntryPayload(v);
        }
        // cleanUpEntryPayload(v);
      }
    }
  } catch (e) {
    obj = { error: e };
  }
};

export default utils;

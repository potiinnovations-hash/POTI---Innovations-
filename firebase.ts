import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, (firebaseConfig as any).firestoreDatabaseId);
export const auth = getAuth();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

// Safe stringify helper for potential circular references and cross-iframe DOM/React objects
const safeStringify = (obj: any): string => {
  const seen = new WeakSet();

  const isComplexOrCircular = (val: any, k: string): boolean => {
    if (typeof val !== 'object' || val === null) {
      return false;
    }

    // 1. Cycle detection
    if (seen.has(val)) {
      return true;
    }

    // 2. React / Fiber nodes
    if (String(k).startsWith('__react') || val.$$typeof) {
      return true;
    }

    try {
      const constructorName = val.constructor?.name;
      const strTag = Object.prototype.toString.call(val);

      if (
        constructorName === 'FiberNode' ||
        constructorName?.includes('Fiber') ||
        constructorName === 'SyntheticBaseEvent' ||
        constructorName?.includes('Element') ||
        constructorName?.includes('HTML') ||
        constructorName?.includes('Window') ||
        constructorName?.includes('Document') ||
        constructorName?.includes('Event') ||
        strTag.includes('Element') ||
        strTag.includes('HTML') ||
        strTag.includes('Window') ||
        strTag.includes('Document') ||
        strTag.includes('Event') ||
        val.nodeType ||
        val.nodeName
      ) {
        return true;
      }

      if (typeof window !== 'undefined') {
        if (val === window || val instanceof Node || val instanceof window.HTMLElement) {
          return true;
        }
      }
    } catch (e) {
      // Security bounds / property access failures represent restricted/complex nodes
      return true;
    }

    return false;
  };

  try {
    return JSON.stringify(obj, (key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (isComplexOrCircular(value, key)) {
          const typeLabel = value.constructor?.name || typeof value;
          return `[${typeLabel}]`;
        }
        seen.add(value);
      }
      return value;
    });
  } catch (err) {
    console.error('Core stringify failed, falling back to simple extraction');
    try {
      const fallbackObj: any = {};
      if (obj && typeof obj === 'object') {
        if ('error' in obj) {
          fallbackObj.error = String(obj.error);
        } else {
          fallbackObj.error = 'Unknown error structure';
        }
        if ('operationType' in obj) {
          fallbackObj.operation = String(obj.operationType);
        }
        if ('path' in obj) {
          fallbackObj.path = String(obj.path);
        }
      } else {
        fallbackObj.error = String(obj);
      }
      fallbackObj.serializationError = err instanceof Error ? err.message : 'Unknown';
      return JSON.stringify(fallbackObj);
    } catch (finalErr) {
      return '{"error":"Failed to serialize error diagnostics"}';
    }
  }
};

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };

  const jsonInfo = safeStringify(errInfo);
  console.error('Firestore Error: ', jsonInfo);
  throw new Error(jsonInfo);
}

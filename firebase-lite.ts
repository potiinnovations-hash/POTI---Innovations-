import { initializeApp, getApp, getApps } from 'firebase/app';
import { initializeFirestore } from 'firebase/firestore/lite';
import firebaseConfig from './firebase-applet-config.json';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = initializeFirestore(app, {}, (firebaseConfig as any).firestoreDatabaseId);

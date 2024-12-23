// firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyA0wha7eRN7VwUtJWkG2cpwhNlwiO48qfA',
  authDomain: 'chores-ad8e8.firebaseapp.com',
  databaseURL: 'https://chores-ad8e8-default-rtdb.firebaseio.com',
  projectId: 'chores-ad8e8',
  storageBucket: 'chores-ad8e8.firebasestorage.app',
  messagingSenderId: '1028375070162',
  appId: '1:1028375070162:web:3533ddd3dd5f779a48b40b',
  measurementId: 'G-FX5ZZXQY65',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

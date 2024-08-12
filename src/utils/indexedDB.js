// src/utils/indexedDB.js
const dbName = 'fileStorage';
const storeName = 'files';

const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 1);

    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      db.createObjectStore(storeName, { keyPath: 'name' });
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const saveFileToIndexedDB = async (file) => {
  const db = await openDB();
  const transaction = db.transaction(storeName, 'readwrite');
  const store = transaction.objectStore(storeName);
  store.put(file);
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
};

export const getFileFromIndexedDB = async (name) => {
  const db = await openDB();
  const transaction = db.transaction(storeName);
  const store = transaction.objectStore(storeName);
  return new Promise((resolve, reject) => {
    const request = store.get(name);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

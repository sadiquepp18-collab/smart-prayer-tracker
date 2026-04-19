import { useEffect, useState } from 'react';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

/**
 * Hook to fetch a single document from Firestore
 * @param {string} collectionName - The collection name
 * @param {string} documentId - The document ID
 */
export const useDocument = (collectionName, documentId) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!collectionName || !documentId) {
      setLoading(false);
      return;
    }

    const docRef = doc(db, collectionName, documentId);
    
    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setData({ id: snapshot.id, ...snapshot.data() });
        } else {
          setData(null);
        }
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching document:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [collectionName, documentId]);

  return { data, loading, error };
};

/**
 * Hook to fetch a collection from Firestore with real-time updates
 * @param {string} collectionName - The collection name
 * @param {Array} queryConstraints - Optional query constraints
 */
export const useCollection = (collectionName, queryConstraints = []) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!collectionName) {
      setLoading(false);
      return;
    }

    const collectionRef = collection(db, collectionName);
    const q = queryConstraints.length > 0 
      ? query(collectionRef, ...queryConstraints)
      : collectionRef;
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const documents = [];
        snapshot.forEach((doc) => {
          documents.push({ id: doc.id, ...doc.data() });
        });
        setData(documents);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching collection:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionName, JSON.stringify(queryConstraints)]);

  return { data, loading, error };
};

/**
 * Firestore utility functions
 */
export const firestoreUtils = {
  // Create or update a document
  async setDocument(collectionName, documentId, data, merge = true) {
    try {
      const docRef = doc(db, collectionName, documentId);
      await setDoc(docRef, data, { merge });
      return { success: true };
    } catch (error) {
      console.error('Error setting document:', error);
      return { success: false, error: error.message };
    }
  },

  // Update a document
  async updateDocument(collectionName, documentId, data) {
    try {
      const docRef = doc(db, collectionName, documentId);
      await updateDoc(docRef, data);
      return { success: true };
    } catch (error) {
      console.error('Error updating document:', error);
      return { success: false, error: error.message };
    }
  },

  // Delete a document
  async deleteDocument(collectionName, documentId) {
    try {
      const docRef = doc(db, collectionName, documentId);
      await deleteDoc(docRef);
      return { success: true };
    } catch (error) {
      console.error('Error deleting document:', error);
      return { success: false, error: error.message };
    }
  },

  // Get a single document (one-time read)
  async getDocument(collectionName, documentId) {
    try {
      const docRef = doc(db, collectionName, documentId);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        return { success: true, data: { id: snapshot.id, ...snapshot.data() } };
      }
      return { success: false, error: 'Document not found' };
    } catch (error) {
      console.error('Error getting document:', error);
      return { success: false, error: error.message };
    }
  },

  // Get a collection (one-time read)
  async getCollection(collectionName, queryConstraints = []) {
    try {
      const collectionRef = collection(db, collectionName);
      const q = queryConstraints.length > 0 
        ? query(collectionRef, ...queryConstraints)
        : collectionRef;
      
      const snapshot = await getDocs(q);
      const documents = [];
      snapshot.forEach((doc) => {
        documents.push({ id: doc.id, ...doc.data() });
      });
      return { success: true, data: documents };
    } catch (error) {
      console.error('Error getting collection:', error);
      return { success: false, error: error.message };
    }
  }
};

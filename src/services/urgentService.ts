import { collection, addDoc, query, where, orderBy, getDocs, onSnapshot, Timestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { UrgentRequest } from '../types';

export const urgentService = {
  async createRequest(title: string, description: string, userId: string, userName: string, collegeId: string, expiryHours: number = 6) {
    const path = 'urgentRequests';
    try {
      const createdAt = Date.now();
      const expiresAt = createdAt + (expiryHours * 60 * 60 * 1000);
      
      const docRef = await addDoc(collection(db, path), {
        userId,
        userName,
        collegeId,
        title,
        description,
        createdAt,
        expiresAt
      });
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  listenToActive(collegeId: string, callback: (requests: UrgentRequest[]) => void) {
    const path = 'urgentRequests';
    const now = Date.now();
    const q = query(
      collection(db, path),
      where('collegeId', '==', collegeId),
      where('expiresAt', '>', now),
      orderBy('expiresAt', 'asc')
    );

    return onSnapshot(q, (snapshot) => {
      const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UrgentRequest));
      callback(requests);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
  }
};

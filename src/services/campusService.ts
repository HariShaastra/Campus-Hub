import { collection, addDoc, updateDoc, doc, query, where, orderBy, limit, getDocs, deleteDoc, onSnapshot, getDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Opportunity, CampusEvent, Notification, Bookmark, User } from '../types';

export const campusService = {
  // User profiles
  async getUserProfile(userId: string) {
    const path = 'users';
    try {
      const userRef = doc(db, path, userId);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        return { uid: userDoc.id, ...userDoc.data() } as User;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
    }
  },

  // Opportunities
  async createOpportunity(data: Omit<Opportunity, 'id' | 'createdAt'>) {
    const path = 'opportunities';
    try {
      const docRef = await addDoc(collection(db, path), {
        ...data,
        createdAt: Date.now(),
      });
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  async getOpportunities(collegeId: string, type?: Opportunity['type']) {
    const path = 'opportunities';
    try {
      let q = query(
        collection(db, path),
        where('collegeId', '==', collegeId),
        orderBy('createdAt', 'desc')
      );
      if (type) {
        q = query(q, where('type', '==', type));
      }
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Opportunity));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  },

  // Events
  async createEvent(data: Omit<CampusEvent, 'id' | 'createdAt'>) {
    const path = 'events';
    try {
      const docRef = await addDoc(collection(db, path), {
        ...data,
        createdAt: Date.now(),
      });
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  async getEvents(collegeId: string) {
    const path = 'events';
    try {
      const q = query(
        collection(db, path),
        where('collegeId', '==', collegeId),
        where('date', '>=', Date.now()),
        orderBy('date', 'asc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CampusEvent));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  },

  // Bookmarks
  async toggleBookmark(userId: string, targetId: string, targetType: Bookmark['targetType']) {
    const path = `users/${userId}/bookmarks`;
    try {
      const q = query(collection(db, path), where('targetId', '==', targetId));
      const existing = await getDocs(q);
      
      if (!existing.empty) {
        await deleteDoc(doc(db, path, existing.docs[0].id));
        return false;
      } else {
        await addDoc(collection(db, path), {
          userId,
          targetId,
          targetType,
          createdAt: Date.now()
        });
        return true;
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async getBookmarks(userId: string) {
    const path = `users/${userId}/bookmarks`;
    try {
      const querySnapshot = await getDocs(collection(db, path));
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Bookmark));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  },

  // Notifications
  listenToNotifications(userId: string, callback: (msgs: Notification[]) => void) {
    const path = 'notifications';
    const q = query(
      collection(db, path),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(20)
    );
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
  },

  async markAsRead(notificationId: string) {
    const path = 'notifications';
    try {
      await updateDoc(doc(db, path, notificationId), { read: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async sendNotification(data: Omit<Notification, 'id' | 'createdAt' | 'read'>) {
    const path = 'notifications';
    try {
      await addDoc(collection(db, path), {
        ...data,
        read: false,
        createdAt: Date.now()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  }
};

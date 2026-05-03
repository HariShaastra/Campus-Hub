import { collection, addDoc, updateDoc, doc, query, where, orderBy, limit, getDocs, onSnapshot, Timestamp, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Listing, Category, ListingType } from '../types';

export const listingService = {
  async createListing(listingData: Omit<Listing, 'id' | 'createdAt' | 'updatedAt'>) {
    const path = 'listings';
    try {
      const docRef = await addDoc(collection(db, path), {
        ...listingData,
        status: 'active',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  async getRecentListings(collegeId: string, limitCount: number = 10) {
    const path = 'listings';
    try {
      const q = query(
        collection(db, path),
        where('collegeId', '==', collegeId),
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Listing));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  },

  async filterListings(collegeId: string, category?: Category, type?: ListingType, status: string = 'active') {
    const path = 'listings';
    try {
      let q = query(
        collection(db, path), 
        where('collegeId', '==', collegeId),
        where('status', '==', status), 
        orderBy('createdAt', 'desc')
      );
      
      if (category && category !== 'All Items' as any) {
        q = query(q, where('category', '==', category));
      }
      if (type) {
        q = query(q, where('type', '==', type));
      }
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Listing));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  },

  async getMyListings(userId: string) {
    const path = 'listings';
    try {
      const q = query(
        collection(db, path),
        where('sellerId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Listing));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  },

  async markAsSold(listingId: string) {
    const path = 'listings';
    try {
      await updateDoc(doc(db, path, listingId), { 
        status: 'sold', 
        paymentStatus: 'completed',
        updatedAt: Date.now() 
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async updatePaymentStatus(listingId: string, status: 'pending' | 'completed' | 'escrow') {
    const path = 'listings';
    try {
      await updateDoc(doc(db, path, listingId), { paymentStatus: status, updatedAt: Date.now() });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async deleteListing(listingId: string) {
    const path = 'listings';
    try {
      await updateDoc(doc(db, path, listingId), { status: 'deleted', updatedAt: Date.now() });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  }
};

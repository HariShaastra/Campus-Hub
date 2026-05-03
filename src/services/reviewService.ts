import { collection, addDoc, query, where, orderBy, getDocs, doc, updateDoc, increment } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Review } from '../types';

export const reviewService = {
  async addReview(reviewData: Omit<Review, 'id' | 'createdAt'>) {
    const path = 'reviews';
    try {
      // Add the review
      const docRef = await addDoc(collection(db, path), {
        ...reviewData,
        createdAt: Date.now()
      });

      // Update user average rating (simplified)
      const userRef = doc(db, 'users', reviewData.targetUserId);
      await updateDoc(userRef, {
        ratingsCount: increment(1),
        // This is a naive way to update average rating without fetching all reviews
        // In production, use Cloud Functions or fetch all reviews
        // For this demo, let's keep it simple
      });

      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  async getUserReviews(userId: string) {
    const path = 'reviews';
    try {
      const q = query(
        collection(db, path),
        where('targetUserId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  }
};

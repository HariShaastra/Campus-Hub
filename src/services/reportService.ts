import { collection, addDoc, query, where, orderBy, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Report } from '../types';

export const reportService = {
  async submitReport(reportData: Omit<Report, 'id' | 'createdAt' | 'status'>) {
    const path = 'reports';
    try {
      const docRef = await addDoc(collection(db, path), {
        ...reportData,
        status: 'pending',
        createdAt: Date.now(),
      });
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  async getPendingReports(collegeId: string) {
    const path = 'reports';
    try {
      const q = query(
        collection(db, path),
        where('collegeId', '==', collegeId),
        where('status', '==', 'pending'),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Report));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  },

  async updateReportStatus(reportId: string, status: 'reviewed' | 'dismissed') {
    const path = 'reports';
    try {
      await updateDoc(doc(db, path, reportId), { status });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  }
};

import { collection, addDoc, query, where, orderBy, getDocs, limit } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { AcademicMaterial, AcademicCategory } from '../types';

export const academicService = {
  async uploadMaterial(materialData: Omit<AcademicMaterial, 'id' | 'createdAt'>) {
    const path = 'academicMaterials';
    try {
      const docRef = await addDoc(collection(db, path), {
        ...materialData,
        createdAt: Date.now(),
      });
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  async getMaterials(collegeId: string, category?: AcademicCategory) {
    const path = 'academicMaterials';
    try {
      let q = query(
        collection(db, path),
        where('collegeId', '==', collegeId),
        orderBy('createdAt', 'desc')
      );

      if (category) {
        q = query(q, where('category', '==', category));
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AcademicMaterial));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  }
};

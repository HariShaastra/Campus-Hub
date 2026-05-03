import { collection, addDoc, query, where, orderBy, getDocs, onSnapshot, Timestamp, doc, getDoc, setDoc, updateDoc, arrayUnion, limit } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { ChatThread, ChatMessage, User } from '../types';

export const chatService = {
  async searchUsersByCollege(collegeId: string) {
    const path = 'users';
    try {
      const q = query(
        collection(db, path),
        where('collegeId', '==', collegeId),
        limit(50)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as User));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  },

  async getOrCreateThread(uid1: string, uid2: string, listingId?: string, participantNames: Record<string, string> = {}) {
    const threadId = [uid1, uid2].sort().join('_') + (listingId ? `_${listingId}` : '');
    const path = 'chats';
    
    try {
      const threadRef = doc(db, path, threadId);
      const threadDoc = await getDoc(threadRef);
      
      if (!threadDoc.exists()) {
        const newThread: Omit<ChatThread, 'id'> = {
          participants: [uid1, uid2],
          participantNames,
          lastMessage: '',
          lastMessageAt: Date.now(),
          listingId
        };
        await setDoc(threadRef, newThread);
        return { id: threadId, ...newThread } as ChatThread;
      }
      
      return { id: threadId, ...threadDoc.data() } as ChatThread;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
    }
  },

  async sendMessage(threadId: string, senderId: string, text: string) {
    const messagesPath = `chats/${threadId}/messages`;
    const threadPath = 'chats';
    
    try {
      const now = Date.now();
      await addDoc(collection(db, messagesPath), {
        threadId,
        senderId,
        text,
        createdAt: now
      });
      
      await updateDoc(doc(db, threadPath, threadId), {
        lastMessage: text,
        lastMessageAt: now
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, messagesPath);
    }
  },

  listenToMessages(threadId: string, callback: (messages: ChatMessage[]) => void) {
    const path = `chats/${threadId}/messages`;
    const q = query(
      collection(db, path),
      orderBy('createdAt', 'asc')
    );

    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatMessage)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
  },

  listenToUserThreads(uid: string, callback: (threads: ChatThread[]) => void) {
    const path = 'chats';
    const q = query(
      collection(db, path),
      where('participants', 'array-contains', uid),
      orderBy('lastMessageAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatThread)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
  }
};

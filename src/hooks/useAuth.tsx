import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User as FirebaseUser, signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../lib/firebase';
import { User as AppUser } from '../types';

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  signIn: () => Promise<void>;
  logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Enforce college email domain if needed
        // if (!firebaseUser.email?.endsWith('@college.edu')) {
        //   await signOut(auth);
        //   setUser(null);
        //   setLoading(false);
        //   return;
        // }

        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        
        // Extract college info from email
        const email = firebaseUser.email || '';
        const domain = email.split('@')[1] || 'generic';
        const collegeId = domain.split('.')[0] || 'campus';
        const collegeName = collegeId.charAt(0).toUpperCase() + collegeId.slice(1) + ' University';

        if (userDoc.exists()) {
          const data = userDoc.data() as AppUser;
          setUser(data);
        } else {
          // Create new user profile, but if domain is generic, mark as needing setup
          const isGeneric = ['gmail', 'outlook', 'yahoo', 'hotmail', 'icloud'].some(d => domain.includes(d));
          
          const newUser: AppUser = {
            uid: firebaseUser.uid,
            email: email,
            name: firebaseUser.displayName || 'Anonymous Student',
            college: isGeneric ? 'Not Connected' : collegeName,
            collegeId: isGeneric ? 'setup_required' : collegeId,
            role: 'student',
            rating: 5,
            ratingsCount: 0,
            transactionsCount: 0,
            isVerified: true,
            isAdmin: email === 'hari310804@gmail.com',
            createdAt: Date.now(),
          };
          await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
          setUser(newUser);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') {
        console.log("Sign-in popup was closed by user");
        return;
      }
      console.error("Sign in error:", error);
    }
  };

  const logOut = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, logOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

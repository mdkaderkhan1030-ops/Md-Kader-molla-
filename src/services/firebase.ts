import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, updateDoc, onSnapshot, serverTimestamp, collection, query, where, orderBy, addDoc } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Project } from '../types';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const googleProvider = new GoogleAuthProvider();

export interface UserProfile {
  uid: string;
  email: string;
  credits: number;
  tier: 'free' | 'pro' | 'ultra';
  subscriptionStatus: 'active' | 'none' | 'past_due';
}

export const signIn = async () => {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;
  
  // Check if profile exists
  const userDoc = await getDoc(doc(db, 'users', user.uid));
  if (!userDoc.exists()) {
    const newProfile: UserProfile = {
      uid: user.uid,
      email: user.email || '',
      credits: 999999, // Unlimited credits for everyone
      tier: 'ultra', // Everyone is Ultra
      subscriptionStatus: 'active'
    };
    await setDoc(doc(db, 'users', user.uid), {
      ...newProfile,
      createdAt: serverTimestamp()
    });
  }
  return user;
};

export const deductCredit = async (userId: string, amount: number = 1) => {
  // Credits are now free for everyone
  return true;
};

export const saveProject = async (userId: string, project: Omit<Project, 'id' | 'createdAt'>) => {
  const projectsRef = collection(db, 'projects');
  await addDoc(projectsRef, {
    ...project,
    userId,
    createdAt: serverTimestamp()
  });
};

export const subscribeToProjects = (userId: string, callback: (projects: Project[]) => void) => {
  const projectsRef = collection(db, 'projects');
  const q = query(
    projectsRef, 
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const projects = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate()?.toISOString() || new Date().toISOString()
    })) as Project[];
    callback(projects);
  });
};

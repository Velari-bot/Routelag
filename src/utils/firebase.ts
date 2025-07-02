import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, User, sendEmailVerification, ActionCodeSettings, Auth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDoc, updateDoc, addDoc, getDocs, query, where, Timestamp, deleteDoc, Firestore } from 'firebase/firestore';
import { getAnalytics, setAnalyticsCollectionEnabled, isSupported } from 'firebase/analytics';
import { getInstallations } from 'firebase/installations';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDnSPr126JAM42uDkQNXBUlUIe1mmT864E",
  authDomain: "routelag-lunary.firebaseapp.com",
  projectId: "routelag-lunary",
  storageBucket: "routelag-lunary.appspot.com",
  messagingSenderId: "1012444883774",
  appId: "1:1012444883774:web:c0c0c0c0c0c0c0c0c0c0c0"
};

// Singleton Firebase App Initialization
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);

// Set auth persistence for Electron
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log('Auth persistence set to browserLocalPersistence');
  })
  .catch((error) => {
    console.error('Error setting auth persistence:', error);
  });

// Initialize Analytics with better error handling
let analytics = null;
const initializeAnalytics = async () => {
  try {
    const isAnalyticsSupported = await isSupported();
    if (isAnalyticsSupported) {
      analytics = getAnalytics(app);
      // Disable analytics in development
      await setAnalyticsCollectionEnabled(analytics, process.env.NODE_ENV === 'production');
      console.log('Firebase Analytics initialized successfully');
    } else {
      console.log('Firebase Analytics is not supported in this environment');
    }
  } catch (error) {
    console.error('Failed to initialize Firebase Analytics:', error);
  }
};

// Initialize Installations with error handling
let installations = null;
const initializeInstallations = async () => {
  try {
    installations = getInstallations(app);
    console.log('Firebase Installations initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Firebase Installations:', error);
  }
};

// Initialize optional Firebase services only in production
if (process.env.NODE_ENV === 'production') {
  initializeAnalytics();
  initializeInstallations();
} else {
  console.log('Skipping Analytics and Installations initialization in development mode');
}

// Configure action code settings
const actionCodeSettings: ActionCodeSettings = {
  url: 'https://routelag-lunary.firebaseapp.com',
  handleCodeInApp: true
};

// Type definitions
interface AuthResponse {
  success: boolean;
  user?: User;
  error?: string;
  message?: string;
}

interface AuthResult {
  success: boolean;
  error?: string;
}

// Authentication functions
const loginUser = async (email: string, password: string): Promise<AuthResult> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Check if email is verified
    if (!userCredential.user.emailVerified) {
      // Resend verification email if not verified
      await sendEmailVerification(userCredential.user, actionCodeSettings);
      return { 
        success: false, 
        error: 'Email not verified. We have sent a new verification email - please check your inbox and spam folder.' 
      };
    }
    
    return { success: true };
  } catch (error: any) {
    console.error('Login error:', error);
    alert('Login error: ' + (error.message || JSON.stringify(error)));
    let errorMessage = 'Login failed';
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      errorMessage = 'Invalid email or password';
    } else if (error.code === 'auth/too-many-requests') {
      errorMessage = 'Too many failed attempts. Please try again later';
    }
    return { success: false, error: errorMessage };
  }
};

const registerUser = async (email: string, password: string): Promise<AuthResult> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    // Send email verification with custom settings
    await sendEmailVerification(userCredential.user, actionCodeSettings);
    return { success: true };
  } catch (error: any) {
    let errorMessage = 'Registration failed';
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'This email is already registered';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'Password should be at least 6 characters';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email address';
    }
    console.error('Registration error:', error);
    return { success: false, error: errorMessage };
  }
};

const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// User settings functions
const getUserSettings = async (userId: string) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return userDoc.data().settings || { lowLatencyMode: false };
    }
    return { lowLatencyMode: false };
  } catch (error) {
    console.error('Error getting user settings:', error);
    return { lowLatencyMode: false };
  }
};

const updateUserSettings = async (userId: string, settings: any) => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      settings: settings
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Server list functions
const getServerList = async () => {
  return [
    { id: 'na-east', name: 'NA-East', location: 'New York', ping: 45 },
    { id: 'na-central', name: 'NA-Central', location: 'Chicago', ping: 35 },
    { id: 'na-west', name: 'NA-West', location: 'Los Angeles', ping: 65 },
    { id: 'eu-west', name: 'EU-West', location: 'London', ping: 120 },
    { id: 'eu-central', name: 'EU-Central', location: 'Frankfurt', ping: 110 },
  ];
};

// Store a new auth key in Firestore
const storeAuthKey = async (key: string, expiresAt: Date) => {
  await addDoc(collection(db, 'authKeys'), {
    key,
    expiresAt: Timestamp.fromDate(expiresAt),
    claimed: false,
    claimedBy: null,
  });
};

// Fetch all auth keys from Firestore
const fetchAuthKeys = async () => {
  const snapshot = await getDocs(collection(db, 'authKeys'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Claim an auth key (mark as used)
const claimAuthKey = async (key: string, claimedBy: string) => {
  const q = query(collection(db, 'authKeys'), where('key', '==', key));
  const snapshot = await getDocs(q);
  if (!snapshot.empty) {
    const docRef = snapshot.docs[0].ref;
    await updateDoc(docRef, { claimed: true, claimedBy });
  }
};

// Auth key login (real implementation)
const loginWithAuthKey = async (authKey: string, userId?: string): Promise<AuthResult> => {
  const q = query(collection(db, 'authKeys'), where('key', '==', authKey));
  const snapshot = await getDocs(q);
  if (snapshot.empty) {
    return { success: false, error: 'Invalid auth key' };
  }
  const keyDoc = snapshot.docs[0];
  const data = keyDoc.data();
  const now = new Date();
  if (data.claimed) {
    return { success: false, error: 'Auth key already claimed' };
  }
  if (data.expiresAt.toDate() < now) {
    return { success: false, error: 'Auth key expired' };
  }
  // Get the current Firebase user
  const currentUser = getAuth().currentUser;
  // Mark as claimed by UID if available, otherwise fallback to userId
  await updateDoc(keyDoc.ref, { claimed: true, claimedBy: currentUser ? currentUser.uid : (userId || null) });
  return { success: true };
};

// Generate a random auth key valid for 1 month
const generateAuthKey = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
  let key = '';
  for (let i = 0; i < 32; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const expiresAt = new Date();
  expiresAt.setMonth(expiresAt.getMonth() + 1);
  return { key, expiresAt };
};

// Delete an auth key by document ID
const deleteAuthKey = async (id: string) => {
  await deleteDoc(doc(db, 'authKeys', id));
};

// Fetch the claimed auth key for a user
const fetchClaimedAuthKeyForUser = async (userId: string) => {
  const q = query(collection(db, 'authKeys'), where('claimedBy', '==', userId));
  const snapshot = await getDocs(q);
  if (!snapshot.empty) {
    const docData = snapshot.docs[0].data();
    return {
      ...docData,
      id: snapshot.docs[0].id,
    };
  }
  return null;
};

// Export all the functions and initialized services
export {
  analytics,
  auth,
  db,
  loginUser,
  registerUser,
  logoutUser,
  getUserSettings,
  updateUserSettings,
  getServerList,
  loginWithAuthKey,
  generateAuthKey,
  storeAuthKey,
  fetchAuthKeys,
  claimAuthKey,
  deleteAuthKey,
  fetchClaimedAuthKeyForUser
};

export default app; 
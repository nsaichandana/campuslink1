import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import { ALLOWED_EMAIL_DOMAINS, ADMIN_EMAILS } from '../config';

/**
 * Check if email is from allowed college domain
 */
export function isCollegeEmail(email) {
  const domain = email.split('@')[1];
  return ALLOWED_EMAIL_DOMAINS.some(allowed => domain === allowed || domain.endsWith(allowed));
}

/**
 * Check if user is admin
 */
export function isAdmin(email) {
  return ADMIN_EMAILS.includes(email);
}

/**
 * Sign up new user with email and password
 */
export async function signUp(email, password) {
  if (!isCollegeEmail(email) && !isAdmin(email)) {
    throw new Error('Please use your college email address to sign up');
  }
  
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  
  // Send email verification
  await sendEmailVerification(userCredential.user);
  
  const userIsAdmin = isAdmin(email);
  
  // Create user document
  await setDoc(doc(db, 'users', userCredential.user.uid), {
    email: email,
    isAnonymous: false,
    isAdmin: userIsAdmin,
    role: userIsAdmin ? 'admin' : 'user',
    profileComplete: false,
    createdAt: serverTimestamp(),
    emailVerified: false
  });
  
  return userCredential.user;
}

/**
 * Sign in existing user
 */
export async function signIn(email, password) {
  if (!isCollegeEmail(email) && !isAdmin(email)) {
    throw new Error('Please use your college email address');
  }
  
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  
  // Check if user document exists, if not create it
  const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
  
  if (!userDoc.exists()) {
    const userIsAdmin = isAdmin(email);
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      email: email,
      isAnonymous: false,
      isAdmin: userIsAdmin,
      role: userIsAdmin ? 'admin' : 'user',
      profileComplete: false,
      createdAt: serverTimestamp(),
      emailVerified: userCredential.user.emailVerified
    });
  } else {
    // Update admin status if email is in admin list
    const userIsAdmin = isAdmin(email);
    if (userDoc.data().isAdmin !== userIsAdmin || userDoc.data().role !== (userIsAdmin ? 'admin' : 'user')) {
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        isAdmin: userIsAdmin,
        role: userIsAdmin ? 'admin' : 'user'
      }, { merge: true });
    }
  }
  
  return userCredential.user;
}

/**
 * Sign out current user
 */
export async function signOut() {
  await firebaseSignOut(auth);
}

/**
 * Reset password
 */
export async function resetPassword(email) {
  await sendPasswordResetEmail(auth, email);
}

/**
 * Get current user's profile
 */
export async function getUserProfile(userId) {
  const userDoc = await getDoc(doc(db, 'users', userId));
  if (!userDoc.exists()) return null;
  
  const profileDoc = await getDoc(doc(db, 'profiles', userId));
  
  return {
    ...userDoc.data(),
    profile: profileDoc.exists() ? profileDoc.data() : null
  };
}

/**
 * Subscribe to auth state changes
 */
export function subscribeToAuthState(callback) {
  return onAuthStateChanged(auth, callback);
}

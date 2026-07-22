import { initializeApp, getApps, deleteApp, type FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  type User 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  limit, 
  getDocs,
  serverTimestamp 
} from 'firebase/firestore';
import type { UserProfile } from '../types/pvp';
import type { StoneColor } from '../types/go';

// Check valid local key from localStorage first, fallback to target production config
const getFirebaseConfig = () => {
  const targetApiKey = 'AIzaSyBTILF88F3pxJB4AnsJICNw1i81BJpt37I';
  const targetProjectId = 'baduk-58092';
  const targetAuthDomain = 'baduk-58092.firebaseapp.com';

  let customApiKey = null;
  let customAuthDomain = null;
  let customProjectId = null;

  if (typeof localStorage !== 'undefined') {
    const cached = localStorage.getItem('baduk_fb_api_key');
    if (cached && cached.startsWith('AIzaSy') && cached.length > 30) {
      customApiKey = cached;
      customAuthDomain = localStorage.getItem('baduk_fb_auth_domain');
      customProjectId = localStorage.getItem('baduk_fb_project_id');
    }
  }

  const envConfig = {
    apiKey: customApiKey || import.meta.env.VITE_FIREBASE_API_KEY || targetApiKey,
    authDomain: customAuthDomain || import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || targetAuthDomain,
    projectId: customProjectId || import.meta.env.VITE_FIREBASE_PROJECT_ID || targetProjectId,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'baduk-58092.firebasestorage.app',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '1038381931338',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:1038381931338:web:ad910831bf0dd32eb5bfb3'
  };
  return envConfig;
};

class FirebaseBridgeService {
  private app: FirebaseApp | null = null;
  private authInstance: any = null;
  private dbInstance: any = null;

  constructor() {
    this.init();
  }

  public init() {
    const config = getFirebaseConfig();
    if (!config.apiKey || !config.projectId) {
      console.warn('[FirebaseBridge] Firebase API key or Project ID not configured yet.');
      return false;
    }
    try {
      if (!getApps().length) {
        this.app = initializeApp(config);
      } else {
        const existingApp = getApps()[0];
        if (existingApp.options.apiKey !== config.apiKey) {
          deleteApp(existingApp).catch(() => {});
          this.app = initializeApp(config);
        } else {
          this.app = existingApp;
        }
      }
      this.authInstance = getAuth(this.app);
      this.dbInstance = getFirestore(this.app);
      return true;
    } catch (e) {
      console.error('[FirebaseBridge] Initialization failed:', e);
      return false;
    }
  }

  public isConfigured(): boolean {
    const config = getFirebaseConfig();
    return Boolean(config.apiKey && config.projectId);
  }

  public saveCustomConfig(apiKey: string, authDomain: string, projectId: string) {
    localStorage.setItem('baduk_fb_api_key', apiKey.trim());
    localStorage.setItem('baduk_fb_auth_domain', authDomain.trim());
    localStorage.setItem('baduk_fb_project_id', projectId.trim());
    return this.init();
  }

  public clearCustomConfig() {
    localStorage.removeItem('baduk_fb_api_key');
    localStorage.removeItem('baduk_fb_auth_domain');
    localStorage.removeItem('baduk_fb_project_id');
    this.app = null;
    this.authInstance = null;
    this.dbInstance = null;
  }

  public getAuth() {
    if (!this.authInstance) this.init();
    return this.authInstance;
  }

  public getDb() {
    if (!this.dbInstance) this.init();
    return this.dbInstance;
  }

  // Auth Methods
  public async loginWithGoogle() {
    const auth = this.getAuth();
    if (!auth) throw new Error('Firebase가 아직 설정되지 않았습니다.');
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    await this.syncUserToDb(result.user);
    return result.user;
  }

  public async loginWithEmail(email: string, pass: string) {
    const auth = this.getAuth();
    if (!auth) throw new Error('Firebase가 아직 설정되지 않았습니다.');
    const result = await signInWithEmailAndPassword(auth, email, pass);
    await this.syncUserToDb(result.user);
    return result.user;
  }

  public async signupWithEmail(email: string, pass: string, nickname: string) {
    const auth = this.getAuth();
    if (!auth) throw new Error('Firebase가 아직 설정되지 않았습니다.');
    const result = await createUserWithEmailAndPassword(auth, email, pass);
    await this.syncUserToDb(result.user, nickname);
    return result.user;
  }

  public async logout() {
    const auth = this.getAuth();
    if (!auth) return;
    return await signOut(auth);
  }

  public getCurrentUser(): User | null {
    const auth = this.getAuth();
    return auth ? auth.currentUser : null;
  }

  public onUserChange(callback: (user: User | null) => void) {
    const auth = this.getAuth();
    if (!auth) return () => {};
    return onAuthStateChanged(auth, callback);
  }

  // Sync User Profile to Firestore
  public async syncUserToDb(user: User, customNickname?: string): Promise<UserProfile> {
    const db = this.getDb();
    if (!db) throw new Error('Firestore가 아직 설정되지 않았습니다.');
    
    const userEmail = (user.email || '').toLowerCase().trim();
    const isOwnerAdmin = userEmail === 'korbill73@gmail.com';

    const userRef = doc(db, 'users', user.uid);
    const snap = await getDoc(userRef);

    if (snap.exists()) {
      const data = snap.data();
      if (isOwnerAdmin && !data.isAdmin) {
        updateDoc(userRef, { isAdmin: true, role: 'admin' }).catch(() => {});
      }
      return {
        id: user.uid,
        nickname: data.nickname || user.displayName || user.email?.split('@')[0] || '바둑기사',
        rankTitle: data.rankTitle || '18급 (입문)',
        stats: data.stats || { vsAiWins: 0, vsAiLosses: 0, onlineWins: 0, onlineLosses: 0, pvpWins: 0, pvpLosses: 0 },
        createdAt: data.createdAt ? new Date(data.createdAt.toDate()).getTime() : Date.now(),
        isAdmin: isOwnerAdmin
      } as any;
    } else {
      const nickname = customNickname || user.displayName || user.email?.split('@')[0] || `기사#${Math.floor(1000 + Math.random() * 9000)}`;
      const initialData = {
        id: user.uid,
        email: user.email || '',
        nickname,
        rankTitle: '18급 (입문)',
        role: isOwnerAdmin ? 'admin' : 'user',
        isAdmin: isOwnerAdmin,
        stats: { vsAiWins: 0, vsAiLosses: 0, onlineWins: 0, onlineLosses: 0, pvpWins: 0, pvpLosses: 0 },
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp()
      };
      await setDoc(userRef, initialData);
      return {
        id: user.uid,
        nickname,
        rankTitle: '18급 (입문)',
        stats: initialData.stats,
        createdAt: Date.now(),
        isAdmin: isOwnerAdmin
      } as any;
    }
  }

  public async getUserProfileFromDb(userId: string): Promise<any | null> {
    const db = this.getDb();
    if (!db) return null;
    const snap = await getDoc(doc(db, 'users', userId));
    if (!snap.exists()) return null;
    const data = snap.data();
    const isOwnerAdmin = (data.email || '').toLowerCase().trim() === 'korbill73@gmail.com';
    return {
      ...data,
      id: userId,
      isAdmin: isOwnerAdmin
    };
  }

  // Record game and update user stats in Firestore
  public async recordGameInCloud(
    userId: string,
    mode: 'play' | 'pvp' | 'online',
    result: 'win' | 'loss' | 'draw',
    opponent: string,
    playerColor: StoneColor,
    scoreDiff?: number,
    aiRankName?: string
  ) {
    const db = this.getDb();
    if (!db) return;

    // 1. Add game log
    try {
      await addDoc(collection(db, 'games'), {
        userId,
        mode,
        result,
        opponent,
        playerColor,
        scoreDiff: scoreDiff || null,
        aiRankName: aiRankName || null,
        playedAt: serverTimestamp()
      });

      // 2. Update user stats
      const userRef = doc(db, 'users', userId);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const data = snap.data();
        const stats = { ...(data.stats || { vsAiWins: 0, vsAiLosses: 0, onlineWins: 0, onlineLosses: 0, pvpWins: 0, pvpLosses: 0 }) };
        if (result === 'win') {
          if (mode === 'play') stats.vsAiWins++;
          else if (mode === 'online') stats.onlineWins++;
          else stats.pvpWins++;
        } else if (result === 'loss') {
          if (mode === 'play') stats.vsAiLosses++;
          else if (mode === 'online') stats.onlineLosses++;
          else stats.pvpLosses++;
        }
        await updateDoc(userRef, { stats, lastPlayedAt: serverTimestamp() });
      }
    } catch (e) {
      console.error('[FirebaseBridge] Failed to record game in cloud:', e);
    }
  }

  // Admin: Get all users & summary stats
  public async getAdminAllUsers(): Promise<any[]> {
    const db = this.getDb();
    if (!db) return [];
    try {
      const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(100));
      const snaps = await getDocs(q);
      return snaps.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
      console.error('[FirebaseBridge] Admin get users failed:', e);
      return [];
    }
  }

  public async getAdminRecentGames(): Promise<any[]> {
    const db = this.getDb();
    if (!db) return [];
    try {
      const q = query(collection(db, 'games'), orderBy('playedAt', 'desc'), limit(50));
      const snaps = await getDocs(q);
      return snaps.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
      console.error('[FirebaseBridge] Admin get games failed:', e);
      return [];
    }
  }
}

export const firebaseBridge = new FirebaseBridgeService();

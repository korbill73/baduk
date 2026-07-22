import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
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

// Try to load from environment or fallback to localStorage config if entered via setup UI
const getFirebaseConfig = () => {
  const envConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || localStorage.getItem('baduk_fb_api_key') || '',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || localStorage.getItem('baduk_fb_auth_domain') || '',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || localStorage.getItem('baduk_fb_project_id') || '',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || ''
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
        this.app = getApps()[0];
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

  public onUserChange(callback: (user: User | null) => void) {
    const auth = this.getAuth();
    if (!auth) return () => {};
    return onAuthStateChanged(auth, callback);
  }

  // Sync User Profile to Firestore
  public async syncUserToDb(user: User, customNickname?: string): Promise<UserProfile> {
    const db = this.getDb();
    if (!db) throw new Error('Firestore가 아직 설정되지 않았습니다.');
    
    const userRef = doc(db, 'users', user.uid);
    const snap = await getDoc(userRef);

    if (snap.exists()) {
      const data = snap.data();
      return {
        id: user.uid,
        nickname: data.nickname || user.displayName || user.email?.split('@')[0] || '바둑기사',
        rankTitle: data.rankTitle || '18급 (입문)',
        stats: data.stats || { vsAiWins: 0, vsAiLosses: 0, onlineWins: 0, onlineLosses: 0, pvpWins: 0, pvpLosses: 0 },
        createdAt: data.createdAt ? new Date(data.createdAt.toDate()).getTime() : Date.now(),
        isAdmin: Boolean(data.isAdmin || data.role === 'admin')
      } as any;
    } else {
      const nickname = customNickname || user.displayName || user.email?.split('@')[0] || `기사#${Math.floor(1000 + Math.random() * 9000)}`;
      const initialData = {
        id: user.uid,
        email: user.email || '',
        nickname,
        rankTitle: '18급 (입문)',
        role: 'user',
        isAdmin: false,
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
        isAdmin: false
      } as any;
    }
  }

  public async getUserProfileFromDb(userId: string): Promise<any | null> {
    const db = this.getDb();
    if (!db) return null;
    const snap = await getDoc(doc(db, 'users', userId));
    if (!snap.exists()) return null;
    const data = snap.data();
    return {
      ...data,
      id: userId,
      isAdmin: Boolean(data.isAdmin || data.role === 'admin')
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

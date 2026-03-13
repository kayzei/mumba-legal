import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  orderBy,
  Timestamp,
  getDocFromServer,
  serverTimestamp
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { UserProfile, Matter, Booking, LegalDocument, Message, Invoice, KnowledgeBaseArticle } from '../types';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const firmService = {
  // Test connection
  async testConnection() {
    try {
      await getDocFromServer(doc(db, 'test', 'connection'));
    } catch (error) {
      if(error instanceof Error && error.message.includes('the client is offline')) {
        console.error("Please check your Firebase configuration.");
      }
    }
  },

  // User Profile
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? (docSnap.data() as UserProfile) : null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `users/${uid}`);
      return null;
    }
  },

  async createUserProfile(profile: UserProfile): Promise<void> {
    try {
      await setDoc(doc(db, 'users', profile.uid), profile);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `users/${profile.uid}`);
    }
  },

  // Matters
  subscribeToMatters(clientId: string, callback: (matters: Matter[]) => void) {
    const q = query(collection(db, 'matters'), where('clientId', '==', clientId), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const matters = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Matter));
      callback(matters);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'matters'));
  },

  async getMatter(matterId: string): Promise<Matter | null> {
    try {
      const docRef = doc(db, 'matters', matterId);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? ({ id: docSnap.id, ...docSnap.data() } as Matter) : null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `matters/${matterId}`);
      return null;
    }
  },

  // Documents
  subscribeToDocuments(matterId: string, callback: (docs: LegalDocument[]) => void) {
    const q = query(collection(db, 'matters', matterId, 'documents'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LegalDocument));
      callback(docs);
    }, (error) => handleFirestoreError(error, OperationType.LIST, `matters/${matterId}/documents`));
  },

  async uploadDocument(matterId: string, docData: Omit<LegalDocument, 'id'>): Promise<void> {
    try {
      await addDoc(collection(db, 'matters', matterId, 'documents'), docData);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `matters/${matterId}/documents`);
    }
  },

  // Messages
  subscribeToMessages(matterId: string, callback: (msgs: Message[]) => void) {
    const q = query(collection(db, 'matters', matterId, 'messages'), orderBy('createdAt', 'asc'));
    return onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
      callback(msgs);
    }, (error) => handleFirestoreError(error, OperationType.LIST, `matters/${matterId}/messages`));
  },

  async sendMessage(matterId: string, msgData: Omit<Message, 'id'>): Promise<void> {
    try {
      await addDoc(collection(db, 'matters', matterId, 'messages'), msgData);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `matters/${matterId}/messages`);
    }
  },

  // Bookings
  async createBooking(booking: Omit<Booking, 'id'>): Promise<void> {
    try {
      await addDoc(collection(db, 'bookings'), booking);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'bookings');
    }
  },

  subscribeToBookings(clientId: string, callback: (bookings: Booking[]) => void) {
    const q = query(collection(db, 'bookings'), where('clientId', '==', clientId), orderBy('date', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const bookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
      callback(bookings);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'bookings'));
  },

  // Invoices
  subscribeToInvoices(clientId: string, callback: (invoices: Invoice[]) => void) {
    const q = query(collection(db, 'invoices'), where('clientId', '==', clientId), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const invoices = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Invoice));
      callback(invoices);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'invoices'));
  },

  subscribeToKnowledgeBase(callback: (articles: any[]) => void) {
    const q = query(collection(db, 'knowledge_base'), orderBy('category', 'asc'));
    return onSnapshot(q, (snapshot) => {
      const articles = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(articles);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'knowledge_base'));
  },

  async addKnowledgeBaseArticle(article: Omit<KnowledgeBaseArticle, 'id'>) {
    try {
      await addDoc(collection(db, 'knowledge_base'), {
        ...article,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'knowledge_base');
    }
  }
};

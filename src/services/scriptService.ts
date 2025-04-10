import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { ref, set, get, remove, push, child, update } from 'firebase/database';
import { db, realtimeDb } from '@/utils/firebase';

// Determine which database to use - set to 'firestore' or 'realtime'
const DB_TYPE: 'firestore' | 'realtime' = 'firestore';

export type Scene = {
  id: string;
  title: string;
  content: string;
  characters: string[];
  isBridgeScene?: boolean;
  createdAt?: Timestamp | string | null;
  updatedAt?: Timestamp | string | null;
};

export type Script = {
  id?: string;
  title: string;
  description?: string;
  userId: string;
  scenes: Scene[];
  createdAt?: Timestamp | string | null;
  updatedAt?: Timestamp | string | null;
};

const COLLECTION_NAME = 'scripts';

// Get all scripts for a user
export const getUserScripts = async (userId: string): Promise<Script[]> => {
  try {
    if (DB_TYPE === 'firestore') {
      // Firestore implementation
      const scriptsRef = collection(db, COLLECTION_NAME);
      const q = query(
        scriptsRef, 
        where('userId', '==', userId),
        orderBy('updatedAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return { ...data, id: doc.id } as Script;
      });
    } else {
      // Realtime Database implementation
      const scriptsRef = ref(realtimeDb, `${COLLECTION_NAME}/${userId}`);
      const snapshot = await get(scriptsRef);
      
      if (!snapshot.exists()) {
        return [];
      }
      
      const scripts: Script[] = [];
      snapshot.forEach((childSnapshot) => {
        const script = childSnapshot.val();
        scripts.push({
          ...script,
          id: childSnapshot.key
        });
      });
      
      return scripts;
    }
  } catch (error) {
    console.error('Error fetching scripts:', error);
    throw new Error('Failed to fetch scripts');
  }
};

// Get a script by ID
export const getScriptById = async (scriptId: string, userId: string): Promise<Script | null> => {
  try {
    if (DB_TYPE === 'firestore') {
      // Firestore implementation
      const docRef = doc(db, COLLECTION_NAME, scriptId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return null;
      }
      
      const data = docSnap.data();
      
      // Ensure the script belongs to the user
      if (data.userId !== userId) {
        return null;
      }
      
      return { ...data, id: docSnap.id } as Script;
    } else {
      // Realtime Database implementation
      const scriptRef = ref(realtimeDb, `${COLLECTION_NAME}/${userId}/${scriptId}`);
      const snapshot = await get(scriptRef);
      
      if (!snapshot.exists()) {
        return null;
      }
      
      return { ...snapshot.val(), id: scriptId } as Script;
    }
  } catch (error) {
    console.error('Error fetching script:', error);
    throw new Error('Failed to fetch script');
  }
};

// Create a new script
export const createScript = async (script: Omit<Script, 'id'>): Promise<Script> => {
  try {
    const now = new Date().toISOString();
    const scriptWithTimestamps = {
      ...script,
      createdAt: DB_TYPE === 'firestore' ? serverTimestamp() : now,
      updatedAt: DB_TYPE === 'firestore' ? serverTimestamp() : now,
    };
    
    if (DB_TYPE === 'firestore') {
      // Firestore implementation
      const docRef = await addDoc(collection(db, COLLECTION_NAME), scriptWithTimestamps);
      return { ...script, id: docRef.id };
    } else {
      // Realtime Database implementation
      const scriptsRef = ref(realtimeDb, `${COLLECTION_NAME}/${script.userId}`);
      const newScriptRef = push(scriptsRef);
      await set(newScriptRef, scriptWithTimestamps);
      return { ...script, id: newScriptRef.key };
    }
  } catch (error) {
    console.error('Error creating script:', error);
    throw new Error('Failed to create script');
  }
};

// Update a script
export const updateScript = async (scriptId: string, script: Partial<Script>, userId: string): Promise<Script> => {
  try {
    // First check if the script belongs to the user
    const existingScript = await getScriptById(scriptId, userId);
    
    if (!existingScript) {
      throw new Error('Script not found or access denied');
    }
    
    const now = new Date().toISOString();
    const updates = {
      ...script,
      updatedAt: DB_TYPE === 'firestore' ? serverTimestamp() : now,
    };
    
    if (DB_TYPE === 'firestore') {
      // Firestore implementation
      const docRef = doc(db, COLLECTION_NAME, scriptId);
      await updateDoc(docRef, updates);
    } else {
      // Realtime Database implementation
      const scriptRef = ref(realtimeDb, `${COLLECTION_NAME}/${userId}/${scriptId}`);
      await update(scriptRef, updates);
    }
    
    return { ...existingScript, ...script, id: scriptId };
  } catch (error) {
    console.error('Error updating script:', error);
    throw new Error('Failed to update script');
  }
};

// Delete a script
export const deleteScript = async (scriptId: string, userId: string): Promise<void> => {
  try {
    // First check if the script belongs to the user
    const existingScript = await getScriptById(scriptId, userId);
    
    if (!existingScript) {
      throw new Error('Script not found or access denied');
    }
    
    if (DB_TYPE === 'firestore') {
      // Firestore implementation
      const docRef = doc(db, COLLECTION_NAME, scriptId);
      await deleteDoc(docRef);
    } else {
      // Realtime Database implementation
      const scriptRef = ref(realtimeDb, `${COLLECTION_NAME}/${userId}/${scriptId}`);
      await remove(scriptRef);
    }
  } catch (error) {
    console.error('Error deleting script:', error);
    throw new Error('Failed to delete script');
  }
}; 
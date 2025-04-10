import { Timestamp } from 'firebase/firestore';

export interface Scene {
  id: string;
  title: string;
  content: string | null | undefined;
  characters: string[];
  isBridgeScene?: boolean;
  createdAt?: Timestamp | string | null;
  updatedAt?: Timestamp | string | null;
}

export interface Script {
  id?: string;
  title: string;
  description?: string;
  userId: string;
  scenes: Scene[];
  createdAt?: Timestamp | string | null;
  updatedAt?: Timestamp | string | null;
} 
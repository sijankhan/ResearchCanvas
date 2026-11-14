import { openDB, IDBPDatabase } from 'idb';
import { generateId } from '../utils/id';

const DB_NAME = 'research_canvas_db';
const DB_VERSION = 1;
const STORE_IMAGES = 'images';

// In-memory cache for fast, synchronous access in components
const memoryCache = new Map<string, string>();

interface ImageRecord {
  id: string;
  dataUrl: string;
  createdAt: number;
}

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDb(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_IMAGES)) {
          db.createObjectStore(STORE_IMAGES, { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
}

/**
 * Saves an image to IndexedDB and memory cache, returning the unique imageId.
 */
export async function putImage(dataOrBlob: string | Blob): Promise<string> {
  let dataUrl: string;

  if (typeof dataOrBlob === 'string') {
    dataUrl = dataOrBlob;
  } else {
    dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(dataOrBlob);
    });
  }

  const id = generateId('img_data');
  memoryCache.set(id, dataUrl);

  try {
    const db = await getDb();
    await db.put(STORE_IMAGES, {
      id,
      dataUrl,
      createdAt: Date.now(),
    } as ImageRecord);
  } catch (err) {
    console.error('Failed to save image to IndexedDB:', err);
  }

  return id;
}

/**
 * Retrieves an image by imageId, checking memory cache first then IndexedDB.
 */
export async function getImage(imageId: string): Promise<string | null> {
  if (memoryCache.has(imageId)) {
    return memoryCache.get(imageId)!;
  }

  try {
    const db = await getDb();
    const record = (await db.get(STORE_IMAGES, imageId)) as ImageRecord | undefined;
    if (record?.dataUrl) {
      memoryCache.set(imageId, record.dataUrl);
      return record.dataUrl;
    }
  } catch (err) {
    console.error('Failed to read image from IndexedDB:', err);
  }

  return null;
}

/**
 * Synchronous get from memory cache if already preloaded.
 */
export function getCachedImage(imageId: string): string | null {
  return memoryCache.get(imageId) || null;
}

/**
 * Deletes all images not in the provided usedIds list.
 */
export async function deleteUnused(usedIds: string[]): Promise<void> {
  try {
    const db = await getDb();
    const allKeys = await db.getAllKeys(STORE_IMAGES);
    const usedSet = new Set(usedIds);

    const tx = db.transaction(STORE_IMAGES, 'readwrite');
    for (const key of allKeys) {
      const keyStr = String(key);
      if (!usedSet.has(keyStr)) {
        await tx.store.delete(key);
        memoryCache.delete(keyStr);
      }
    }
    await tx.done;
  } catch (err) {
    console.error('Failed to cleanup unused images:', err);
  }
}

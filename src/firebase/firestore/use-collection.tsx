'use client';

import { useState, useEffect } from 'react';
import {
  Query,
  onSnapshot,
  getDocs,
  DocumentData,
  FirestoreError,
  QuerySnapshot,
  CollectionReference,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/** Utility type to add an 'id' field to a given type T. */
export type WithId<T> = T & { id: string };

/**
 * Interface for the return value of the useCollection hook.
 * @template T Type of the document data.
 */
export interface UseCollectionResult<T> {
  data: WithId<T>[] | null; // Document data with ID, or null.
  isLoading: boolean;       // True if loading.
  error: FirestoreError | Error | null; // Error object, or null.
}

export interface UseCollectionOptions {
  realtime?: boolean;
  cacheTtl?: number; // Cache duration in milliseconds (default: 30 seconds)
  suppressGlobalError?: boolean;
}

/* Internal implementation of Query */
export interface InternalQuery extends Query<DocumentData> {
  _query: {
    path: {
      canonicalString(): string;
      toString(): string;
    };
    filters?: any[];
    orders?: any[];
    limit?: number;
  };
}

interface CacheEntry {
  data: any[];
  timestamp: number;
  promise?: Promise<any[]>;
}

// Global in-memory cache for query results
const globalCollectionCache = new Map<string, CacheEntry>();
const DEFAULT_TTL_MS = 30000; // 30 seconds

// Generates a stable unique cache key for collection references and queries
function getQueryCacheKey(queryObj: any): string {
  if (!queryObj) return '';
  
  if (queryObj.type === 'collection' && 'path' in queryObj) {
    return `col:${(queryObj as CollectionReference).path}`;
  }
  
  if (queryObj._query) {
    const path = queryObj._query.path?.toString() || '';
    const filters = JSON.stringify(queryObj._query.filters || []);
    const orders = JSON.stringify(queryObj._query.orders || []);
    const limitVal = queryObj._query.limit || '';
    return `query:${path}:${filters}:${orders}:${limitVal}`;
  }
  
  return String(queryObj);
}

/**
 * React hook to retrieve a Firestore collection or query.
 * Fetches once with caching by default to conserve read quota.
 * Opt-in to real-time sync with `{ realtime: true }`.
 * 
 * IMPORTANT! YOU MUST MEMOIZE the inputted memoizedTargetRefOrQuery using useMemo.
 */
export function useCollection<T = any>(
  memoizedTargetRefOrQuery: ((CollectionReference<DocumentData> | Query<DocumentData>) & {__memo?: boolean}) | null | undefined,
  options?: UseCollectionOptions
): UseCollectionResult<T> {
  type ResultItemType = WithId<T>;
  type StateDataType = ResultItemType[] | null;

  const [data, setData] = useState<StateDataType>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<FirestoreError | Error | null>(null);

  const isRealtime = !!options?.realtime;
  const cacheTtl = options?.cacheTtl ?? DEFAULT_TTL_MS;

  useEffect(() => {
    if (!memoizedTargetRefOrQuery) {
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    const cacheKey = getQueryCacheKey(memoizedTargetRefOrQuery);

    if (isRealtime) {
      // Real-time synchronization mode (onSnapshot)
      setIsLoading(true);
      setError(null);

      const unsubscribe = onSnapshot(
        memoizedTargetRefOrQuery,
        (snapshot: QuerySnapshot<DocumentData>) => {
          const results: ResultItemType[] = [];
          for (const doc of snapshot.docs) {
            results.push({ ...(doc.data() as T), id: doc.id });
          }
          setData(results);
          setError(null);
          setIsLoading(false);
        },
        (err: FirestoreError) => {
          console.error("Firestore onSnapshot error:", err);
          if (err.code === 'permission-denied') {
            const path: string =
              memoizedTargetRefOrQuery.type === 'collection'
                ? (memoizedTargetRefOrQuery as CollectionReference).path
                : (memoizedTargetRefOrQuery as unknown as InternalQuery)._query.path.canonicalString();

            const contextualError = new FirestorePermissionError({
              operation: 'list',
              path,
            });

            setError(contextualError);
            if (!options?.suppressGlobalError) {
              errorEmitter.emit('permission-error', contextualError);
            }
          } else {
            setError(err);
          }
          setData(null);
          setIsLoading(false);
        }
      );

      return () => unsubscribe();
    } else {
      // One-time cached fetch mode
      const now = Date.now();
      const cached = globalCollectionCache.get(cacheKey);

      // Check if we have a fresh cache entry
      if (cached && now - cached.timestamp < cacheTtl) {
        if (cached.promise) {
          setIsLoading(true);
          setError(null);
          cached.promise
            .then((res) => {
              setData(res as ResultItemType[]);
              setIsLoading(false);
            })
            .catch((err) => {
              setError(err);
              setIsLoading(false);
            });
        } else {
          setData(cached.data as ResultItemType[]);
          setIsLoading(false);
          setError(null);
        }
        return;
      }

      setIsLoading(true);
      setError(null);

      // Deduplicate simultaneous requests for the same query
      const fetchPromise = getDocs(memoizedTargetRefOrQuery)
        .then((snapshot) => {
          const results: ResultItemType[] = [];
          for (const doc of snapshot.docs) {
            results.push({ ...(doc.data() as T), id: doc.id });
          }
          // Cache the final resolved data list
          globalCollectionCache.set(cacheKey, {
            data: results,
            timestamp: Date.now(),
          });
          return results;
        })
        .catch((err) => {
          // Invalidate cache immediately on error
          globalCollectionCache.delete(cacheKey);
          throw err;
        });

      // Temporarily store the fetch promise in cache to share it with concurrent hook calls
      globalCollectionCache.set(cacheKey, {
        data: [],
        timestamp: now,
        promise: fetchPromise,
      });

      fetchPromise
        .then((res) => {
          setData(res);
          setIsLoading(false);
        })
        .catch((err) => {
          console.error("Firestore getDocs error:", err);
          if (err.code === 'permission-denied') {
            const path: string =
              memoizedTargetRefOrQuery.type === 'collection'
                ? (memoizedTargetRefOrQuery as CollectionReference).path
                : (memoizedTargetRefOrQuery as unknown as InternalQuery)._query.path.canonicalString();

            const contextualError = new FirestorePermissionError({
              operation: 'list',
              path,
            });

            setError(contextualError);
            if (!options?.suppressGlobalError) {
              errorEmitter.emit('permission-error', contextualError);
            }
          } else {
            setError(err);
          }
          setData(null);
          setIsLoading(false);
        });
    }
  }, [memoizedTargetRefOrQuery, isRealtime, cacheTtl]);

  if (memoizedTargetRefOrQuery && !memoizedTargetRefOrQuery.__memo) {
    throw new Error(memoizedTargetRefOrQuery + ' was not properly memoized using useMemoFirebase');
  }

  return { data, isLoading, error };
}
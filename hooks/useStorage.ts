import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Web storage fallback for AsyncStorage when running in browser
const webStorage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.error('Error reading from localStorage:', e);
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.error('Error writing to localStorage:', e);
    }
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error('Error removing from localStorage:', e);
    }
  },
};

// Helper to determine which storage to use based on platform
const storage = Platform.OS === 'web' ? webStorage : AsyncStorage;

// Generic hook for working with AsyncStorage with web support
const useStorage = <T>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load data from storage on mount
  useEffect(() => {
    let isMounted = true;
    
    const getStoredValue = async () => {
      try {
        const item = await storage.getItem(key);
        if (item !== null && isMounted) {
          setStoredValue(JSON.parse(item));
        }
      } catch (e) {
        if (isMounted) {
          setError(e instanceof Error ? e : new Error('Unknown error in storage'));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    getStoredValue();
    
    return () => {
      isMounted = false;
    };
  }, [key]);

  // Update the stored value
  const setValue = useCallback(async (value: T) => {
    try {
      // Update state first for immediate UI update
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      
      // Then update storage in background
      setTimeout(async () => {
        try {
          await storage.setItem(key, JSON.stringify(valueToStore));
        } catch (err) {
          console.error('Background storage update failed:', err);
        }
      }, 0);
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Failed to save to storage'));
    }
  }, [key, storedValue]);

  // Remove the item from storage
  const removeValue = useCallback(async () => {
    try {
      // Update state first
      setStoredValue(initialValue);
      
      // Then remove from storage
      setTimeout(async () => {
        try {
          await storage.removeItem(key);
        } catch (err) {
          console.error('Background storage remove failed:', err);
        }
      }, 0);
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Failed to remove from storage'));
    }
  }, [key, initialValue]);

  return {
    storedValue,
    setValue,
    loading,
    error,
    removeValue,
  };
};

export default useStorage;
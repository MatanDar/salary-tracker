import { useEffect, useState } from 'react';
import { collection, doc, setDoc, deleteDoc, onSnapshot, query } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Shift, Settings } from '../types';

// Generate a unique user ID (stored in localStorage)
function getUserId(): string {
  let userId = localStorage.getItem('userId');
  if (!userId) {
    userId = 'user_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('userId', userId);
  }
  return userId;
}

export function useFirestore() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const userId = getUserId();

  // Subscribe to shifts
  useEffect(() => {
    const shiftsRef = collection(db, `users/${userId}/shifts`);
    const q = query(shiftsRef);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const shiftsData: Shift[] = [];
        snapshot.forEach((doc) => {
          shiftsData.push({ ...doc.data() } as Shift);
        });
        setShifts(shiftsData);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching shifts:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  // Subscribe to settings
  useEffect(() => {
    const settingsRef = doc(db, `users/${userId}/settings/main`);

    const unsubscribe = onSnapshot(
      settingsRef,
      (doc) => {
        if (doc.exists()) {
          setSettings(doc.data() as Settings);
        }
      },
      (error) => {
        console.error('Error fetching settings:', error);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  // Add shift
  const addShift = async (shift: Shift) => {
    try {
      const shiftRef = doc(db, `users/${userId}/shifts/${shift.id}`);
      await setDoc(shiftRef, shift);
    } catch (error) {
      console.error('Error adding shift:', error);
      throw error;
    }
  };

  // Update shift
  const updateShift = async (id: string, updatedFields: Partial<Shift>) => {
    try {
      const shiftRef = doc(db, `users/${userId}/shifts/${id}`);
      const existingShift = shifts.find(s => s.id === id);
      if (existingShift) {
        await setDoc(shiftRef, { ...existingShift, ...updatedFields });
      }
    } catch (error) {
      console.error('Error updating shift:', error);
      throw error;
    }
  };

  // Delete shift
  const deleteShift = async (id: string) => {
    try {
      const shiftRef = doc(db, `users/${userId}/shifts/${id}`);
      await deleteDoc(shiftRef);
    } catch (error) {
      console.error('Error deleting shift:', error);
      throw error;
    }
  };

  // Update settings
  const updateSettings = async (updatedSettings: Partial<Settings>) => {
    try {
      const settingsRef = doc(db, `users/${userId}/settings/main`);
      const newSettings = { ...settings, ...updatedSettings };
      await setDoc(settingsRef, newSettings);
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  };

  return {
    shifts,
    settings,
    loading,
    addShift,
    updateShift,
    deleteShift,
    updateSettings,
  };
}

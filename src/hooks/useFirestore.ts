import { useEffect, useState } from 'react';
import { collection, doc, setDoc, deleteDoc, onSnapshot, query } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Shift, Settings } from '../types';

// Default settings - single source of truth for all defaults
const defaultSettings: Settings = {
  salaryType: 'hourly',
  hourlyRate: 40,
  monthlySalary: 10000,
  monthlyAllowances: 0,
  travelPay: {
    enabled: false,
    amount: 22,
    type: 'perDay',
  },
  overtime: {
    enabled: true,
    mode: 'automatic',
    manualAmount: 0,
  },
  shabbatPremium: {
    enabled: false,
  },
  monthStartDay: 1,
  darkMode: false,
  calculateDeductions: false,
  deductions: {
    socialSecurity: 7,
    incomeTax: 10,
    pension: 6,
    trainingFund: 2.5,
  },
  employerContributions: {
    pension: 6.5,
    severance: 6,
    trainingFund: 5,
  },
  shiftTemplates: [
    { id: 'template-1', name: 'משמרת בוקר', startTime: '07:00', endTime: '16:00', color: '#3b82f6' },
    { id: 'template-2', name: 'משמרת ערב',  startTime: '16:00', endTime: '00:00', color: '#f59e0b' },
    { id: 'template-3', name: 'משמרת לילה', startTime: '22:00', endTime: '07:00', color: '#8b5cf6' },
  ],
  vacationDaysBalance: 0,
  sickDaysBalance: 0,
};

// Deep merge loaded settings with defaults so new fields always have values
function mergeWithDefaults(loaded: Partial<Settings>): Settings {
  return {
    ...defaultSettings,
    ...loaded,
    travelPay: {
      ...defaultSettings.travelPay,
      ...(loaded.travelPay || {}),
    },
    overtime: {
      ...defaultSettings.overtime,
      ...(loaded.overtime || {}),
    },
    shabbatPremium: {
      ...defaultSettings.shabbatPremium,
      ...(loaded.shabbatPremium || {}),
    },
    deductions: {
      ...defaultSettings.deductions,
      ...(loaded.deductions || {}),
    },
    employerContributions: {
      ...defaultSettings.employerContributions,
      ...(loaded.employerContributions || {}),
    },
    shiftTemplates: loaded.shiftTemplates?.length
      ? loaded.shiftTemplates
      : defaultSettings.shiftTemplates,
  };
}

// Generate a unique user ID (stored in localStorage)
function getUserId(): string {
  // Check URL for recovery param
  const params = new URLSearchParams(window.location.search);
  const urlUserId = params.get('userId');
  if (urlUserId) {
    localStorage.setItem('userId', urlUserId);
    return urlUserId;
  }
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
        snapshot.forEach((d) => {
          shiftsData.push({ ...d.data() } as Shift);
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
      (d) => {
        if (d.exists()) {
          // Always merge with defaults so new fields never go missing
          setSettings(mergeWithDefaults(d.data() as Partial<Settings>));
        } else {
          // No settings doc yet - use defaults
          setSettings(defaultSettings);
        }
      },
      (error) => {
        console.error('Error fetching settings:', error);
        setSettings(defaultSettings);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  const addShift = async (shift: Shift) => {
    try {
      const shiftRef = doc(db, `users/${userId}/shifts/${shift.id}`);
      await setDoc(shiftRef, shift);
    } catch (error) {
      console.error('Error adding shift:', error);
      throw error;
    }
  };

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

  const deleteShift = async (id: string) => {
    try {
      const shiftRef = doc(db, `users/${userId}/shifts/${id}`);
      await deleteDoc(shiftRef);
    } catch (error) {
      console.error('Error deleting shift:', error);
      throw error;
    }
  };

  // Update settings - always merge with defaults + current to prevent field loss
  const updateSettings = async (updatedSettings: Partial<Settings>) => {
    try {
      const settingsRef = doc(db, `users/${userId}/settings/main`);
      const current = settings || defaultSettings;

      // Merge nested objects carefully
      const newSettings: Settings = {
        ...current,
        ...updatedSettings,
        travelPay: updatedSettings.travelPay
          ? { ...current.travelPay, ...updatedSettings.travelPay }
          : current.travelPay,
        overtime: updatedSettings.overtime
          ? { ...current.overtime, ...updatedSettings.overtime }
          : current.overtime,
        shabbatPremium: updatedSettings.shabbatPremium
          ? { ...current.shabbatPremium, ...updatedSettings.shabbatPremium }
          : current.shabbatPremium,
        deductions: updatedSettings.deductions
          ? { ...current.deductions, ...updatedSettings.deductions }
          : current.deductions,
        employerContributions: updatedSettings.employerContributions
          ? { ...current.employerContributions, ...updatedSettings.employerContributions }
          : current.employerContributions,
      };

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

export { defaultSettings };

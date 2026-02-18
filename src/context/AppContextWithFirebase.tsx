import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Shift, Settings, ActiveShift } from '../types';
import { useFirestore, defaultSettings } from '../hooks/useFirestore';

interface AppContextType {
  shifts: Shift[];
  settings: Settings;
  activeShift: ActiveShift | null;
  addShift: (shift: Shift) => void;
  updateShift: (id: string, shift: Partial<Shift>) => void;
  deleteShift: (id: string) => void;
  updateSettings: (settings: Partial<Settings>) => void;
  startShift: () => void;
  endShift: () => Shift | null;
  clearActiveShift: () => void;
  currentMonth: { year: number; month: number };
  setCurrentMonth: (year: number, month: number) => void;
  loading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const firestore = useFirestore();
  const [activeShift, setActiveShift] = useState<ActiveShift | null>(null);
  const [currentMonth, setCurrentMonthState] = useState<{ year: number; month: number }>(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  // Load active shift from localStorage
  useEffect(() => {
    const savedActiveShift = localStorage.getItem('activeShift');
    if (savedActiveShift) {
      try {
        setActiveShift(JSON.parse(savedActiveShift));
      } catch {
        localStorage.removeItem('activeShift');
      }
    }
  }, []);

  // Save active shift to localStorage
  useEffect(() => {
    if (activeShift) {
      localStorage.setItem('activeShift', JSON.stringify(activeShift));
    } else {
      localStorage.removeItem('activeShift');
    }
  }, [activeShift]);

  // Initialize settings in Firestore if not exists
  useEffect(() => {
    if (!firestore.loading && !firestore.settings) {
      firestore.updateSettings(defaultSettings);
    }
  }, [firestore.loading, firestore.settings]);

  const startShift = () => {
    const now = new Date();
    const shiftId = crypto.randomUUID();
    const startTime = now.toTimeString().slice(0, 5);

    const shift: Shift = {
      id: shiftId,
      date: now.toISOString().split('T')[0],
      startTime,
      endTime: '--:--',
      isHoliday: false,
      notes: '',
      inProgress: true,
    };

    firestore.addShift(shift);
    setActiveShift({ startTime: now.toISOString() });
    localStorage.setItem('activeShiftId', shiftId);
  };

  const endShift = (): Shift | null => {
    if (!activeShift) return null;

    const end = new Date();
    const endTime = end.toTimeString().slice(0, 5);
    const activeShiftId = localStorage.getItem('activeShiftId');

    if (activeShiftId) {
      firestore.updateShift(activeShiftId, { endTime, inProgress: false });
    } else {
      const start = new Date(activeShift.startTime);
      const shift: Shift = {
        id: crypto.randomUUID(),
        date: start.toISOString().split('T')[0],
        startTime: start.toTimeString().slice(0, 5),
        endTime,
        isHoliday: false,
        notes: '',
      };
      firestore.addShift(shift);
    }

    setActiveShift(null);
    localStorage.removeItem('activeShiftId');
    return null;
  };

  // Clears active shift state without updating Firestore (used when closing via modal)
  const clearActiveShift = () => {
    setActiveShift(null);
    localStorage.removeItem('activeShift');
    localStorage.removeItem('activeShiftId');
  };

  const setCurrentMonth = (year: number, month: number) => {
    setCurrentMonthState({ year, month });
  };

  return (
    <AppContext.Provider
      value={{
        shifts: firestore.shifts,
        settings: firestore.settings || defaultSettings,
        activeShift,
        addShift: firestore.addShift,
        updateShift: firestore.updateShift,
        deleteShift: firestore.deleteShift,
        updateSettings: firestore.updateSettings,
        startShift,
        endShift,
        clearActiveShift,
        currentMonth,
        setCurrentMonth,
        loading: firestore.loading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}

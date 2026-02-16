import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Shift, Settings, ActiveShift } from '../types';
import { useFirestore } from '../hooks/useFirestore';

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
  currentMonth: { year: number; month: number };
  setCurrentMonth: (year: number, month: number) => void;
  loading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const defaultSettings: Settings = {
  salaryType: 'hourly',
  hourlyRate: 40,
  monthlySalary: 10000,
  travelPay: {
    enabled: false,
    amount: 22,
    type: 'perDay',
  },
  overtime: {
    enabled: true,
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
};

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
      setActiveShift(JSON.parse(savedActiveShift));
    }
  }, []);

  // Save active shift to localStorage
  useEffect(() => {
    localStorage.setItem('activeShift', JSON.stringify(activeShift));
  }, [activeShift]);

  // Initialize settings if not exists
  useEffect(() => {
    if (!firestore.loading && !firestore.settings) {
      firestore.updateSettings(defaultSettings);
    }
  }, [firestore.loading, firestore.settings]);

  const startShift = () => {
    setActiveShift({ startTime: new Date().toISOString() });
  };

  const endShift = (): Shift | null => {
    if (!activeShift) return null;

    const start = new Date(activeShift.startTime);
    const end = new Date();

    const shift: Shift = {
      id: crypto.randomUUID(),
      date: start.toISOString().split('T')[0],
      startTime: start.toTimeString().slice(0, 5),
      endTime: end.toTimeString().slice(0, 5),
      isHoliday: false,
      notes: '',
    };

    firestore.addShift(shift);
    setActiveShift(null);
    return shift;
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

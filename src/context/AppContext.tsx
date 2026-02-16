import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Shift, Settings, ActiveShift } from '../types';

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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const defaultSettings: Settings = {
  hourlyRate: 40,
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
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [activeShift, setActiveShift] = useState<ActiveShift | null>(null);
  const [currentMonth, setCurrentMonthState] = useState<{ year: number; month: number }>(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  // Load from localStorage on mount
  useEffect(() => {
    const savedShifts = localStorage.getItem('shifts');
    const savedSettings = localStorage.getItem('settings');
    const savedActiveShift = localStorage.getItem('activeShift');

    if (savedShifts) {
      setShifts(JSON.parse(savedShifts));
    }
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
    if (savedActiveShift) {
      setActiveShift(JSON.parse(savedActiveShift));
    }
  }, []);

  // Save to localStorage on changes
  useEffect(() => {
    localStorage.setItem('shifts', JSON.stringify(shifts));
  }, [shifts]);

  useEffect(() => {
    localStorage.setItem('settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('activeShift', JSON.stringify(activeShift));
  }, [activeShift]);

  const addShift = (shift: Shift) => {
    setShifts(prev => [...prev, shift]);
  };

  const updateShift = (id: string, updatedFields: Partial<Shift>) => {
    setShifts(prev =>
      prev.map(shift => (shift.id === id ? { ...shift, ...updatedFields } : shift))
    );
  };

  const deleteShift = (id: string) => {
    setShifts(prev => prev.filter(shift => shift.id !== id));
  };

  const updateSettings = (updatedSettings: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...updatedSettings }));
  };

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

    addShift(shift);
    setActiveShift(null);
    return shift;
  };

  const setCurrentMonth = (year: number, month: number) => {
    setCurrentMonthState({ year, month });
  };

  return (
    <AppContext.Provider
      value={{
        shifts,
        settings,
        activeShift,
        addShift,
        updateShift,
        deleteShift,
        updateSettings,
        startShift,
        endShift,
        currentMonth,
        setCurrentMonth,
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

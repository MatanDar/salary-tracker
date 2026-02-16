export interface Shift {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  isHoliday: boolean;
  notes?: string;
}

export interface ActiveShift {
  startTime: string; // ISO timestamp
}

export interface TravelPay {
  enabled: boolean;
  amount: number;
  type: 'perDay' | 'monthly';
}

export interface Settings {
  hourlyRate: number;
  travelPay: TravelPay;
  overtime: {
    enabled: boolean;
  };
  shabbatPremium: {
    enabled: boolean;
  };
  monthStartDay: number;
  darkMode: boolean;
}

export interface ShiftCalculation {
  totalHours: number;
  regularHours: number;
  overtime125Hours: number;
  overtime150Hours: number;
  isShabbat: boolean;
  isHoliday: boolean;
}

export interface MonthlySummary {
  totalHours: number;
  shiftsCount: number;
  regularPay: number;
  overtime125Pay: number;
  overtime150Pay: number;
  shabbatHolidayPay: number;
  travelPay: number;
  grossTotal: number;
}

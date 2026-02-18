export interface Shift {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  isHoliday: boolean;
  notes?: string;
  inProgress?: boolean; // true when shift is active (clocked in but not out yet)
  shiftType?: 'regular' | 'vacation' | 'sick'; // סוג משמרת
}

export interface ActiveShift {
  startTime: string; // ISO timestamp
}

export interface ShiftTemplate {
  id: string;
  name: string; // שם התבנית (למשל: "משמרת בוקר", "משמרת ערב")
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  color: string; // hex color for visual distinction
}

export interface TravelPay {
  enabled: boolean;
  amount: number;
  type: 'perDay' | 'monthly';
}

export interface Deductions {
  socialSecurity: number; // ביטוח לאומי (%)
  incomeTax: number; // מס הכנסה (%)
  pension: number; // פנסיה - חלק עובד (%)
  trainingFund: number; // קרן השתלמות - חלק עובד (%)
}

export interface EmployerContributions {
  pension: number; // פנסיה - חלק מעסיק (%)
  severance: number; // פיצויים (%)
  trainingFund: number; // קרן השתלמות - חלק מעסיק (%)
}

export interface Settings {
  salaryType: 'hourly' | 'monthly'; // שכר שעתי או חודשי
  hourlyRate: number;
  monthlySalary: number; // שכר חודשי קבוע (ברוטו)
  monthlyAllowances?: number; // תוספות חודשיות (קיצוב, הרל, וכו')
  travelPay: TravelPay;
  overtime: {
    enabled: boolean;
    mode?: 'automatic' | 'manual'; // automatic = חישוב אוטומטי, manual = סכום ידני
    manualAmount?: number; // סכום ידני לשעות נוספות (₪)
  };
  shabbatPremium: {
    enabled: boolean;
  };
  monthStartDay: number;
  darkMode: boolean;
  deductions: Deductions;
  employerContributions: EmployerContributions;
  calculateDeductions: boolean; // האם לחשב ניכויים
  shiftTemplates: ShiftTemplate[]; // תבניות משמרות
  vacationDaysBalance?: number; // יתרת ימי חופשה
  sickDaysBalance?: number; // יתרת ימי מחלה
  dailyHoursTarget?: number; // יעד שעות יומי למאזן (ברירת מחדל: 9)
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
  // Deductions
  socialSecurityDeduction: number;
  incomeTaxDeduction: number;
  pensionDeduction: number;
  trainingFundDeduction: number;
  totalDeductions: number;
  netPay: number; // נטו לתשלום
  // Employer contributions
  employerPension: number;
  employerSeverance: number;
  employerTrainingFund: number;
  totalEmployerCost: number;
  // Days off
  vacationDaysUsed: number;
  sickDaysUsed: number;
}

export interface Payslip {
  id: string;
  month: string; // YYYY-MM
  imageUrl: string;
  uploadDate: string;
  notes?: string;
}

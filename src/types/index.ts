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
  travelPay: TravelPay;
  overtime: {
    enabled: boolean;
  };
  shabbatPremium: {
    enabled: boolean;
  };
  monthStartDay: number;
  darkMode: boolean;
  deductions: Deductions;
  employerContributions: EmployerContributions;
  calculateDeductions: boolean; // האם לחשב ניכויים
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
}

export interface Payslip {
  id: string;
  month: string; // YYYY-MM
  imageUrl: string;
  uploadDate: string;
  notes?: string;
}

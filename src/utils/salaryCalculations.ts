import { Shift, Settings, ShiftCalculation, MonthlySummary } from '../types';
import { calculateDuration, isShabbat, getMonthRange, isDateInRange } from './dateHelpers';

export function calculateShift(shift: Shift, settings: Settings): ShiftCalculation {
  const totalHours = calculateDuration(shift.date, shift.startTime, shift.endTime);
  const isShabbatShift = settings.shabbatPremium.enabled && isShabbat(shift.date);
  const isHolidayShift = shift.isHoliday;

  let regularHours = totalHours;
  let overtime125Hours = 0;
  let overtime150Hours = 0;

  // Calculate overtime if enabled (only for non-Shabbat/Holiday shifts)
  if (settings.overtime.enabled && !isShabbatShift && !isHolidayShift) {
    if (totalHours > 10) {
      regularHours = 8;
      overtime125Hours = 2;
      overtime150Hours = totalHours - 10;
    } else if (totalHours > 8) {
      regularHours = 8;
      overtime125Hours = totalHours - 8;
    }
  }

  return {
    totalHours,
    regularHours,
    overtime125Hours,
    overtime150Hours,
    isShabbat: isShabbatShift,
    isHoliday: isHolidayShift,
  };
}

export function calculateMonthlySummary(
  shifts: Shift[],
  settings: Settings,
  year: number,
  month: number
): MonthlySummary {
  const { start, end } = getMonthRange(year, month, settings.monthStartDay);

  const monthShifts = shifts.filter(shift => isDateInRange(shift.date, start, end));

  let totalHours = 0;
  let regularPay = 0;
  let overtime125Pay = 0;
  let overtime150Pay = 0;
  let shabbatHolidayPay = 0;

  monthShifts.forEach(shift => {
    const calc = calculateShift(shift, settings);
    totalHours += calc.totalHours;

    if (calc.isShabbat || calc.isHoliday) {
      // Shabbat/Holiday: all hours at 150%
      shabbatHolidayPay += calc.totalHours * settings.hourlyRate * 1.5;
    } else {
      // Regular breakdown
      regularPay += calc.regularHours * settings.hourlyRate;
      overtime125Pay += calc.overtime125Hours * settings.hourlyRate * 1.25;
      overtime150Pay += calc.overtime150Hours * settings.hourlyRate * 1.5;
    }
  });

  // Calculate travel pay
  let travelPay = 0;
  if (settings.travelPay.enabled) {
    if (settings.travelPay.type === 'perDay') {
      travelPay = monthShifts.length * settings.travelPay.amount;
    } else {
      travelPay = settings.travelPay.amount;
    }
  }

  const grossTotal = regularPay + overtime125Pay + overtime150Pay + shabbatHolidayPay + travelPay;

  return {
    totalHours,
    shiftsCount: monthShifts.length,
    regularPay,
    overtime125Pay,
    overtime150Pay,
    shabbatHolidayPay,
    travelPay,
    grossTotal,
  };
}

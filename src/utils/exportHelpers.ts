import { Shift, Settings, MonthlySummary } from '../types';
import { formatDuration, calculateDuration, getDayName } from './dateHelpers';

export function exportToCSV(shifts: Shift[], month: string, year: number): void {
  // Create CSV header
  const header = ['תאריך', 'יום', 'שעת התחלה', 'שעת סיום', 'סה"כ שעות', 'חג', 'הערות'];

  // Create CSV rows
  const rows = shifts.map(shift => {
    const date = new Date(shift.date);
    const dayName = getDayName(shift.date);
    const duration = calculateDuration(shift.date, shift.startTime, shift.endTime);

    return [
      shift.date,
      dayName,
      shift.startTime,
      shift.endTime,
      formatDuration(duration),
      shift.isHoliday ? 'כן' : 'לא',
      shift.notes || ''
    ];
  });

  // Combine header and rows
  const csvContent = [
    header.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  // Add BOM for Hebrew support
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });

  // Create download link
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `shifts_${year}_${month}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function copyToClipboard(shifts: Shift[]): Promise<void> {
  // Create tab-separated format for easy pasting into Google Sheets
  const header = ['תאריך', 'יום', 'התחלה', 'סיום', 'שעות', 'חג', 'הערות'].join('\t');

  const rows = shifts.map(shift => {
    const date = new Date(shift.date);
    const dayName = getDayName(shift.date);
    const duration = calculateDuration(shift.date, shift.startTime, shift.endTime);

    return [
      shift.date,
      dayName,
      shift.startTime,
      shift.endTime,
      formatDuration(duration),
      shift.isHoliday ? 'כן' : '',
      shift.notes || ''
    ].join('\t');
  });

  const textContent = [header, ...rows].join('\n');

  return navigator.clipboard.writeText(textContent);
}

export function exportSummaryToCSV(summary: MonthlySummary, month: string, year: number, settings: Settings): void {
  const rows = [
    ['דוח שכר חודשי', `${month} ${year}`],
    [''],
    ['סה"כ שעות', formatDuration(summary.totalHours)],
    ['מספר משמרות', summary.shiftsCount.toString()],
    [''],
    ['הכנסות:', ''],
    ['שעות רגילות', `₪${summary.regularPay.toFixed(2)}`],
  ];

  if (summary.overtime125Pay > 0) {
    rows.push(['שעות נוספות 125%', `₪${summary.overtime125Pay.toFixed(2)}`]);
  }
  if (summary.overtime150Pay > 0) {
    rows.push(['שעות נוספות 150%', `₪${summary.overtime150Pay.toFixed(2)}`]);
  }
  if (summary.shabbatHolidayPay > 0) {
    rows.push(['שבת/חגים', `₪${summary.shabbatHolidayPay.toFixed(2)}`]);
  }
  if (summary.travelPay > 0) {
    rows.push(['דמי נסיעות', `₪${summary.travelPay.toFixed(2)}`]);
  }

  rows.push([''], ['סה"כ ברוטו', `₪${summary.grossTotal.toFixed(2)}`]);

  if (settings.calculateDeductions) {
    rows.push(
      [''],
      ['ניכויים:', ''],
      ['ביטוח לאומי', `₪${summary.socialSecurityDeduction.toFixed(2)}`],
      ['מס הכנסה', `₪${summary.incomeTaxDeduction.toFixed(2)}`],
      ['פנסיה', `₪${summary.pensionDeduction.toFixed(2)}`],
      ['קרן השתלמות', `₪${summary.trainingFundDeduction.toFixed(2)}`],
      [''],
      ['סה"כ ניכויים', `₪${summary.totalDeductions.toFixed(2)}`],
      [''],
      ['נטו לתשלום', `₪${summary.netPay.toFixed(2)}`]
    );
  }

  const csvContent = rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });

  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `salary_report_${year}_${month}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

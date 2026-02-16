import jsPDF from 'jspdf';
import { MonthlySummary, Settings } from '../types';
import { getMonthName, formatDuration } from './dateHelpers';

export function generatePayslipPDF(
  summary: MonthlySummary,
  settings: Settings,
  month: number,
  year: number
): void {
  const doc = new jsPDF();
  const monthName = getMonthName(month);

  let yPos = 20;

  // Title
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Payslip', 105, yPos, { align: 'center' });

  yPos += 10;
  doc.setFontSize(16);
  doc.setFont('helvetica', 'normal');
  doc.text(`${monthName} ${year}`, 105, yPos, { align: 'center' });

  yPos += 15;

  // Work Summary
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Work Summary', 20, yPos);
  yPos += 7;
  doc.setLineWidth(0.5);
  doc.line(20, yPos, 190, yPos);
  yPos += 8;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Total Hours: ${formatDuration(summary.totalHours)}`, 20, yPos);
  yPos += 6;
  doc.text(`Total Shifts: ${summary.shiftsCount}`, 20, yPos);
  yPos += 12;

  // Income
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Income', 20, yPos);
  yPos += 7;
  doc.line(20, yPos, 190, yPos);
  yPos += 8;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');

  if (settings.salaryType === 'monthly') {
    doc.text('Monthly Salary', 20, yPos);
    doc.text(`ILS ${settings.monthlySalary.toFixed(2)}`, 190, yPos, { align: 'right' });
    yPos += 6;
  } else {
    doc.text('Regular Hours', 20, yPos);
    doc.text(`ILS ${summary.regularPay.toFixed(2)}`, 190, yPos, { align: 'right' });
    yPos += 6;
  }

  if (summary.overtime125Pay > 0) {
    doc.text('Overtime 125%', 20, yPos);
    doc.text(`ILS ${summary.overtime125Pay.toFixed(2)}`, 190, yPos, { align: 'right' });
    yPos += 6;
  }

  if (summary.overtime150Pay > 0) {
    doc.text('Overtime 150%', 20, yPos);
    doc.text(`ILS ${summary.overtime150Pay.toFixed(2)}`, 190, yPos, { align: 'right' });
    yPos += 6;
  }

  if (summary.shabbatHolidayPay > 0) {
    doc.text('Shabbat/Holidays', 20, yPos);
    doc.text(`ILS ${summary.shabbatHolidayPay.toFixed(2)}`, 190, yPos, { align: 'right' });
    yPos += 6;
  }

  if (summary.travelPay > 0) {
    doc.text('Travel Pay', 20, yPos);
    doc.text(`ILS ${summary.travelPay.toFixed(2)}`, 190, yPos, { align: 'right' });
    yPos += 6;
  }

  yPos += 4;
  doc.setFont('helvetica', 'bold');
  doc.text('Gross Total', 20, yPos);
  doc.text(`ILS ${summary.grossTotal.toFixed(2)}`, 190, yPos, { align: 'right' });
  doc.line(20, yPos + 2, 190, yPos + 2);
  yPos += 12;

  // Deductions
  if (settings.calculateDeductions) {
    doc.setFontSize(14);
    doc.text('Deductions', 20, yPos);
    yPos += 7;
    doc.line(20, yPos, 190, yPos);
    yPos += 8;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');

    doc.text('Social Security', 20, yPos);
    doc.text(`ILS ${summary.socialSecurityDeduction.toFixed(2)}`, 190, yPos, { align: 'right' });
    yPos += 6;

    doc.text('Income Tax', 20, yPos);
    doc.text(`ILS ${summary.incomeTaxDeduction.toFixed(2)}`, 190, yPos, { align: 'right' });
    yPos += 6;

    doc.text('Pension', 20, yPos);
    doc.text(`ILS ${summary.pensionDeduction.toFixed(2)}`, 190, yPos, { align: 'right' });
    yPos += 6;

    doc.text('Training Fund', 20, yPos);
    doc.text(`ILS ${summary.trainingFundDeduction.toFixed(2)}`, 190, yPos, { align: 'right' });
    yPos += 6;

    yPos += 4;
    doc.setFont('helvetica', 'bold');
    doc.text('Total Deductions', 20, yPos);
    doc.text(`ILS ${summary.totalDeductions.toFixed(2)}`, 190, yPos, { align: 'right' });
    doc.line(20, yPos + 2, 190, yPos + 2);
    yPos += 12;

    // Net Pay
    doc.setFontSize(16);
    doc.setTextColor(0, 128, 0);
    doc.text('Net Pay', 20, yPos);
    doc.text(`ILS ${summary.netPay.toFixed(2)}`, 190, yPos, { align: 'right' });
    doc.setTextColor(0, 0, 0);
  }

  // Footer
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated ${new Date().toLocaleDateString('en-US')} - My Salary App`, 105, 285, { align: 'center' });

  doc.save(`payslip_${year}_${month + 1}.pdf`);
}

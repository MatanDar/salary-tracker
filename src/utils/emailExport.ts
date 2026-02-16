import { Shift } from '../types';
import { formatDuration, calculateDuration, getDayName } from './dateHelpers';

export async function emailMonthlyCSV(
  shifts: Shift[],
  monthName: string,
  year: number
): Promise<void> {
  // Create CSV content
  const header = ['תאריך', 'יום', 'שעת התחלה', 'שעת סיום', 'סה"כ שעות', 'חג', 'הערות'];

  const rows = shifts.map(shift => {
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

  const csvContent = [
    header.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  // Add BOM for Hebrew support
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const file = new File([blob], `shifts_${year}_${monthName}.csv`, { type: 'text/csv' });

  // Try Web Share API first (works great on mobile!)
  if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: `משמרות ${monthName} ${year}`,
        text: `דוח משמרות לחודש ${monthName} ${year}`,
      });
      return;
    } catch (err) {
      // User cancelled or share failed, fall through to mailto
      if ((err as Error).name === 'AbortError') {
        return; // User cancelled, don't show error
      }
    }
  }

  // Fallback: Download the file and open email client
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `shifts_${year}_${monthName}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  // Open email client with instructions
  const emailSubject = encodeURIComponent(`דוח שעות ${monthName} ${year}`);
  const emailBody = encodeURIComponent(
    `שלום,\n\nמצורף דוח שעות העבודה שלי לחודש ${monthName} ${year}.\n\nהקובץ הורד למכשיר שלי ונקרא: shifts_${year}_${monthName}.csv\n\nנא לצרף אותו למייל זה.\n\nתודה!`
  );

  window.open(`mailto:?subject=${emailSubject}&body=${emailBody}`, '_blank');
}

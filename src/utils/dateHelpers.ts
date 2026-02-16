export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function formatTime(date: Date): string {
  return date.toTimeString().slice(0, 5);
}

export function parseDateTime(date: string, time: string): Date {
  return new Date(`${date}T${time}:00`);
}

export function calculateDuration(startDate: string, startTime: string, endTime: string): number {
  const start = parseDateTime(startDate, startTime);
  let end = parseDateTime(startDate, endTime);

  // Handle midnight crossing
  if (end < start) {
    end = new Date(end.getTime() + 24 * 60 * 60 * 1000);
  }

  return (end.getTime() - start.getTime()) / (1000 * 60 * 60); // hours
}

export function formatDuration(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.floor((hours - h) * 60);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

export function isShabbat(dateString: string): boolean {
  const date = new Date(dateString);
  return date.getDay() === 6; // Saturday
}

export function getDayName(dateString: string): string {
  const days = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
  const date = new Date(dateString);
  return days[date.getDay()];
}

export function getMonthName(month: number): string {
  const months = [
    'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
    'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
  ];
  return months[month];
}

export function getMonthRange(year: number, month: number, startDay: number): { start: Date; end: Date } {
  let startDate: Date;
  let endDate: Date;

  if (startDay === 1) {
    startDate = new Date(year, month, 1);
    endDate = new Date(year, month + 1, 0, 23, 59, 59);
  } else {
    // Custom month start
    if (startDay > 15) {
      // Starts in previous month
      startDate = new Date(year, month - 1, startDay);
      endDate = new Date(year, month, startDay - 1, 23, 59, 59);
    } else {
      startDate = new Date(year, month, startDay);
      endDate = new Date(year, month + 1, startDay - 1, 23, 59, 59);
    }
  }

  return { start: startDate, end: endDate };
}

export function isDateInRange(dateString: string, start: Date, end: Date): boolean {
  const date = new Date(dateString);
  return date >= start && date <= end;
}

import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { calculateMonthlySummary } from '../utils/salaryCalculations';
import { formatDuration, getMonthName } from '../utils/dateHelpers';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

export function Report() {
  const { shifts, settings, currentMonth, setCurrentMonth } = useApp();
  const navigate = useNavigate();

  const summary = calculateMonthlySummary(
    shifts,
    settings,
    currentMonth.year,
    currentMonth.month
  );

  const handlePrevMonth = () => {
    const newMonth = currentMonth.month - 1;
    if (newMonth < 0) {
      setCurrentMonth(currentMonth.year - 1, 11);
    } else {
      setCurrentMonth(currentMonth.year, newMonth);
    }
  };

  const handleNextMonth = () => {
    const newMonth = currentMonth.month + 1;
    if (newMonth > 11) {
      setCurrentMonth(currentMonth.year + 1, 0);
    } else {
      setCurrentMonth(currentMonth.year, newMonth);
    }
  };

  const reportItems = [
    {
      label: 'שעות רגילות',
      value: summary.regularPay,
      show: summary.regularPay > 0,
    },
    {
      label: 'שעות נוספות 125%',
      value: summary.overtime125Pay,
      show: summary.overtime125Pay > 0,
    },
    {
      label: 'שעות נוספות 150%',
      value: summary.overtime150Pay,
      show: summary.overtime150Pay > 0,
    },
    {
      label: 'שבת/חגים (150%)',
      value: summary.shabbatHolidayPay,
      show: summary.shabbatHolidayPay > 0,
    },
    {
      label: 'דמי נסיעות',
      value: summary.travelPay,
      show: summary.travelPay > 0,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20 px-4 pt-4">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => navigate('/')}
          className="text-gray-600 hover:text-gray-800"
        >
          <ArrowRight size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">דוח חודשי</h1>
        </div>
      </div>

      {/* Month Navigator */}
      <Card className="mb-4">
        <div className="flex items-center justify-between">
          <Button variant="secondary" size="sm" onClick={handleNextMonth}>
            <ChevronRight size={20} />
          </Button>
          <h2 className="text-lg font-semibold">
            {getMonthName(currentMonth.month)} {currentMonth.year}
          </h2>
          <Button variant="secondary" size="sm" onClick={handlePrevMonth}>
            <ChevronLeft size={20} />
          </Button>
        </div>
      </Card>

      {/* Summary */}
      <Card className="mb-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">סה"כ שעות</span>
            <span className="font-semibold">{formatDuration(summary.totalHours)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">מספר משמרות</span>
            <span className="font-semibold">{summary.shiftsCount}</span>
          </div>
        </div>
      </Card>

      {/* Breakdown */}
      <Card className="mb-4">
        <h2 className="text-lg font-semibold mb-4">פירוט תשלום</h2>
        <div className="space-y-3">
          {reportItems.filter(item => item.show).map((item, index) => (
            <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
              <span className="text-gray-700">{item.label}</span>
              <span className="font-semibold text-blue-600">
                ₪{item.value.toFixed(2)}
              </span>
            </div>
          ))}

          {reportItems.filter(item => item.show).length === 0 && (
            <p className="text-gray-500 text-center py-4">אין נתונים להצגה</p>
          )}
        </div>
      </Card>

      {/* Total */}
      <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
        <div className="text-center">
          <p className="text-sm opacity-90 mb-1">סה"כ ברוטו משוער</p>
          <p className="text-4xl font-bold">₪{summary.grossTotal.toFixed(2)}</p>
          <p className="text-xs opacity-75 mt-2">לפני ניכויים</p>
        </div>
      </Card>

      {/* Info */}
      <div className="mt-6 text-center text-sm text-gray-500">
        <p>* החישוב הוא משוער ומבוסס על ההגדרות שהוזנו</p>
        <p>לחישוב מדויק, יש להתייעץ עם מחלקת שכר</p>
      </div>
    </div>
  );
}

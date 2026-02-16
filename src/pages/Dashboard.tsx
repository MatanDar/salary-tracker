import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useTimer } from '../hooks/useTimer';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { calculateMonthlySummary } from '../utils/salaryCalculations';
import { formatDuration, getMonthName } from '../utils/dateHelpers';
import { Play, Square, ChevronLeft, ChevronRight, FileText } from 'lucide-react';

export function Dashboard() {
  const { shifts, settings, startShift, endShift, currentMonth, setCurrentMonth } = useApp();
  const { formattedTime, isActive } = useTimer();
  const navigate = useNavigate();

  const summary = calculateMonthlySummary(
    shifts,
    settings,
    currentMonth.year,
    currentMonth.month
  );

  const handleClockToggle = () => {
    if (isActive) {
      endShift();
    } else {
      startShift();
    }
  };

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

  return (
    <div className="min-h-screen bg-gray-50 pb-20 px-4 pt-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">השכר שלי</h1>
        <p className="text-gray-600">מעקב שעות עבודה ושכר</p>
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

      {/* Clock In/Out Button */}
      <div className="mb-6 flex justify-center">
        <button
          onClick={handleClockToggle}
          className={`w-48 h-48 rounded-full text-white text-xl font-bold shadow-lg transition-all duration-300 transform active:scale-95 ${
            isActive
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          <div className="flex flex-col items-center justify-center">
            {isActive ? <Square size={32} /> : <Play size={32} />}
            <span className="mt-2">{isActive ? 'יציאה ממשמרת' : 'כניסה למשמרת'}</span>
            {isActive && (
              <span className="text-sm mt-2 font-mono">{formattedTime}</span>
            )}
          </div>
        </button>
      </div>

      {/* Monthly Summary Cards */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-600">סה"כ שעות</p>
            <p className="text-2xl font-bold text-blue-600">
              {formatDuration(summary.totalHours)}
            </p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-600">משמרות</p>
            <p className="text-2xl font-bold text-blue-600">{summary.shiftsCount}</p>
          </div>
        </Card>
      </div>

      <Card className="mb-4">
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-1">משוער ברוטו</p>
          <p className="text-3xl font-bold text-green-600">
            ₪{summary.grossTotal.toFixed(2)}
          </p>
        </div>
      </Card>

      {/* View Report Button */}
      <Button
        className="w-full flex items-center justify-center gap-2"
        onClick={() => navigate('/report')}
      >
        <FileText size={20} />
        <span>צפייה בדוח מפורט</span>
      </Button>
    </div>
  );
}

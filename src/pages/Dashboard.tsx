import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useTimer } from '../hooks/useTimer';
import { MonthlyChart } from '../components/MonthlyChart';
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
    <div className="min-h-screen bg-white pb-20">
      {/* Header with Month */}
      <div className="bg-blue-500 text-white px-4 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <button onClick={handlePrevMonth} className="p-1 hover:bg-blue-600 rounded">
            <ChevronLeft size={24} />
          </button>
          <div className="text-center">
            <h1 className="text-xl font-bold">השכר שלי</h1>
            <p className="text-sm opacity-90">
              {getMonthName(currentMonth.month)} {currentMonth.year}
            </p>
          </div>
          <button onClick={handleNextMonth} className="p-1 hover:bg-blue-600 rounded">
            <ChevronRight size={24} />
          </button>
        </div>
      </div>

      <div className="px-4 pt-6">
        {/* Clock In/Out Button */}
        <div className="mb-6 flex justify-center">
          <button
            onClick={handleClockToggle}
            className={`w-40 h-40 rounded-full text-white text-lg font-bold shadow-xl transition-all duration-300 transform active:scale-95 ${
              isActive
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            <div className="flex flex-col items-center justify-center">
              {isActive ? <Square size={28} /> : <Play size={28} />}
              <span className="mt-2 text-base">{isActive ? 'יציאה' : 'כניסה'}</span>
              <span className="text-xs">{isActive ? 'ממשמרת' : 'למשמרת'}</span>
              {isActive && (
                <span className="text-sm mt-2 font-mono">{formattedTime}</span>
              )}
            </div>
          </button>
        </div>

        {/* Summary Cards */}
        <div className="space-y-3 mb-4">
          <div className="bg-white border border-gray-300 rounded-lg p-4">
            <div className="grid grid-cols-2 divide-x divide-gray-300">
              <div className="text-center pl-3">
                <p className="text-xs text-gray-600 mb-1">סה"כ שעות</p>
                <p className="text-xl font-bold text-blue-600">
                  {formatDuration(summary.totalHours)}
                </p>
              </div>
              <div className="text-center pr-3">
                <p className="text-xs text-gray-600 mb-1">משמרות</p>
                <p className="text-xl font-bold text-blue-600">{summary.shiftsCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Trend Chart */}
        <div className="mb-4">
          <MonthlyChart shifts={shifts} settings={settings} />
        </div>

        {/* View Report Button */}
        <button
          onClick={() => navigate('/report')}
          className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
        >
          <FileText size={20} />
          <span>צפייה בדוח מפורט</span>
        </button>
      </div>
    </div>
  );
}

import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { calculateMonthlySummary } from '../utils/salaryCalculations';
import { formatDuration, getMonthName } from '../utils/dateHelpers';
import { exportSummaryToCSV } from '../utils/exportHelpers';
import { ArrowRight, ChevronLeft, ChevronRight, Download } from 'lucide-react';

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

  const incomeItems = [
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

  const deductionItems = [
    {
      label: 'ביטוח לאומי',
      value: summary.socialSecurityDeduction,
      show: settings.calculateDeductions && summary.socialSecurityDeduction > 0,
    },
    {
      label: 'מס הכנסה',
      value: summary.incomeTaxDeduction,
      show: settings.calculateDeductions && summary.incomeTaxDeduction > 0,
    },
    {
      label: 'פנסיה',
      value: summary.pensionDeduction,
      show: settings.calculateDeductions && summary.pensionDeduction > 0,
    },
    {
      label: 'קרן השתלמות',
      value: summary.trainingFundDeduction,
      show: settings.calculateDeductions && summary.trainingFundDeduction > 0,
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

      {/* Income Breakdown */}
      <Card className="mb-4">
        <h2 className="text-lg font-semibold mb-4">הכנסות</h2>
        <div className="space-y-3">
          {incomeItems.filter(item => item.show).map((item, index) => (
            <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
              <span className="text-gray-700">{item.label}</span>
              <span className="font-semibold text-green-600">
                +₪{item.value.toFixed(2)}
              </span>
            </div>
          ))}

          {incomeItems.filter(item => item.show).length === 0 && (
            <p className="text-gray-500 text-center py-4">אין נתונים להצגה</p>
          )}
        </div>
      </Card>

      {/* Gross Total */}
      <Card className="bg-blue-50 border-2 border-blue-200 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold text-gray-800">סה"כ ברוטו</span>
          <span className="text-2xl font-bold text-blue-600">₪{summary.grossTotal.toFixed(2)}</span>
        </div>
      </Card>

      {/* Deductions */}
      {settings.calculateDeductions && (
        <>
          <Card className="mb-4">
            <h2 className="text-lg font-semibold mb-4">ניכויים</h2>
            <div className="space-y-3">
              {deductionItems.filter(item => item.show).map((item, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                  <span className="text-gray-700">{item.label}</span>
                  <span className="font-semibold text-red-600">
                    -₪{item.value.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {deductionItems.filter(item => item.show).length > 0 && (
              <div className="mt-4 pt-3 border-t-2 border-gray-300 flex justify-between items-center">
                <span className="font-bold text-gray-800">סה"כ ניכויים</span>
                <span className="text-lg font-bold text-red-600">-₪{summary.totalDeductions.toFixed(2)}</span>
              </div>
            )}
          </Card>

          {/* Net Pay */}
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="text-center">
              <p className="text-sm opacity-90 mb-1">נטו לתשלום</p>
              <p className="text-4xl font-bold">₪{summary.netPay.toFixed(2)}</p>
              <p className="text-xs opacity-75 mt-2">סכום לאחר ניכויים</p>
            </div>
          </Card>
        </>
      )}

      {/* Gross Total (if no deductions) */}
      {!settings.calculateDeductions && (
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="text-center">
            <p className="text-sm opacity-90 mb-1">סה"כ ברוטו משוער</p>
            <p className="text-4xl font-bold">₪{summary.grossTotal.toFixed(2)}</p>
            <p className="text-xs opacity-75 mt-2">לפני ניכויים</p>
          </div>
        </Card>
      )}

      {/* Export Button */}
      <button
        onClick={() => exportSummaryToCSV(summary, getMonthName(currentMonth.month), currentMonth.year, settings)}
        className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors flex items-center justify-center gap-2 mb-4"
      >
        <Download size={20} />
        <span>ייצא דוח לגוגל שיטס (CSV)</span>
      </button>

      {/* Info */}
      <div className="mt-6 text-center text-sm text-gray-500">
        <p>* החישוב הוא משוער ומבוסס על ההגדרות שהוזנו</p>
        <p>לחישוב מדויק, יש להתייעץ עם מחלקת שכר</p>
      </div>
    </div>
  );
}

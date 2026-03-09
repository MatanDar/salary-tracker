import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Shift } from '../types';
import { formatDuration, calculateDuration, getDayName, getMonthName, getMonthRange, isDateInRange } from '../utils/dateHelpers';
import { exportToCSV } from '../utils/exportHelpers';
import { emailMonthlyCSV } from '../utils/emailExport';
import { generatePayslipPDF } from '../utils/pdfExport';
import { calculateMonthlySummary } from '../utils/salaryCalculations';
import { Plus, Trash2, ChevronLeft, ChevronRight, X, Download, Mail, Copy as Duplicate, FileText, Clock } from 'lucide-react';

export function ShiftLog() {
  const { shifts, addShift, deleteShift, updateShift, settings, currentMonth, setCurrentMonth, activeShift, clearActiveShift } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [liveElapsed, setLiveElapsed] = useState('');
  const [formData, setFormData] = useState<{
    date: string;
    startTime: string;
    endTime: string;
    isHoliday: boolean;
    notes: string;
    shiftType?: 'regular' | 'vacation' | 'sick';
  }>({
    date: new Date().toISOString().split('T')[0],
    startTime: '07:00',
    endTime: '16:00',
    isHoliday: false,
    notes: '',
    shiftType: 'regular',
  });

  // Live timer for active shift
  useEffect(() => {
    if (!activeShift) {
      setLiveElapsed('');
      return;
    }
    const update = () => {
      const start = new Date(activeShift.startTime);
      const now = new Date();
      const diffMs = now.getTime() - start.getTime();
      const hours = Math.floor(diffMs / 3600000);
      const mins = Math.floor((diffMs % 3600000) / 60000);
      setLiveElapsed(`${hours}:${mins.toString().padStart(2, '0')}`);
    };
    update();
    const interval = setInterval(update, 30000); // update every 30 seconds
    return () => clearInterval(interval);
  }, [activeShift]);

  const { start, end } = getMonthRange(currentMonth.year, currentMonth.month, settings.monthStartDay);
  const monthShifts = shifts
    .filter(shift => isDateInRange(shift.date, start, end))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const completedRegularShifts = monthShifts.filter(
    s => !s.inProgress && s.shiftType !== 'vacation' && s.shiftType !== 'sick'
  );

  const totalHours = completedRegularShifts.reduce(
    (sum, shift) => sum + calculateDuration(shift.date, shift.startTime, shift.endTime),
    0
  );

  // Hours balance: actual hours vs required target hours per shift (from settings, default 9)
  const REQUIRED_HOURS_PER_SHIFT = settings.dailyHoursTarget ?? 9;
  const totalRequiredHours = completedRegularShifts.length * REQUIRED_HOURS_PER_SHIFT;
  const hoursBalance = totalHours - totalRequiredHours; // positive = surplus, negative = deficit

  const summary = calculateMonthlySummary(
    shifts,
    settings,
    currentMonth.year,
    currentMonth.month
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const hasValidEndTime = formData.endTime && formData.endTime !== '--:--';
    const isClosingActiveShift = editingShift?.inProgress === true && hasValidEndTime;

    const submitData = {
      ...formData,
      endTime: formData.endTime || (editingShift?.inProgress ? '--:--' : '16:00'),
      // If user provided a valid end time for an active shift, close it
      inProgress: isClosingActiveShift ? false : (editingShift?.inProgress ?? false),
    };

    if (editingShift) {
      updateShift(editingShift.id, submitData);
      // If we just closed an active shift, clear the active shift state
      if (isClosingActiveShift) {
        clearActiveShift();
      }
      setEditingShift(null);
    } else {
      const newShift: Shift = {
        id: crypto.randomUUID(),
        ...submitData,
      };
      addShift(newShift);
    }
    setShowAddModal(false);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      startTime: '07:00',
      endTime: '16:00',
      isHoliday: false,
      notes: '',
      shiftType: 'regular',
    });
  };

  const handleEdit = (shift: Shift) => {
    setEditingShift(shift);
    setFormData({
      date: shift.date,
      startTime: shift.startTime,
      endTime: shift.endTime,
      isHoliday: shift.isHoliday,
      notes: shift.notes || '',
      shiftType: shift.shiftType || 'regular',
    });
    setShowAddModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('האם אתה בטוח שברצונך למחוק משמרת זו?')) {
      deleteShift(id);
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

  const handleTemplateSelect = (templateId: string) => {
    const template = settings.shiftTemplates.find(t => t.id === templateId);
    if (template) {
      setFormData({
        ...formData,
        startTime: template.startTime,
        endTime: template.endTime,
      });
    }
  };

  const handleDuplicate = (shift: Shift) => {
    const newShift: Shift = {
      id: crypto.randomUUID(),
      date: new Date().toISOString().split('T')[0],
      startTime: shift.startTime,
      endTime: shift.endTime,
      isHoliday: shift.isHoliday,
      notes: shift.notes || '',
      shiftType: shift.shiftType,
    };
    addShift(newShift);
  };

  const getShiftColor = (startTime: string) => {
    const hour = parseInt(startTime.split(':')[0]);
    if (hour >= 6 && hour < 14) return '#3b82f6'; // blue - morning
    if (hour >= 14 && hour < 22) return '#f59e0b'; // amber - evening
    return '#8b5cf6'; // purple - night
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header with Month Navigator */}
      <div className="bg-blue-500 text-white px-4 py-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <button onClick={handlePrevMonth} className="p-1 hover:bg-blue-600 rounded">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-xl font-bold">
            {getMonthName(currentMonth.month)} {currentMonth.year}
          </h1>
          <button onClick={handleNextMonth} className="p-1 hover:bg-blue-600 rounded">
            <ChevronRight size={24} />
          </button>
        </div>
        <div className="text-center text-sm">
          <span>סה"כ: {formatDuration(totalHours)}</span>
        </div>
      </div>

      {/* Table */}
      <div className="px-4 pt-4">
        <div className="notebook-table border border-amber-300 rounded-lg overflow-hidden shadow-md">
          {/* Table Header */}
          <div className="grid grid-cols-5 notebook-header border-b-2 border-amber-400">
            <div className="px-3 py-3 text-sm font-semibold text-amber-900 border-l border-amber-300 flex items-center">יום</div>
            <div className="px-3 py-3 text-sm font-semibold text-amber-900 border-l border-amber-300 flex items-center">התחלה</div>
            <div className="px-3 py-3 text-sm font-semibold text-amber-900 border-l border-amber-300 flex items-center">סיום</div>
            <div className="px-3 py-3 text-sm font-semibold text-amber-900 border-l border-amber-300 flex items-center">שעות</div>
            <div className="px-3 py-3 text-sm font-semibold text-amber-900 flex items-center">הערות</div>
          </div>

          {/* Table Body */}
          {monthShifts.length === 0 ? (
            <div className="text-center py-8 text-amber-700 notebook-empty">
              לא נרשמו משמרות החודש
            </div>
          ) : (
            monthShifts.map(shift => {
              const isActive = shift.inProgress === true;
              const isVacation = shift.shiftType === 'vacation';
              const isSick = shift.shiftType === 'sick';
              const duration = isActive ? 0 : calculateDuration(shift.date, shift.startTime, shift.endTime);
              const date = new Date(shift.date);
              const dayName = getDayName(shift.date);

              // Determine row color based on shift type
              let borderColor = getShiftColor(shift.startTime);
              if (isActive) borderColor = '#48bb78'; // green for active
              if (isVacation) borderColor = '#f59e0b'; // amber for vacation
              if (isSick) borderColor = '#ef4444'; // red for sick

              return (
                <div
                  key={shift.id}
                  className={`grid grid-cols-5 notebook-row cursor-pointer relative ${isActive ? 'active-shift-row' : ''}`}
                  style={{ borderRightWidth: '4px', borderRightColor: borderColor }}
                  onClick={() => handleEdit(shift)}
                >
                  {/* Col 1: date on line 1, day-name on line 2 — always fits */}
                  <div className="px-2 border-l border-amber-200 text-amber-900 flex flex-col justify-center overflow-hidden h-full">
                    <span className="text-xs font-semibold leading-tight whitespace-nowrap">
                      {date.getDate()}/{date.getMonth() + 1}
                      {shift.isHoliday && <span className="text-purple-600"> ⭐</span>}
                    </span>
                    <span className="text-xs text-amber-700 leading-tight">{dayName}</span>
                  </div>
                  {/* vacation/sick: span cols 2+3+4 so text never wraps */}
                  {(isVacation || isSick) ? (
                    <div className="col-span-3 px-3 py-2 text-sm font-semibold border-l border-amber-200 flex items-center">
                      {isVacation
                        ? <span className="text-amber-600 whitespace-nowrap">🏖️ יום חופשה</span>
                        : <span className="text-red-600 whitespace-nowrap">🤒 יום מחלה</span>
                      }
                    </div>
                  ) : (
                    <>
                      <div className="px-3 py-2 text-sm border-l border-amber-200 text-amber-900 flex items-center">
                        {shift.startTime}
                      </div>
                      <div className="px-3 py-2 text-sm border-l border-amber-200 text-amber-900 flex items-center">
                        {isActive ? (
                          <span className="active-shift-indicator text-green-600 font-medium flex items-center gap-1">
                            <Clock size={14} />
                            פעיל
                          </span>
                        ) : shift.endTime}
                      </div>
                      <div className="px-3 py-2 text-sm font-semibold border-l border-amber-200 text-amber-900 flex items-center">
                        {isActive
                          ? <span className="active-shift-indicator text-green-600">{liveElapsed || '0:00'}</span>
                          : formatDuration(duration)
                        }
                      </div>
                    </>
                  )}
                  <div className="px-3 py-2 text-sm flex items-center justify-between gap-2">
                    <span className="text-amber-700 truncate flex-1">{shift.notes || '-'}</span>
                    <div className="flex gap-1 flex-shrink-0">
                      {!isActive && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDuplicate(shift);
                            }}
                            className="text-blue-500 hover:text-blue-700 p-1"
                            title="שכפל משמרת"
                          >
                            <Duplicate size={16} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(shift.id);
                            }}
                            className="text-red-500 hover:text-red-700 p-1"
                            title="מחק משמרת"
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Total at bottom */}
        <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-gray-700">סה"כ שעות החודש:</span>
            <span className="text-lg font-bold text-blue-600">{formatDuration(totalHours)}</span>
          </div>
          {completedRegularShifts.length > 0 && (
            <div className="flex justify-between items-center border-t border-blue-200 pt-2">
              <span className="text-sm text-gray-600">
                מאזן שעות ({completedRegularShifts.length} משמרות × {REQUIRED_HOURS_PER_SHIFT}ש׳):
              </span>
              <span className={`text-sm font-bold ${hoursBalance >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                {hoursBalance >= 0 ? '+' : ''}{formatDuration(Math.abs(hoursBalance))}
                {hoursBalance >= 0 ? ' ✅' : ' ⚠️'}
              </span>
            </div>
          )}
        </div>

        {/* Monthly Summary */}
        {monthShifts.length > 0 && (
          <div className="mt-4 bg-white border border-gray-300 rounded-lg overflow-hidden">
            <div className="bg-gray-100 px-4 py-3 border-b border-gray-300">
              <h3 className="font-bold text-gray-800">פירוט חודשי</h3>
            </div>
            <div className="p-4 space-y-3">
              {/* Income Section */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-700">הכנסות:</h4>
                <div className="space-y-1 text-sm">
                  {settings.salaryType === 'monthly' ? (
                    <div className="flex justify-between">
                      <span className="text-gray-600">שכר חודשי:</span>
                      <span className="font-medium">₪{settings.monthlySalary.toFixed(2)}</span>
                    </div>
                  ) : (
                    <div className="flex justify-between">
                      <span className="text-gray-600">שעות רגילות:</span>
                      <span className="font-medium">₪{summary.regularPay.toFixed(2)}</span>
                    </div>
                  )}
                  {summary.overtime125Pay > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        {settings.overtime.mode === 'manual' ? 'שעות נוספות:' : 'שעות נוספות 125%:'}
                      </span>
                      <span className="font-medium">₪{summary.overtime125Pay.toFixed(2)}</span>
                    </div>
                  )}
                  {summary.overtime150Pay > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">שעות נוספות 150%:</span>
                      <span className="font-medium">₪{summary.overtime150Pay.toFixed(2)}</span>
                    </div>
                  )}
                  {summary.shabbatHolidayPay > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">שבת/חגים:</span>
                      <span className="font-medium">₪{summary.shabbatHolidayPay.toFixed(2)}</span>
                    </div>
                  )}
                  {summary.travelPay > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">דמי נסיעות:</span>
                      <span className="font-medium">₪{summary.travelPay.toFixed(2)}</span>
                    </div>
                  )}
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <span className="font-semibold text-gray-800">סה"כ ברוטו:</span>
                  <span className="font-bold text-blue-600">₪{summary.grossTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Days Off Section */}
              {(summary.vacationDaysUsed > 0 || summary.sickDaysUsed > 0 || (settings.vacationDaysBalance ?? 0) > 0 || (settings.sickDaysBalance ?? 0) > 0) && (
                <div className="space-y-2 pt-3 border-t border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-700">ימי חופש ומחלה:</h4>
                  <div className="space-y-1 text-sm">
                    {((settings.vacationDaysBalance ?? 0) > 0 || summary.vacationDaysUsed > 0) && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">חופשה:</span>
                        <span className="font-medium">
                          {summary.vacationDaysUsed > 0 && (
                            <span className="text-orange-600">-{summary.vacationDaysUsed} | </span>
                          )}
                          <span className="text-blue-600">
                            נותרו: {((settings.vacationDaysBalance ?? 0) - summary.vacationDaysUsed).toFixed(2)} ימים
                          </span>
                        </span>
                      </div>
                    )}
                    {((settings.sickDaysBalance ?? 0) > 0 || summary.sickDaysUsed > 0) && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">מחלה:</span>
                        <span className="font-medium">
                          {summary.sickDaysUsed > 0 && (
                            <span className="text-orange-600">-{summary.sickDaysUsed} | </span>
                          )}
                          <span className="text-blue-600">
                            נותרו: {((settings.sickDaysBalance ?? 0) - summary.sickDaysUsed).toFixed(2)} ימים
                          </span>
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Deductions Section */}
              {settings.calculateDeductions && (
                <>
                  <div className="space-y-2 pt-3 border-t border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-700">ניכויים:</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">ביטוח לאומי:</span>
                        <span className="font-medium text-red-600">-₪{summary.socialSecurityDeduction.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">מס הכנסה:</span>
                        <span className="font-medium text-red-600">-₪{summary.incomeTaxDeduction.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">פנסיה:</span>
                        <span className="font-medium text-red-600">-₪{summary.pensionDeduction.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">קרן השתלמות:</span>
                        <span className="font-medium text-red-600">-₪{summary.trainingFundDeduction.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-200">
                      <span className="font-semibold text-gray-800">סה"כ ניכויים:</span>
                      <span className="font-bold text-red-600">-₪{summary.totalDeductions.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Net Pay */}
                  <div className="pt-3 border-t-2 border-gray-300">
                    <div className="flex justify-between items-center bg-green-50 px-3 py-2 rounded-lg">
                      <span className="text-lg font-bold text-gray-800">נטו לתשלום:</span>
                      <span className="text-2xl font-bold text-green-600">₪{summary.netPay.toFixed(2)}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Export buttons */}
        <div className="mt-4 space-y-2">
          <p className="text-sm font-semibold text-gray-700 mb-2">ייצוא:</p>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => exportToCSV(monthShifts, getMonthName(currentMonth.month), currentMonth.year)}
              disabled={monthShifts.length === 0}
              className={`flex items-center justify-center gap-2 py-2 px-4 rounded-lg transition-colors text-sm ${
                monthShifts.length === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-500 text-white hover:bg-green-600'
              }`}
            >
              <Download size={16} />
              <span>הורד CSV</span>
            </button>
            <button
              onClick={async () => {
                try {
                  await emailMonthlyCSV(monthShifts, getMonthName(currentMonth.month), currentMonth.year);
                } catch (err) {
                  alert('שגיאה בשליחה');
                }
              }}
              disabled={monthShifts.length === 0}
              className={`flex items-center justify-center gap-2 py-2 px-4 rounded-lg transition-colors text-sm ${
                monthShifts.length === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              <Mail size={16} />
              <span>שלח במייל</span>
            </button>
            <button
              onClick={() => generatePayslipPDF(summary, settings, currentMonth.month, currentMonth.year)}
              disabled={monthShifts.length === 0}
              className={`flex items-center justify-center gap-2 py-2 px-4 rounded-lg transition-colors text-sm ${
                monthShifts.length === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-red-500 text-white hover:bg-red-600'
              }`}
            >
              <FileText size={16} />
              <span>תלוש PDF</span>
            </button>
          </div>
          {monthShifts.length > 0 ? (
            <p className="text-xs text-gray-500 mt-2">
              💡 טיפ: "שלח במייל" פותח את אפליקציית המייל שלך עם הקובץ מצורף (בנייד) או מוריד את הקובץ ופותח מייל (במחשב)
            </p>
          ) : (
            <p className="text-xs text-gray-500 mt-2">
              הוסף משמרות כדי להפעיל את הייצוא
            </p>
          )}
        </div>
      </div>

      {/* Add Button */}
      <button
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-20 left-1/2 transform -translate-x-1/2 w-14 h-14 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 active:scale-95 transition-all flex items-center justify-center"
      >
        <Plus size={28} />
      </button>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {editingShift ? 'עריכת משמרת' : 'הוספת משמרת'}
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingShift(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="date"
                label="תאריך"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />

              {/* Shift Type Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">סוג משמרת:</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={formData.shiftType === 'regular'}
                      onChange={() => setFormData({ ...formData, shiftType: 'regular' })}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700">משמרת רגילה</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={formData.shiftType === 'vacation'}
                      onChange={() => setFormData({ ...formData, shiftType: 'vacation' })}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700">יום חופשה 🏖️</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={formData.shiftType === 'sick'}
                      onChange={() => setFormData({ ...formData, shiftType: 'sick' })}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700">יום מחלה 🤒</span>
                  </label>
                </div>
              </div>

              {/* Quick Templates - only for regular shifts */}
              {!editingShift && formData.shiftType === 'regular' && settings.shiftTemplates && settings.shiftTemplates.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">תבניות מהירות:</label>
                  <div className="grid grid-cols-3 gap-2">
                    {settings.shiftTemplates.map(template => (
                      <button
                        key={template.id}
                        type="button"
                        onClick={() => handleTemplateSelect(template.id)}
                        className="px-3 py-2 text-sm font-medium rounded-lg border-2 transition-all hover:scale-105"
                        style={{
                          borderColor: template.color,
                          color: template.color,
                          backgroundColor: `${template.color}10`
                        }}
                      >
                        {template.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Time fields - only for regular shifts */}
              {formData.shiftType === 'regular' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    type="time"
                    label="שעת התחלה"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    required
                  />
                  <Input
                    type="time"
                    label="שעת סיום"
                    value={formData.endTime === '--:--' ? '' : formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    required={!editingShift?.inProgress}
                  />
                </div>
                {editingShift?.inProgress && (
                  <p className="text-xs text-green-600">
                    💡 משמרת פעילה - שעת הסיום אופציונלית
                  </p>
                )}
              </>
              )}

              {/* Holiday checkbox - only for regular shifts */}
              {formData.shiftType === 'regular' && (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isHoliday"
                    checked={formData.isHoliday}
                    onChange={(e) => setFormData({ ...formData, isHoliday: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <label htmlFor="isHoliday" className="text-sm text-gray-700">
                    סמן כחג (תוספת 150%)
                  </label>
                </div>
              )}

              <Input
                type="text"
                label="הערות (אופציונלי)"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="הערות נוספות..."
              />

              <div className="flex gap-3">
                <Button type="submit" className="flex-1">
                  {editingShift ? 'עדכן' : 'הוסף'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingShift(null);
                  }}
                >
                  ביטול
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}

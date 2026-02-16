import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Shift } from '../types';
import { formatDuration, calculateDuration, getDayName, getMonthName, getMonthRange, isDateInRange } from '../utils/dateHelpers';
import { exportToCSV, copyToClipboard } from '../utils/exportHelpers';
import { Plus, Trash2, ChevronLeft, ChevronRight, X, Download, Copy } from 'lucide-react';

export function ShiftLog() {
  const { shifts, addShift, deleteShift, updateShift, settings, currentMonth, setCurrentMonth } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '17:00',
    isHoliday: false,
    notes: '',
  });

  const { start, end } = getMonthRange(currentMonth.year, currentMonth.month, settings.monthStartDay);
  const monthShifts = shifts
    .filter(shift => isDateInRange(shift.date, start, end))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalHours = monthShifts.reduce(
    (sum, shift) => sum + calculateDuration(shift.date, shift.startTime, shift.endTime),
    0
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingShift) {
      updateShift(editingShift.id, formData);
      setEditingShift(null);
    } else {
      const newShift: Shift = {
        id: crypto.randomUUID(),
        ...formData,
      };
      addShift(newShift);
    }
    setShowAddModal(false);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '17:00',
      isHoliday: false,
      notes: '',
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
        <div className="bg-white border border-gray-300 rounded-lg overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-4 bg-gray-100 border-b border-gray-300">
            <div className="px-3 py-2 text-sm font-semibold text-gray-700 border-l border-gray-300">יום</div>
            <div className="px-3 py-2 text-sm font-semibold text-gray-700 border-l border-gray-300">התחלה</div>
            <div className="px-3 py-2 text-sm font-semibold text-gray-700 border-l border-gray-300">סיום</div>
            <div className="px-3 py-2 text-sm font-semibold text-gray-700">שעות</div>
          </div>

          {/* Table Body */}
          {monthShifts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              לא נרשמו משמרות החודש
            </div>
          ) : (
            monthShifts.map(shift => {
              const duration = calculateDuration(shift.date, shift.startTime, shift.endTime);
              const date = new Date(shift.date);
              const dayName = getDayName(shift.date);

              return (
                <div
                  key={shift.id}
                  className="grid grid-cols-4 border-b border-gray-200 hover:bg-gray-50 cursor-pointer relative"
                  onClick={() => handleEdit(shift)}
                >
                  <div className="px-3 py-3 text-sm border-l border-gray-200">
                    {date.getDate()}/{date.getMonth() + 1} {dayName}
                    {shift.isHoliday && (
                      <span className="mr-1 text-xs text-purple-600">⭐</span>
                    )}
                  </div>
                  <div className="px-3 py-3 text-sm border-l border-gray-200">{shift.startTime}</div>
                  <div className="px-3 py-3 text-sm border-l border-gray-200">{shift.endTime}</div>
                  <div className="px-3 py-3 text-sm font-semibold flex items-center justify-between">
                    <span>{formatDuration(duration)}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(shift.id);
                      }}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Total at bottom */}
        <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-gray-700">סה"כ שעות החודש:</span>
            <span className="text-lg font-bold text-blue-600">{formatDuration(totalHours)}</span>
          </div>
        </div>

        {/* Export buttons */}
        <div className="mt-4 space-y-2">
          <p className="text-sm font-semibold text-gray-700 mb-2">ייצוא לגוגל שיטס:</p>
          <div className="grid grid-cols-2 gap-2">
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
                  await copyToClipboard(monthShifts);
                  alert('הועתק ללוח! עכשיו פתח גוגל שיטס והדבק (Ctrl+V)');
                } catch (err) {
                  alert('שגיאה בהעתקה');
                }
              }}
              disabled={monthShifts.length === 0}
              className={`flex items-center justify-center gap-2 py-2 px-4 rounded-lg transition-colors text-sm ${
                monthShifts.length === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              <Copy size={16} />
              <span>העתק ללוח</span>
            </button>
          </div>
          {monthShifts.length > 0 ? (
            <p className="text-xs text-gray-500 mt-2">
              💡 טיפ: לחץ "העתק ללוח", פתח גוגל שיטס, והדבק!
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
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  required
                />
              </div>

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

import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Shift } from '../types';
import { formatDuration, calculateDuration, getDayName, getMonthName, getMonthRange, isDateInRange } from '../utils/dateHelpers';
import { Plus, Trash2, ChevronLeft, ChevronRight, X } from 'lucide-react';

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
    <div className="min-h-screen bg-gray-50 pb-20 px-4 pt-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">יומן משמרות</h1>
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

      {/* Total Hours */}
      <Card className="mb-4">
        <div className="text-center">
          <p className="text-sm text-gray-600">סה"כ שעות החודש</p>
          <p className="text-2xl font-bold text-blue-600">{formatDuration(totalHours)}</p>
        </div>
      </Card>

      {/* Shifts List */}
      <div className="space-y-3 mb-4">
        {monthShifts.length === 0 ? (
          <Card className="text-center py-8">
            <p className="text-gray-500">לא נרשמו משמרות החודש</p>
          </Card>
        ) : (
          monthShifts.map(shift => {
            const duration = calculateDuration(shift.date, shift.startTime, shift.endTime);
            const date = new Date(shift.date);
            const dayName = getDayName(shift.date);

            return (
              <Card key={shift.id} className="relative">
                <div
                  className="cursor-pointer"
                  onClick={() => handleEdit(shift)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-gray-800">
                        {date.getDate()}/{date.getMonth() + 1} - {dayName}
                      </p>
                      <p className="text-sm text-gray-600">
                        {shift.startTime} - {shift.endTime}
                      </p>
                    </div>
                    <div className="text-left">
                      <p className="text-lg font-bold text-blue-600">
                        {formatDuration(duration)}
                      </p>
                      {shift.isHoliday && (
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                          חג
                        </span>
                      )}
                    </div>
                  </div>
                  {shift.notes && (
                    <p className="text-sm text-gray-500 mt-1">{shift.notes}</p>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(shift.id);
                  }}
                  className="absolute bottom-3 left-3 text-red-500 hover:text-red-700"
                >
                  <Trash2 size={18} />
                </button>
              </Card>
            );
          })
        )}
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

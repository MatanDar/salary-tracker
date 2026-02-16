import { useApp } from '../context/AppContext';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Toggle } from '../components/Toggle';

export function Settings() {
  const { settings, updateSettings } = useApp();

  return (
    <div className="min-h-screen bg-gray-50 pb-20 px-4 pt-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">הגדרות</h1>
      </div>

      {/* Hourly Rate */}
      <Card className="mb-4">
        <h2 className="text-lg font-semibold mb-3">שכר שעתי</h2>
        <Input
          type="number"
          step="0.01"
          value={settings.hourlyRate}
          onChange={(e) =>
            updateSettings({ hourlyRate: parseFloat(e.target.value) || 0 })
          }
          placeholder="40"
        />
        <p className="text-sm text-gray-500 mt-2">
          שכר לשעה רגילה (₪)
        </p>
      </Card>

      {/* Travel Pay */}
      <Card className="mb-4">
        <h2 className="text-lg font-semibold mb-3">דמי נסיעות</h2>
        <div className="space-y-4">
          <Toggle
            checked={settings.travelPay.enabled}
            onChange={(enabled) =>
              updateSettings({
                travelPay: { ...settings.travelPay, enabled },
              })
            }
            label="הפעל דמי נסיעות"
          />

          {settings.travelPay.enabled && (
            <>
              <Input
                type="number"
                step="0.01"
                label="סכום"
                value={settings.travelPay.amount}
                onChange={(e) =>
                  updateSettings({
                    travelPay: {
                      ...settings.travelPay,
                      amount: parseFloat(e.target.value) || 0,
                    },
                  })
                }
              />

              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">סוג תשלום</p>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={settings.travelPay.type === 'perDay'}
                    onChange={() =>
                      updateSettings({
                        travelPay: { ...settings.travelPay, type: 'perDay' },
                      })
                    }
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm text-gray-700">לכל יום עבודה</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={settings.travelPay.type === 'monthly'}
                    onChange={() =>
                      updateSettings({
                        travelPay: { ...settings.travelPay, type: 'monthly' },
                      })
                    }
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm text-gray-700">קבוע חודשי</span>
                </label>
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Overtime */}
      <Card className="mb-4">
        <h2 className="text-lg font-semibold mb-3">שעות נוספות</h2>
        <Toggle
          checked={settings.overtime.enabled}
          onChange={(enabled) =>
            updateSettings({ overtime: { enabled } })
          }
          label="חישוב אוטומטי לפי חוק"
        />
        {settings.overtime.enabled && (
          <div className="mt-3 text-sm text-gray-600 space-y-1">
            <p>• 8 שעות ראשונות: 100% (רגיל)</p>
            <p>• שעות 8-10: 125%</p>
            <p>• מעל 10 שעות: 150%</p>
          </div>
        )}
      </Card>

      {/* Shabbat Premium */}
      <Card className="mb-4">
        <h2 className="text-lg font-semibold mb-3">תוספת שבת/חג</h2>
        <Toggle
          checked={settings.shabbatPremium.enabled}
          onChange={(enabled) =>
            updateSettings({ shabbatPremium: { enabled } })
          }
          label="תוספת 150% לשבת"
        />
        <p className="text-sm text-gray-500 mt-2">
          משמרות בשבת יזוהו אוטומטית. ניתן לסמן ידנית משמרת כחג.
        </p>
      </Card>

      {/* Month Start Day */}
      <Card className="mb-4">
        <h2 className="text-lg font-semibold mb-3">יום תחילת חודש</h2>
        <Input
          type="number"
          min="1"
          max="28"
          value={settings.monthStartDay}
          onChange={(e) =>
            updateSettings({ monthStartDay: parseInt(e.target.value) || 1 })
          }
        />
        <p className="text-sm text-gray-500 mt-2">
          אם תקופת השכר שלך לא מתחילה ב-1 לחודש, הזן כאן את היום הרלוונטי
        </p>
      </Card>

      {/* Dark Mode */}
      <Card className="mb-4">
        <h2 className="text-lg font-semibold mb-3">מצב כהה</h2>
        <Toggle
          checked={settings.darkMode}
          onChange={(darkMode) => updateSettings({ darkMode })}
          label="הפעל מצב כהה"
        />
        <p className="text-sm text-gray-500 mt-2">
          בקרוב...
        </p>
      </Card>
    </div>
  );
}

import { Shift, Settings } from '../types';
import { calculateMonthlySummary } from '../utils/salaryCalculations';
import { getMonthName, formatDuration } from '../utils/dateHelpers';

interface MonthlyChartProps {
  shifts: Shift[];
  settings: Settings;
}

export function MonthlyChart({ shifts, settings }: MonthlyChartProps) {
  // Get last 6 months of data
  const now = new Date();
  const monthsData = [];

  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = date.getFullYear();
    const month = date.getMonth();

    const summary = calculateMonthlySummary(shifts, settings, year, month);

    monthsData.push({
      year,
      month,
      name: getMonthName(month),
      hours: summary.totalHours,
      shifts: summary.shiftsCount,
    });
  }

  const maxHours = Math.max(...monthsData.map(m => m.hours), 160);

  return (
    <div className="bg-white border border-gray-300 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">מגמת שעות - 6 חודשים אחרונים</h3>

      <div className="space-y-3">
        {monthsData.map((data, index) => (
          <div key={index} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-gray-700">{data.name}</span>
              <span className="text-gray-600">
                {formatDuration(data.hours)} ({data.shifts} משמרות)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${(data.hours / maxHours) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Average */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex justify-between text-sm">
          <span className="font-semibold text-gray-800">ממוצע חודשי:</span>
          <span className="font-bold text-blue-600">
            {formatDuration(monthsData.reduce((sum, m) => sum + m.hours, 0) / monthsData.length)}
          </span>
        </div>
      </div>
    </div>
  );
}

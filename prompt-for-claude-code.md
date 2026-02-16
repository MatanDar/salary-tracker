# פרומפט מקצועי לבניית אפליקציית מעקב שעות ושכר

להעתקה ישירה לקלוד קוד:

---

## The Prompt

Build me a complete **Work Hours & Salary Tracker** web app — a clean, ad-free alternative to the Israeli "השכר שלי" (My Salary) app.

### Tech Stack
- **React** (single-page app with React Router)
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **localStorage** for data persistence (no backend)
- **Vite** as the build tool
- All text in **Hebrew**, full **RTL** layout

---

### Pages & Features

#### 1. Main Dashboard (דף ראשי)
- Large **"כניסה למשמרת" / "יציאה ממשמרת"** toggle button (changes color and label based on state)
- **Live timer** showing current shift duration (HH:MM:SS) when clocked in
- **Monthly summary cards**: Total hours worked, estimated gross salary, number of shifts
- Month navigation (arrows to go back/forward between months, like a calendar header)

#### 2. Shift Log (יומן משמרות)
- Table/list of all shifts for the selected month
- Columns: **תאריך** (Date + day name), **התחלה** (Start time), **סיום** (End time), **סה"כ שעות** (Total hours)
- Each shift row is **swipeable to delete** (or has a delete icon)
- **"+" button** to manually add a past shift (date picker + time pickers for start/end)
- Ability to **edit** an existing shift by tapping on it
- Monthly total hours displayed at the bottom
- Handle shifts that **cross midnight** correctly (e.g., 22:00–06:00 = 8 hours)

#### 3. Settings Page (הגדרות)
- **שכר שעתי** (Hourly rate) — number input
- **דמי נסיעות** (Travel/commute pay):
  - Toggle on/off
  - Amount per day
  - Option: per work day or fixed monthly amount
- **חישוב שעות נוספות** (Overtime calculation) toggle:
  - When enabled, calculate based on Israeli labor law:
    - First **8 hours** = 100% (regular rate)
    - Hours **8–10** = 125%
    - Hours **10+** = 150%
  - Show overtime breakdown in shift details
- **תוספת שבת/חג** (Shabbat/Holiday premium) toggle:
  - When enabled, shifts on Saturday (auto-detected) get **150%** rate
  - Manual option to mark a shift as "holiday"
- **יום תחילת חודש** (Month start day) — for people whose pay period doesn't start on the 1st (e.g., starts on the 10th)
- **Dark/Light mode** toggle

#### 4. Monthly Report (דוח חודשי)
- Detailed breakdown for the selected month:
  - Regular hours × rate
  - Overtime hours (125%) × amount
  - Overtime hours (150%) × amount
  - Shabbat/Holiday hours × amount
  - Travel pay total
  - **Estimated gross total** (סה"כ ברוטו משוער)

---

### UI/UX Requirements
- **Mobile-first** design — large touch targets, one-hand friendly
- Clean, modern look with rounded cards and soft shadows
- Smooth transitions and animations (page transitions, button state changes)
- **Bottom navigation bar** with 3 tabs: Dashboard, Shift Log, Settings
- Use a professional color palette (blues/teals for the main theme)
- The clock-in button should be **prominent and satisfying** to tap — large, centered, with visual feedback
- Empty states with helpful messages (e.g., "לא נרשמו משמרות החודש")
- **Responsive** — works great on mobile but also decent on desktop

### Data Model (localStorage)
```json
{
  "settings": {
    "hourlyRate": 40,
    "travelPay": { "enabled": true, "amount": 22, "type": "perDay" },
    "overtime": { "enabled": true },
    "shabbatPremium": { "enabled": false },
    "monthStartDay": 1,
    "darkMode": false
  },
  "shifts": [
    {
      "id": "uuid",
      "date": "2026-02-15",
      "startTime": "08:00",
      "endTime": "16:30",
      "isHoliday": false,
      "notes": ""
    }
  ],
  "activeShift": {
    "startTime": "2026-02-16T08:00:00Z"
  } | null
}
```

### Important Logic
1. **Midnight crossing**: If `endTime < startTime`, the shift spans two days. Calculate duration correctly.
2. **Overtime calculation**: Per individual shift (not cumulative across the day). First 8h = 100%, next 2h = 125%, beyond 10h = 150%.
3. **Shabbat detection**: Use JavaScript `getDay() === 6` (Saturday) to auto-detect. Also respect manual holiday marking.
4. **Active shift persistence**: If the user closes the app while clocked in, the timer should resume correctly when they reopen it.
5. **Month boundaries**: Respect the custom month start day when filtering and calculating monthly totals.

### File Structure
Create this as a proper Vite + React project with:
- `src/components/` — reusable UI components
- `src/pages/` — Dashboard, ShiftLog, Settings, Report pages
- `src/hooks/` — custom hooks (useShifts, useSettings, useTimer)
- `src/utils/` — salary calculation logic, date helpers
- `src/context/` — React context for global state

Build the complete project. Make sure `npm run dev` works out of the box.

---

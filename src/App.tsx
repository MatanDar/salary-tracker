import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { BottomNav } from './components/BottomNav';
import { Dashboard } from './pages/Dashboard';
import { ShiftLog } from './pages/ShiftLog';
import { Settings } from './pages/Settings';
import { Report } from './pages/Report';

function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <div className="app">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/shifts" element={<ShiftLog />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/report" element={<Report />} />
          </Routes>
          <BottomNav />
        </div>
      </AppProvider>
    </BrowserRouter>
  );
}

export default App;

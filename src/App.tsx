import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Day0Page } from './pages/Day0/Day0';
import { Day1Page } from './pages/Day1/Day1';
import { Day2Page } from './pages/Day2/Day2';
import { SimulationPage } from './pages/Simulation/Simulation';
import { DashboardPage } from './pages/Dashboard/Dashboard';
import { OperationsPage } from './pages/Operations/Operations';
import { ReportsPage } from './pages/Reports/Reports';
import { SIEMPage } from './pages/SIEM/SIEM';
import { SettingsPage } from './pages/Settings/Settings';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="day0" element={<Day0Page />} />
          <Route path="day1" element={<Day1Page />} />
          <Route path="day2" element={<Day2Page />} />
          <Route path="ops" element={<OperationsPage />} />
          <Route path="simulation" element={<SimulationPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="siem" element={<SIEMPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

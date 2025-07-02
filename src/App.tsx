import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AdminLoginPage from './pages/AdminLoginPage';
import InstallPage from './components/InstallPage';
import InstallationGuard from './components/InstallationGuard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/install" element={<InstallPage />} />
        <Route path="/ww-admin" element={
          <InstallationGuard>
            <AdminLoginPage />
          </InstallationGuard>
        } />
        <Route path="/admin" element={
          <InstallationGuard>
            <AdminLoginPage />
          </InstallationGuard>
        } />
        <Route path="/" element={
          <InstallationGuard>
            <HomePage />
          </InstallationGuard>
        } />
      </Routes>
    </Router>
  );
}

export default App;
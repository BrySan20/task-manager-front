import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './pages/AuthPages/LandingPage/LandingPage';
import RegisterPage from './pages/AuthPages/RegisterPage/RegisterPage';
import LoginPage from './pages/AuthPages/LoginPage/LoginPage';
import DashboardPage from './pages/WorkerPages/DashboardPage';
import AdminDashboardPage from './pages/AdminPages/AdminDashboardPage';
import MasterDashboardPage from './pages/MasterPages/MasterDashboardPage';
import WorkerGroups from './pages/WorkerPages/WorkerGroups';
import WorkerTasks from './pages/WorkerPages/WorkerTasks';
import AdminGroups from './pages/AdminPages/AdminGroups';
import AdminTaskAsign from './pages/AdminPages/AdminTaskAsign';
import AdminTaskGroups from './pages/AdminPages/AdminTaskGroups';
import MasterGroups from './pages/MasterPages/MasterGroups';
import MasterTaskAsign from './pages/MasterPages/MasterTaskAsign';
import MasterTaskGroups from './pages/MasterPages/MasterTaskGroups';
import MasterUsers from './pages/MasterPages/MasterUsers';
import ProtectedRoute from './routes/ProtectedRoutes';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Rutas protegidas */}
        {/* Rutas de Worker */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={['worker']}>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/workergroups"
          element={
            <ProtectedRoute allowedRoles={['worker']}>
              <WorkerGroups />
            </ProtectedRoute>
          }
        />
        <Route
          path="/workertasks"
          element={
            <ProtectedRoute allowedRoles={['worker']}>
              <WorkerTasks />
            </ProtectedRoute>
          }
        />

        {/* Rutas de Admin */}
        <Route
          path="/admindashboard"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admingroups"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminGroups />
            </ProtectedRoute>
          }
        />
        <Route
          path="/taskasign"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminTaskAsign />
            </ProtectedRoute>
          }
        />
        <Route
          path="/taskgroups/:groupId"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminTaskGroups />
            </ProtectedRoute>
          }
        />

        {/* Rutas de Master */}
        <Route
          path="/masterdashboard"
          element={
            <ProtectedRoute allowedRoles={['master']}>
              <MasterDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mastergroups"
          element={
            <ProtectedRoute allowedRoles={['master']}>
              <MasterGroups />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mastertaskasign"
          element={
            <ProtectedRoute allowedRoles={['master']}>
              <MasterTaskAsign />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mastertaskgroups/:groupId"
          element={
            <ProtectedRoute allowedRoles={['master']}>
              <MasterTaskGroups />
            </ProtectedRoute>
          }
        />
        <Route
          path="/masterusers"
          element={
            <ProtectedRoute allowedRoles={['master']}>
              <MasterUsers />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
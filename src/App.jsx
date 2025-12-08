import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import RecentJobsPage from './pages/Home/Index';
import Register from './pages/Authentication/Register';
import ConfirmEmail from './pages/Authentication/ConfirmEmail';
import LoginPage from './pages/Authentication/Login';
import JobDetails from './pages/JobDetails/JobDetails';
import JobMap from './pages/Maps/JobMap';
import PrivateRoute from './components/PrivateRoute';

function AppContent() {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <>
      <Navbar />

      <Routes>
        {/* Public routes */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/confirm-email" element={<ConfirmEmail />} />

        {/* Map route with full-bleed layout */}
        <Route
          path="/map"
          element={
            <PrivateRoute>
              <div className="map-page-wrapper">
                <JobMap />
              </div>
            </PrivateRoute>
          }
        />

        {/* All other authenticated routes */}
        <Route
          path="/*"
          element={
            <PrivateRoute>
              <main
                style={{
                  padding: '0 2rem',
                  width: '100%',
                  maxWidth: '1280px',
                  margin: '0 auto',
                  flex: '1 0 auto',
                }}
              >
                <Routes>
                  <Route path="/" element={<RecentJobsPage />} />
                  <Route path="/job-details/:id" element={<JobDetails />} />
                </Routes>
              </main>
            </PrivateRoute>
          }
        />
      </Routes>

      <Footer />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#242424',
            color: '#fff',
            width: '100vw',
            minHeight: '100vh',
          }}
        >
          <AppContent />
        </div>
      </Router>
    </AuthProvider>
  );
}
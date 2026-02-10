import { useState, useEffect } from 'react';
import Layout from './components/Layout';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import AdsPage from './components/AdsPage';
import CarRequestsPage from './components/CarRequestsPage';
import DealersPage from './components/DealersPage';
import UsersPage from './components/UsersPage';
import PaymentsPage from './components/PaymentsPage';
import FinancePage from './components/FinancePage';
import AdsManagementPage from './components/AdsManagementPage';
import SocialMediaPage from './components/SocialMediaPage';
import SupportTicketsPage from './components/SupportTicketsPage';
import NotificationsPage from './components/NotificationsPage';
import SecurityPage from './components/SecurityPage';
import SettingsPage from './components/SettingsPage';
import { authApi } from './lib/api';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [admin, setAdmin] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const savedAdmin = localStorage.getItem('admin_data');

    if (token && savedAdmin) {
      try {
        setAdmin(JSON.parse(savedAdmin));
        setIsAuthenticated(true);
      } catch (error) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('admin_data');
      }
    }
    setLoading(false);
  }, []);

  const handleLoginSuccess = (token: string, adminData: any) => {
    setIsAuthenticated(true);
    setAdmin(adminData);
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('admin_data');
      setIsAuthenticated(false);
      setAdmin(null);
      setCurrentPage('dashboard');
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'ads':
        return <AdsPage />;
      case 'requests':
        return <CarRequestsPage />;
      case 'dealers':
        return <DealersPage />;
      case 'users':
        return <UsersPage />;
      case 'payments':
        return <PaymentsPage />;
      case 'finance':
        return <FinancePage />;
      case 'adsmanagement':
        return <AdsManagementPage />;
      case 'social':
        return <SocialMediaPage />;
      case 'support':
        return <SupportTicketsPage />;
      case 'notifications':
        return <NotificationsPage />;
      case 'security':
        return <SecurityPage />;
      case 'settings':
        return <SettingsPage admin={admin} />;
      default:
        return <Dashboard />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <Layout
      currentPage={currentPage}
      onNavigate={setCurrentPage}
      admin={admin}
      onLogout={handleLogout}
    >
      {renderPage()}
    </Layout>
  );
}

export default App;

import { useState } from 'react';
import Layout from './components/Layout';
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

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

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
        return <SettingsPage />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
}

export default App;

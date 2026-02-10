import { X, LayoutDashboard, Users, Package, Settings, BarChart3, FileText, ShoppingCart, Shield, DollarSign, Share2 } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentPage?: string;
  onNavigate?: (page: string) => void;
}

interface NavItem {
  name: string;
  icon: React.ReactNode;
  href: string;
  active?: boolean;
}

export default function Sidebar({ isOpen, onClose, currentPage = 'dashboard', onNavigate }: SidebarProps) {
  const navigation: NavItem[] = [
    { name: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, href: 'dashboard', active: currentPage === 'dashboard' },
    { name: 'İlanlar', icon: <FileText className="w-5 h-5" />, href: 'ads', active: currentPage === 'ads' },
    { name: 'Araç Talepleri', icon: <ShoppingCart className="w-5 h-5" />, href: 'requests', active: currentPage === 'requests' },
    { name: 'Galericiler', icon: <Users className="w-5 h-5" />, href: 'dealers', active: currentPage === 'dealers' },
    { name: 'Müşteriler', icon: <Users className="w-5 h-5" />, href: 'users', active: currentPage === 'users' },
    { name: 'Ödemeler', icon: <Package className="w-5 h-5" />, href: 'payments', active: currentPage === 'payments' },
    { name: 'Finans', icon: <DollarSign className="w-5 h-5" />, href: 'finance', active: currentPage === 'finance' },
    { name: 'Reklam Yönetimi', icon: <BarChart3 className="w-5 h-5" />, href: 'adsmanagement', active: currentPage === 'adsmanagement' },
    { name: 'Sosyal Medya', icon: <Share2 className="w-5 h-5" />, href: 'social', active: currentPage === 'social' },
    { name: 'Güvenlik', icon: <Shield className="w-5 h-5" />, href: 'security', active: currentPage === 'security' },
    { name: 'Ayarlar', icon: <Settings className="w-5 h-5" />, href: 'settings', active: currentPage === 'settings' },
  ];

  const handleNavigate = (page: string) => {
    if (onNavigate) {
      onNavigate(page);
    }
  };

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col bg-white border-r border-gray-200">
        <div className="flex flex-col flex-1 min-h-0">
          {/* Logo */}
          <div className="flex items-center h-16 px-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center">
                <span className="text-white font-bold text-xl">A</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Araç İlan</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navigation.map((item) => (
              <button
                key={item.name}
                onClick={() => handleNavigate(item.href)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all ${
                  item.active
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                {item.icon}
                {item.name}
              </button>
            ))}
          </nav>

          {/* Bottom section */}
          <div className="p-4 border-t border-gray-200">
            <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg p-4 text-white">
              <p className="text-sm font-semibold mb-1">Upgrade to Pro</p>
              <p className="text-xs opacity-90 mb-3">Get access to premium features</p>
              <button className="w-full bg-white text-blue-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors">
                Upgrade Now
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col flex-1 min-h-0">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center">
                <span className="text-white font-bold text-xl">A</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Araç İlan</span>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navigation.map((item) => (
              <button
                key={item.name}
                onClick={() => {
                  handleNavigate(item.href);
                  onClose();
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all ${
                  item.active
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                {item.icon}
                {item.name}
              </button>
            ))}
          </nav>

          {/* Bottom section */}
          <div className="p-4 border-t border-gray-200">
            <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg p-4 text-white">
              <p className="text-sm font-semibold mb-1">Upgrade to Pro</p>
              <p className="text-xs opacity-90 mb-3">Get access to premium features</p>
              <button className="w-full bg-white text-blue-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors">
                Upgrade Now
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

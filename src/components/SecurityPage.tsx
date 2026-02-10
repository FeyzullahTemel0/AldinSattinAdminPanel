import { useState, useEffect } from 'react';
import { Search, Filter, Download, Shield, AlertTriangle, Eye, MapPin, Monitor, Smartphone, Globe, Clock } from 'lucide-react';

interface SecurityLog {
  id: string;
  user_name: string;
  user_email: string | null;
  user_type: 'dealer' | 'customer' | 'guest' | 'admin';
  action: string;
  ip_address: string;
  mac_address: string | null;
  location_country: string | null;
  location_city: string | null;
  device_type: 'desktop' | 'mobile' | 'tablet' | null;
  device_os: string | null;
  device_browser: string | null;
  timestamp: string;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  is_suspicious: boolean;
}

export default function SecurityPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRisk, setSelectedRisk] = useState('all');
  const [selectedDevice, setSelectedDevice] = useState('all');
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);

      const mockLogs: SecurityLog[] = [
        {
          id: '1',
          user_name: 'Admin User',
          user_email: 'admin@example.com',
          user_type: 'admin',
          action: 'Logged in',
          ip_address: '192.168.1.100',
          mac_address: null,
          location_country: 'Turkey',
          location_city: 'Istanbul',
          device_type: 'desktop',
          device_os: 'Windows 10',
          device_browser: 'Chrome',
          timestamp: new Date().toISOString(),
          risk_level: 'low',
          is_suspicious: false,
        },
      ];

      setLogs(mockLogs);
    } catch (err) {
      console.error('Error fetching security logs:', err);
      setError('Güvenlik logları yüklenirken bir hata oluştu.');
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch =
      log.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.ip_address.includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.user_email && log.user_email.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRisk = selectedRisk === 'all' || log.risk_level === selectedRisk;
    const matchesDevice = selectedDevice === 'all' || log.device_type === selectedDevice;
    return matchesSearch && matchesRisk && matchesDevice;
  });

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'high': return 'bg-orange-100 text-orange-700';
      case 'critical': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getRiskText = (risk: string) => {
    switch (risk) {
      case 'low': return 'Düşük';
      case 'medium': return 'Orta';
      case 'high': return 'Yüksek';
      case 'critical': return 'Kritik';
      default: return risk;
    }
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'desktop': return <Monitor className="w-4 h-4" />;
      case 'mobile': return <Smartphone className="w-4 h-4" />;
      case 'tablet': return <Smartphone className="w-4 h-4" />;
      default: return <Monitor className="w-4 h-4" />;
    }
  };

  const getUserTypeColor = (type: string) => {
    switch (type) {
      case 'dealer': return 'bg-blue-100 text-blue-700';
      case 'customer': return 'bg-green-100 text-green-700';
      case 'guest': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getUserTypeText = (type: string) => {
    switch (type) {
      case 'dealer': return 'Galerici';
      case 'customer': return 'Müşteri';
      case 'guest': return 'Misafir';
      default: return type;
    }
  };

  const totalLogs = logs.length;
  const suspiciousCount = logs.filter(l => l.is_suspicious).length;
  const criticalCount = logs.filter(l => l.risk_level === 'critical').length;
  const uniqueIPs = new Set(logs.map(l => l.ip_address)).size;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Güvenlik logları yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Güvenlik & Log Takibi</h1>
        <p className="text-gray-600">Tüm kullanıcı aktivitelerini ve güvenlik olaylarını buradan takip edebilirsiniz.</p>
      </div>

      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3">
          <div className="flex-1">
            <h3 className="font-semibold text-red-900 mb-1">Hata</h3>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-sm text-gray-600">Toplam Log</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalLogs}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-sm text-gray-600">Şüpheli Aktivite</p>
          </div>
          <p className="text-2xl font-bold text-orange-600">{suspiciousCount}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <p className="text-sm text-gray-600">Kritik Seviye</p>
          </div>
          <p className="text-2xl font-bold text-red-600">{criticalCount}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Globe className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-sm text-gray-600">Benzersiz IP</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{uniqueIPs}</p>
        </div>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-red-900 mb-1">KVKK Uyarısı</h3>
            <p className="text-sm text-red-700">
              Bu sayfada yer alan kullanıcı verileri KVKK kapsamında korunmaktadır.
              Veriler sadece güvenlik, dolandırıcılık önleme ve yasal yükümlülükler için kullanılabilir.
              Yetkisiz erişim ve veri paylaşımı yasaktır.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Kullanıcı, IP adresi veya aktivite ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="all">Tüm Risk Seviyeleri</option>
              <option value="low">Düşük</option>
              <option value="medium">Orta</option>
              <option value="high">Yüksek</option>
              <option value="critical">Kritik</option>
            </select>
            <select
              value={selectedDevice}
              onChange={(e) => setSelectedDevice(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="all">Tüm Cihazlar</option>
              <option value="desktop">Masaüstü</option>
              <option value="mobile">Mobil</option>
              <option value="tablet">Tablet</option>
            </select>
            <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter className="w-5 h-5 text-gray-600" />
              <span className="hidden sm:inline">Filtre</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Download className="w-5 h-5 text-gray-600" />
              <span className="hidden sm:inline">Rapor</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredLogs.map((log) => (
          <div
            key={log.id}
            className={`bg-white rounded-xl border-2 hover:shadow-lg transition-all duration-300 ${
              log.is_suspicious ? 'border-red-300 bg-red-50' : 'border-gray-200'
            }`}
          >
            <div className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">{log.user_name}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getUserTypeColor(log.user_type)}`}>
                      {getUserTypeText(log.user_type)}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRiskColor(log.risk_level)}`}>
                      {getRiskText(log.risk_level)}
                    </span>
                    {log.is_suspicious && (
                      <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                        <AlertTriangle className="w-3 h-3" />
                        Şüpheli
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Aktivite</p>
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">{log.action}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">IP Adresi</p>
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">{log.ip_address}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">MAC Adresi</p>
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-mono text-gray-900">{log.mac_address || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Lokasyon</p>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{log.location_city || 'N/A'}, {log.location_country || 'N/A'}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Cihaz</p>
                      <div className="flex items-center gap-2">
                        {getDeviceIcon(log.device_type || 'desktop')}
                        <span className="text-sm text-gray-900">{log.device_os || 'N/A'}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Tarayıcı</p>
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{log.device_browser || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 lg:w-48">
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <Clock className="w-4 h-4" />
                    <span>{new Date(log.timestamp).toLocaleString('tr-TR')}</span>
                  </div>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                    Detayları Gör
                  </button>
                  {log.is_suspicious && (
                    <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium">
                      Polise Bildir
                    </button>
                  )}
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                    IP'yi Engelle
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredLogs.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-500">Aramanıza uygun log kaydı bulunamadı.</p>
        </div>
      )}
    </div>
  );
}

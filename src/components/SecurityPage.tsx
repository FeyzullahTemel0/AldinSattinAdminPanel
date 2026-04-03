import { useState, useEffect } from 'react';
import { Search, Filter, Download, Shield, AlertTriangle, Eye, MapPin, Monitor, Smartphone, Globe, Clock } from 'lucide-react';
import { securityLogsApi } from '../lib/api';

interface SecurityLog {
  id: string;
  user_name: string;
  user_email: string | null;
  user_type: 'dealer' | 'customer' | 'guest' | 'admin';
  action: string;
  ip_address: string | null;
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

      const response = await securityLogsApi.getAll();
      setLogs(response.data || []);
    } catch (err) {
      console.error('Error fetching security logs:', err);
      setError('Guvenlik loglari yuklenirken bir hata olustu.');
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      log.user_name.toLowerCase().includes(searchLower) ||
      (log.ip_address || '').toLowerCase().includes(searchLower) ||
      log.action.toLowerCase().includes(searchLower) ||
      (log.user_email && log.user_email.toLowerCase().includes(searchLower));
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
      case 'low': return 'Dusuk';
      case 'medium': return 'Orta';
      case 'high': return 'Yuksek';
      case 'critical': return 'Kritik';
      default: return risk;
    }
  };

  const getDeviceIcon = (type: string | null) => {
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
      case 'customer': return 'Musteri';
      case 'guest': return 'Misafir';
      default: return type;
    }
  };

  const totalLogs = logs.length;
  const suspiciousCount = logs.filter((l) => l.is_suspicious).length;
  const criticalCount = logs.filter((l) => l.risk_level === 'critical').length;
  const uniqueIPs = new Set(logs.map((l) => l.ip_address).filter(Boolean)).size;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Guvenlik loglari yukleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Guvenlik ve Log Takibi</h1>
        <p className="text-gray-600">Tum kullanici aktivitelerini ve guvenlik olaylarini buradan takip edebilirsiniz.</p>
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
        <div className="bg-white rounded-lg border border-gray-200 p-4"><div className="flex items-center gap-3 mb-2"><div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center"><Shield className="w-5 h-5 text-blue-600" /></div><p className="text-sm text-gray-600">Toplam Log</p></div><p className="text-2xl font-bold text-gray-900">{totalLogs}</p></div>
        <div className="bg-white rounded-lg border border-gray-200 p-4"><div className="flex items-center gap-3 mb-2"><div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center"><AlertTriangle className="w-5 h-5 text-orange-600" /></div><p className="text-sm text-gray-600">Supheli Aktivite</p></div><p className="text-2xl font-bold text-orange-600">{suspiciousCount}</p></div>
        <div className="bg-white rounded-lg border border-gray-200 p-4"><div className="flex items-center gap-3 mb-2"><div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center"><AlertTriangle className="w-5 h-5 text-red-600" /></div><p className="text-sm text-gray-600">Kritik Seviye</p></div><p className="text-2xl font-bold text-red-600">{criticalCount}</p></div>
        <div className="bg-white rounded-lg border border-gray-200 p-4"><div className="flex items-center gap-3 mb-2"><div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center"><Globe className="w-5 h-5 text-green-600" /></div><p className="text-sm text-gray-600">Benzersiz IP</p></div><p className="text-2xl font-bold text-gray-900">{uniqueIPs}</p></div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" placeholder="Kullanici, IP adresi veya aktivite ara..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
          <div className="flex gap-2">
            <select value={selectedRisk} onChange={(e) => setSelectedRisk(e.target.value)} className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white">
              <option value="all">Tum Risk Seviyeleri</option>
              <option value="low">Dusuk</option>
              <option value="medium">Orta</option>
              <option value="high">Yuksek</option>
              <option value="critical">Kritik</option>
            </select>
            <select value={selectedDevice} onChange={(e) => setSelectedDevice(e.target.value)} className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white">
              <option value="all">Tum Cihazlar</option>
              <option value="desktop">Masaustu</option>
              <option value="mobile">Mobil</option>
              <option value="tablet">Tablet</option>
            </select>
            <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"><Filter className="w-5 h-5 text-gray-600" /><span className="hidden sm:inline">Filtre</span></button>
            <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"><Download className="w-5 h-5 text-gray-600" /><span className="hidden sm:inline">Rapor</span></button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredLogs.map((log) => (
          <div key={log.id} className={`bg-white rounded-xl border-2 hover:shadow-lg transition-all duration-300 ${log.is_suspicious ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}>
            <div className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">{log.user_name}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getUserTypeColor(log.user_type)}`}>{getUserTypeText(log.user_type)}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRiskColor(log.risk_level)}`}>{getRiskText(log.risk_level)}</span>
                    {log.is_suspicious && <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700"><AlertTriangle className="w-3 h-3" /> Supheli</span>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div><p className="text-xs text-gray-500 mb-1">Aktivite</p><div className="flex items-center gap-2"><Eye className="w-4 h-4 text-gray-400" /><span className="text-sm font-medium text-gray-900">{log.action}</span></div></div>
                    <div><p className="text-xs text-gray-500 mb-1">IP Adresi</p><div className="flex items-center gap-2"><Globe className="w-4 h-4 text-gray-400" /><span className="text-sm font-medium text-gray-900">{log.ip_address || 'N/A'}</span></div></div>
                    <div><p className="text-xs text-gray-500 mb-1">MAC Adresi</p><div className="flex items-center gap-2"><Shield className="w-4 h-4 text-gray-400" /><span className="text-sm font-mono text-gray-900">{log.mac_address || 'N/A'}</span></div></div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div><p className="text-xs text-gray-500 mb-1">Lokasyon</p><div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-gray-400" /><span className="text-sm text-gray-900">{log.location_city || 'N/A'}, {log.location_country || 'N/A'}</span></div></div>
                    <div><p className="text-xs text-gray-500 mb-1">Cihaz</p><div className="flex items-center gap-2">{getDeviceIcon(log.device_type)}<span className="text-sm text-gray-900">{log.device_os || 'N/A'}</span></div></div>
                    <div><p className="text-xs text-gray-500 mb-1">Tarayici</p><div className="flex items-center gap-2"><Globe className="w-4 h-4 text-gray-400" /><span className="text-sm text-gray-900">{log.device_browser || 'N/A'}</span></div></div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 lg:w-48">
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-2"><Clock className="w-4 h-4" /><span>{new Date(log.timestamp).toLocaleString('tr-TR')}</span></div>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">Detaylari Gor</button>
                  {log.is_suspicious && <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium">Polise Bildir</button>}
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">IP'yi Engelle</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredLogs.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-500">Aramaniza uygun log kaydi bulunamadi.</p>
        </div>
      )}
    </div>
  );
}

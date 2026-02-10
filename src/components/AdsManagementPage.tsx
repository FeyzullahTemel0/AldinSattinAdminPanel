import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, Image, Link, Calendar } from 'lucide-react';

interface AdBanner {
  id: string;
  name: string;
  location: 'header' | 'sidebar' | 'homepage' | 'listing' | 'footer';
  type: 'image' | 'html' | 'video';
  status: 'active' | 'inactive' | 'scheduled';
  clicks: number;
  impressions: number;
  start_date: string;
  end_date: string;
  priority: number;
}

export default function AdsManagementPage() {
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [banners, setBanners] = useState<AdBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      setError(null);

      const mockBanners: AdBanner[] = [
        {
          id: '1',
          name: 'Homepage Hero Banner',
          location: 'homepage',
          type: 'image',
          status: 'active',
          clicks: 150,
          impressions: 5000,
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          priority: 10,
        },
      ];

      setBanners(mockBanners);
    } catch (err) {
      console.error('Error fetching banners:', err);
      setError('Reklam verileri yüklenirken bir hata oluştu.');
      setBanners([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredBanners = banners.filter(banner =>
    selectedLocation === 'all' || banner.location === selectedLocation
  );

  const getLocationText = (location: string) => {
    switch (location) {
      case 'header': return 'Üst Banner';
      case 'sidebar': return 'Yan Panel';
      case 'homepage': return 'Ana Sayfa';
      case 'listing': return 'Liste Sayfası';
      case 'footer': return 'Alt Kısım';
      default: return location;
    }
  };

  const getLocationColor = (location: string) => {
    switch (location) {
      case 'header': return 'bg-blue-100 text-blue-700';
      case 'sidebar': return 'bg-green-100 text-green-700';
      case 'homepage': return 'bg-orange-100 text-orange-700';
      case 'listing': return 'bg-cyan-100 text-cyan-700';
      case 'footer': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'inactive': return 'bg-gray-100 text-gray-700';
      case 'scheduled': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Aktif';
      case 'inactive': return 'Pasif';
      case 'scheduled': return 'Zamanlanmış';
      default: return status;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image className="w-4 h-4" />;
      case 'html': return <Link className="w-4 h-4" />;
      case 'video': return <Calendar className="w-4 h-4" />;
      default: return null;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'image': return 'Görsel';
      case 'html': return 'HTML';
      case 'video': return 'Video';
      default: return type;
    }
  };

  const totalClicks = banners.reduce((sum, b) => sum + b.clicks, 0);
  const totalImpressions = banners.reduce((sum, b) => sum + b.impressions, 0);
  const activeAds = banners.filter(b => b.status === 'active').length;
  const ctr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0.00';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Reklam verileri yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Reklam Yönetimi</h1>
          <p className="text-gray-600">Site içerisindeki reklam alanlarını buradan yönetebilirsiniz.</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium">
          <Plus className="w-5 h-5" />
          Yeni Reklam Ekle
        </button>
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
          <p className="text-sm text-gray-600 mb-1">Aktif Reklamlar</p>
          <p className="text-2xl font-bold text-gray-900">{activeAds}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Toplam Tıklama</p>
          <p className="text-2xl font-bold text-blue-600">{totalClicks.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Gösterim</p>
          <p className="text-2xl font-bold text-green-600">{totalImpressions.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">CTR</p>
          <p className="text-2xl font-bold text-orange-600">%{ctr}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Lokasyon:</label>
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            <option value="all">Tüm Lokasyonlar</option>
            <option value="header">Üst Banner</option>
            <option value="sidebar">Yan Panel</option>
            <option value="homepage">Ana Sayfa</option>
            <option value="listing">Liste Sayfası</option>
            <option value="footer">Alt Kısım</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredBanners.map((banner) => (
          <div key={banner.id} className="bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300">
            <div className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">{banner.name}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(banner.status)}`}>
                      {getStatusText(banner.status)}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getLocationColor(banner.location)}`}>
                      {getLocationText(banner.location)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Tip</p>
                      <div className="flex items-center gap-1">
                        {getTypeIcon(banner.type)}
                        <span className="text-sm font-medium text-gray-900">{getTypeText(banner.type)}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Öncelik</p>
                      <span className="text-sm font-medium text-gray-900">{banner.priority}</span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Başlangıç</p>
                      <span className="text-sm font-medium text-gray-900">{new Date(banner.start_date).toLocaleDateString('tr-TR')}</span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Bitiş</p>
                      <span className="text-sm font-medium text-gray-900">{new Date(banner.end_date).toLocaleDateString('tr-TR')}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Tıklama</p>
                      <p className="text-lg font-bold text-blue-600">{banner.clicks.toLocaleString()}</p>
                    </div>
                    <div className="h-8 w-px bg-gray-300"></div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Gösterim</p>
                      <p className="text-lg font-bold text-green-600">{banner.impressions.toLocaleString()}</p>
                    </div>
                    <div className="h-8 w-px bg-gray-300"></div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">CTR</p>
                      <p className="text-lg font-bold text-orange-600">
                        {banner.impressions > 0 ? ((banner.clicks / banner.impressions) * 100).toFixed(2) : '0.00'}%
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 lg:w-40">
                  <button className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                    <Eye className="w-4 h-4" />
                    Önizle
                  </button>
                  <button className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                    <Edit className="w-4 h-4" />
                    Düzenle
                  </button>
                  {banner.status === 'active' ? (
                    <button className="flex items-center justify-center gap-2 px-4 py-2 border border-yellow-300 text-yellow-600 rounded-lg hover:bg-yellow-50 transition-colors text-sm font-medium">
                      <EyeOff className="w-4 h-4" />
                      Durdur
                    </button>
                  ) : (
                    <button className="flex items-center justify-center gap-2 px-4 py-2 border border-green-300 text-green-600 rounded-lg hover:bg-green-50 transition-colors text-sm font-medium">
                      <Eye className="w-4 h-4" />
                      Aktifleştir
                    </button>
                  )}
                  <button className="flex items-center justify-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium">
                    <Trash2 className="w-4 h-4" />
                    Sil
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredBanners.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-500">Bu lokasyonda reklam bulunamadı.</p>
        </div>
      )}
    </div>
  );
}

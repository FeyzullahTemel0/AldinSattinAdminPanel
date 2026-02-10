import { useState, useEffect } from 'react';
import { Search, Filter, Download, Plus, Eye, Edit, Trash2, MapPin, Phone, Mail, Star, FileText, Ban, CheckCircle, XCircle, Store } from 'lucide-react';
import { dealersApi } from '../lib/api';

interface Dealer {
  id: string;
  name: string;
  owner_name: string;
  email: string;
  phone: string;
  city: string;
  district: string;
  address?: string;
  status: 'active' | 'inactive' | 'suspended';
  rating?: number;
  total_ads?: number;
  active_ads?: number;
  created_at: string;
  last_login?: string;
  verified: boolean;
}

export default function DealersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedDealer, setSelectedDealer] = useState<Dealer | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDealers = async () => {
      try {
        const params: any = {};
        if (selectedStatus !== 'all') {
          params.status = selectedStatus;
        }
        if (searchTerm) {
          params.search = searchTerm;
        }

        const response = await dealersApi.getAll(params);
        setDealers(response.data);
      } catch (error) {
        console.error('Error fetching dealers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDealers();
  }, [selectedStatus, searchTerm]);

  const filteredDealers = dealers.filter(dealer => {
    const matchesCity = selectedCity === 'all' || dealer.city === selectedCity;
    return matchesCity;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'inactive': return 'bg-gray-100 text-gray-700';
      case 'suspended': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Aktif';
      case 'inactive': return 'Pasif';
      case 'suspended': return 'Askıda';
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatLastLogin = (dateString?: string) => {
    if (!dateString) return 'Hiç giriş yapmadı';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Az önce';
    if (diffHours < 24) return `${diffHours} saat önce`;
    if (diffDays < 7) return `${diffDays} gün önce`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} hafta önce`;
    return formatDate(dateString);
  };

  const uniqueCities = Array.from(new Set(dealers.map(d => d.city)));

  const totalDealers = dealers.length;
  const activeDealers = dealers.filter(d => d.status === 'active').length;
  const verifiedDealers = dealers.filter(d => d.verified).length;
  const suspendedDealers = dealers.filter(d => d.status === 'suspended').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Galerici Yönetimi</h1>
          <p className="text-gray-600">Platformdaki tüm galericileri buradan yönetebilirsiniz.</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium">
          <Plus className="w-5 h-5" />
          Yeni Galerici Ekle
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Toplam Galerici</p>
          <p className="text-2xl font-bold text-gray-900">{totalDealers}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Aktif Galericiler</p>
          <p className="text-2xl font-bold text-green-600">{activeDealers}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Onaylı Galericiler</p>
          <p className="text-2xl font-bold text-blue-600">{verifiedDealers}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Askıda</p>
          <p className="text-2xl font-bold text-red-600">{suspendedDealers}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Galerici adı veya lokasyon ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="all">Tüm Durumlar</option>
              <option value="active">Aktif</option>
              <option value="inactive">Pasif</option>
              <option value="suspended">Askıda</option>
            </select>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="all">Tüm Şehirler</option>
              {uniqueCities.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
            <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter className="w-5 h-5 text-gray-600" />
              <span className="hidden sm:inline">Filtre</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Download className="w-5 h-5 text-gray-600" />
              <span className="hidden sm:inline">Dışa Aktar</span>
            </button>
          </div>
        </div>
      </div>

      {filteredDealers.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Store className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">Henüz galerici bulunmuyor</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredDealers.map((dealer) => (
            <div key={dealer.id} className="bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{dealer.name}</h3>
                      {dealer.verified && (
                        <CheckCircle className="w-5 h-5 text-blue-600" title="Onaylı" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{dealer.owner_name}</p>

                    {dealer.rating && (
                      <div className="flex items-center gap-1 mb-3">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(dealer.rating || 0)
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="text-sm font-medium text-gray-900 ml-1">{dealer.rating.toFixed(1)}</span>
                      </div>
                    )}

                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(dealer.status)}`}>
                      {getStatusText(dealer.status)}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span>{dealer.district}, {dealer.city}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4 flex-shrink-0" />
                    <span>{dealer.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4 flex-shrink-0" />
                    <span>{dealer.email}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 py-4 border-t border-b border-gray-200">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Toplam İlan</p>
                    <p className="text-lg font-bold text-gray-900">{dealer.total_ads || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Aktif İlan</p>
                    <p className="text-lg font-bold text-green-600">{dealer.active_ads || 0}</p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      setSelectedDealer(dealer);
                      setShowDetails(true);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    <Eye className="w-4 h-4" />
                    Detaylar
                  </button>
                  <button className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                    <FileText className="w-4 h-4" />
                    İlanları
                  </button>
                  <button className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                    <Edit className="w-4 h-4" />
                    Düzenle
                  </button>
                  {dealer.status !== 'suspended' ? (
                    <button className="flex items-center gap-1 px-3 py-1.5 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium">
                      <Ban className="w-4 h-4" />
                      Askıya Al
                    </button>
                  ) : (
                    <button className="flex items-center gap-1 px-3 py-1.5 border border-green-300 text-green-600 rounded-lg hover:bg-green-50 transition-colors text-sm font-medium">
                      <CheckCircle className="w-4 h-4" />
                      Aktifleştir
                    </button>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
                  <span>Üye: {formatDate(dealer.created_at)}</span>
                  <span>Son giriş: {formatLastLogin(dealer.last_login)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-gray-600">
          Gösterilen: <span className="font-medium">{filteredDealers.length}</span> / <span className="font-medium">{totalDealers}</span>
        </p>
        <div className="flex flex-wrap gap-2 justify-center">
          <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            Önceki
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            1
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            Sonraki
          </button>
        </div>
      </div>

      {showDetails && selectedDealer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedDealer.name}</h2>
                  <p className="text-sm text-gray-500">Galerici ID: #{selectedDealer.id}</p>
                </div>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Genel Bilgiler</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedDealer.rating && (
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <Star className="w-5 h-5 text-yellow-500" />
                      <div>
                        <p className="text-sm text-gray-500">Puan</p>
                        <p className="font-medium text-gray-900">{selectedDealer.rating.toFixed(1)} / 5.0</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-500">Durum</p>
                      <p className="font-medium text-gray-900">
                        {selectedDealer.verified ? 'Doğrulanmış' : 'Doğrulanmamış'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">İletişim Bilgileri</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <Mail className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="text-sm text-gray-500">Yetkili</p>
                      <p className="font-medium text-gray-900">{selectedDealer.owner_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <Mail className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="text-sm text-gray-500">E-posta</p>
                      <p className="font-medium text-gray-900">{selectedDealer.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <Phone className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="text-sm text-gray-500">Telefon</p>
                      <p className="font-medium text-gray-900">{selectedDealer.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <MapPin className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="text-sm text-gray-500">Konum</p>
                      <p className="font-medium text-gray-900">
                        {selectedDealer.city}, {selectedDealer.district}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">İstatistikler</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Toplam İlan</p>
                    <p className="text-2xl font-bold text-gray-900">{selectedDealer.total_ads || 0}</p>
                  </div>
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Aktif İlan</p>
                    <p className="text-2xl font-bold text-gray-900">{selectedDealer.active_ads || 0}</p>
                  </div>
                  {selectedDealer.rating && (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Puan</p>
                      <p className="text-2xl font-bold text-gray-900">{selectedDealer.rating.toFixed(1)}</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Hesap Bilgileri</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Üyelik Tarihi</p>
                    <p className="font-semibold text-gray-900">{formatDate(selectedDealer.created_at)}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Son Giriş</p>
                    <p className="font-semibold text-gray-900">{formatLastLogin(selectedDealer.last_login)}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Hesap Durumu</p>
                    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedDealer.status)}`}>
                      {getStatusText(selectedDealer.status)}
                    </span>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Doğrulama Durumu</p>
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                      selectedDealer.verified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {selectedDealer.verified ? (
                        <><CheckCircle className="w-4 h-4" /> Doğrulanmış</>
                      ) : (
                        'Doğrulanmamış'
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setShowDetails(false)}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
              >
                Kapat
              </button>
              <button className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2">
                <FileText className="w-4 h-4" />
                İlanları Görüntüle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

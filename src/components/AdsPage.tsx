import { useState, useEffect } from 'react';
import { Search, Filter, Download, Plus, Eye, CheckCircle, XCircle, Clock, CreditCard, Ban, AlertCircle } from 'lucide-react';
import { adsApi } from '../lib/api';

interface Ad {
  id: string;
  title: string;
  description: string;
  price: number;
  brand: string;
  model: string;
  year: number;
  category: string;
  dealer_id: string;
  dealer_name: string;
  status: 'pending_payment' | 'active' | 'expired_payment' | 'rejected' | 'cancelled';
  payment_status: 'unpaid' | 'paid';
  expiry_date: string | null;
  created_at: string;
}

export default function AdsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [showManualControl, setShowManualControl] = useState<string | null>(null);

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    try {
      const response = await adsApi.getAll();
      setAds(response.data || []);
    } catch (error) {
      console.error('Error fetching ads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleManualStatusChange = async (adId: string, newStatus: string) => {
    try {
      await adsApi.update(adId, { status: newStatus });
      await fetchAds();
      setShowManualControl(null);
    } catch (error) {
      console.error('Error updating ad status:', error);
    }
  };

  const filteredAds = ads.filter(ad => {
    const matchesSearch =
      ad.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ad.dealer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ad.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || ad.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'pending_payment': return 'bg-yellow-100 text-yellow-700';
      case 'expired_payment': return 'bg-orange-100 text-orange-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      case 'cancelled': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Aktif';
      case 'pending_payment': return 'Ödeme Bekleniyor';
      case 'expired_payment': return 'Süresi Doldu - Ödeme Bekleniyor';
      case 'rejected': return 'Reddedildi';
      case 'cancelled': return 'İptal Edildi';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'pending_payment': return <Clock className="w-4 h-4" />;
      case 'expired_payment': return <AlertCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      case 'cancelled': return <Ban className="w-4 h-4" />;
      default: return null;
    }
  };

  const getRemainingDays = (expiryDate: string | null) => {
    if (!expiryDate) return null;
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diff = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const stats = {
    total: ads.length,
    active: ads.filter(a => a.status === 'active').length,
    pending_payment: ads.filter(a => a.status === 'pending_payment').length,
    expired_payment: ads.filter(a => a.status === 'expired_payment').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">İlanlar</h1>
          <p className="text-gray-600">Tüm araç ilanlarını yönetin ve durumlarını kontrol edin</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium">
          <Plus className="w-5 h-5" />
          Yeni İlan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Toplam İlan</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Aktif İlanlar</p>
          <p className="text-2xl font-bold text-green-600">{stats.active}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Ödeme Bekleyen</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.pending_payment}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Süresi Dolan</p>
          <p className="text-2xl font-bold text-orange-600">{stats.expired_payment}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="İlan ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="all">Tüm Durumlar</option>
              <option value="active">Aktif</option>
              <option value="pending_payment">Ödeme Bekleniyor</option>
              <option value="expired_payment">Süresi Doldu</option>
              <option value="rejected">Reddedildi</option>
              <option value="cancelled">İptal Edildi</option>
            </select>
            <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter className="w-5 h-5 text-gray-600" />
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Download className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-600 uppercase">İlan</th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-600 uppercase">Galerici</th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-600 uppercase">Fiyat</th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-600 uppercase">Durum</th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-600 uppercase">Ödeme</th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-600 uppercase">Tarih</th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-600 uppercase">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredAds.map((ad) => {
                const remainingDays = getRemainingDays(ad.expiry_date);
                return (
                  <tr key={ad.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-medium text-gray-900">{ad.title}</p>
                        <p className="text-sm text-gray-500">{ad.brand} {ad.model} ({ad.year})</p>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-900">{ad.dealer_name}</td>
                    <td className="py-4 px-6 font-medium text-gray-900">₺{ad.price.toLocaleString()}</td>
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(ad.status)}`}>
                          {getStatusIcon(ad.status)}
                          {getStatusText(ad.status)}
                        </span>
                        {ad.status === 'active' && remainingDays !== null && (
                          <p className="text-xs text-gray-500">
                            {remainingDays > 0 ? `${remainingDays} gün kaldı` : 'Bugün sona eriyor'}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                        ad.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        <CreditCard className="w-3 h-3" />
                        {ad.payment_status === 'paid' ? 'Ödendi' : 'Ödenmedi'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">
                      {new Date(ad.created_at).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-blue-50 rounded-lg transition-colors group">
                          <Eye className="w-4 h-4 text-gray-600 group-hover:text-blue-600" />
                        </button>
                        <button
                          onClick={() => setShowManualControl(showManualControl === ad.id ? null : ad.id)}
                          className="px-3 py-1.5 text-xs font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Manuel Müdahale
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showManualControl && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Manuel Durum Değişikliği</h3>
            <p className="text-sm text-gray-600 mb-6">
              Bu işlem otomatik ödeme kontrol sistemini geçersiz kılar. Sadece sistemde bir sorun olduğunda kullanın.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => handleManualStatusChange(showManualControl, 'active')}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <CheckCircle className="w-5 h-5" />
                Onayla ve Aktifleştir
              </button>
              <button
                onClick={() => handleManualStatusChange(showManualControl, 'rejected')}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <XCircle className="w-5 h-5" />
                Reddet
              </button>
              <button
                onClick={() => handleManualStatusChange(showManualControl, 'cancelled')}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Ban className="w-5 h-5" />
                İptal Et
              </button>
              <button
                onClick={() => setShowManualControl(null)}
                className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Vazgeç
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

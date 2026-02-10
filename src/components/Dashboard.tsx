import { TrendingUp, TrendingDown, FileText, Users, Car, DollarSign, Clock, Activity, CheckCircle, AlertCircle } from 'lucide-react';
import { useDashboard } from '../lib/hooks';

interface StatCardProps {
  title: string;
  value: string;
  change: number;
  icon: React.ReactNode;
  iconBg: string;
}

function StatCard({ title, value, change, icon, iconBg }: StatCardProps) {
  const isPositive = change >= 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg ${iconBg} flex items-center justify-center`}>
          {icon}
        </div>
        <div className={`flex items-center gap-1 text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          {Math.abs(change)}%
        </div>
      </div>
      <h3 className="text-gray-600 text-sm font-medium mb-1">{title}</h3>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

export default function Dashboard() {
  const {
    stats,
    recentAds,
    carRequests: carRequestsList,
    topDealers,
    categories,
    activities,
    loading,
    error,
  } = useDashboard();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Az önce';
    if (diffMins < 60) return `${diffMins} dk önce`;
    if (diffHours < 24) return `${diffHours} saat önce`;
    if (diffDays < 7) return `${diffDays} gün önce`;

    return date.toLocaleDateString('tr-TR');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'pending_payment': return 'bg-yellow-100 text-yellow-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Aktif';
      case 'pending_payment': return 'Beklemede';
      case 'rejected': return 'Reddedildi';
      default: return status;
    }
  };

  const getActivityTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      case 'warning': return 'bg-yellow-500';
      default: return 'bg-blue-500';
    }
  };

  const getCategoryColor = (index: number) => {
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-orange-500', 'bg-cyan-500', 'bg-gray-500'];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const statCards = [
    { title: 'Toplam İlan', value: stats.totalAds.toString(), change: stats.totalAdsChange, icon: <FileText className="w-6 h-6 text-blue-600" />, iconBg: 'bg-blue-100' },
    { title: 'Aktif Galerici', value: stats.activeDealers.toString(), change: stats.activeDealersChange, icon: <Users className="w-6 h-6 text-green-600" />, iconBg: 'bg-green-100' },
    { title: 'Araç Talep', value: stats.carRequests.toString(), change: stats.carRequestsChange, icon: <Car className="w-6 h-6 text-orange-600" />, iconBg: 'bg-orange-100' },
    { title: 'Aylık Gelir', value: formatCurrency(stats.monthlyRevenue), change: stats.monthlyRevenueChange, icon: <DollarSign className="w-6 h-6 text-cyan-600" />, iconBg: 'bg-cyan-100' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">İlan platformunuzun genel durumunu buradan takip edebilirsiniz.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingAds}</p>
              <p className="text-sm text-gray-600">Bekleyen Onay</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.todayPublished}</p>
              <p className="text-sm text-gray-600">Bugün Yayınlanan</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.reportedAds}</p>
              <p className="text-sm text-gray-600">Şikayet Edilen</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.activeUsers}</p>
              <p className="text-sm text-gray-600">Aktif Kullanıcı</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Son İlanlar</h2>
          </div>
          {recentAds.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>Henüz ilan bulunmuyor</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-600 uppercase">İlan</th>
                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-600 uppercase">Fiyat</th>
                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-600 uppercase">Durum</th>
                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-600 uppercase">Zaman</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentAds.map((ad) => (
                    <tr key={ad.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-medium text-gray-900">{ad.title}</p>
                          <p className="text-sm text-gray-500">{ad.dealer_name}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-medium text-gray-900">{formatCurrency(ad.price)}</td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(ad.status)}`}>
                          {getStatusText(ad.status)}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-600">{formatDate(ad.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Kategori Dağılımı</h2>
          </div>
          {categories.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>Kategori verisi yok</p>
            </div>
          ) : (
            <div className="p-6 space-y-4">
              {categories.map((category, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">{category.category}</span>
                    <span className="text-sm text-gray-600">{category.count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`${getCategoryColor(idx)} h-2 rounded-full transition-all`}
                      style={{ width: `${category.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Son Araç Talepleri</h2>
        </div>
        {carRequestsList.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Car className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p>Henüz araç talebi bulunmuyor</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-600 uppercase">Müşteri</th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-600 uppercase">Araç</th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-600 uppercase">Bütçe</th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-600 uppercase">Teklif</th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-600 uppercase">Zaman</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {carRequestsList.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 font-medium text-gray-900">{request.customer_name}</td>
                    <td className="py-4 px-6 text-gray-900">{request.vehicle_brand} {request.vehicle_model}</td>
                    <td className="py-4 px-6 text-gray-600">
                      {formatCurrency(request.budget_min)} - {formatCurrency(request.budget_max)}
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                        {request.offers_count} Teklif
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-600">{formatDate(request.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">En Başarılı Galericiler</h2>
          </div>
          {topDealers.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>Galerici verisi yok</p>
            </div>
          ) : (
            <div className="p-6 space-y-4">
              {topDealers.map((dealer, idx) => (
                <div key={dealer.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{dealer.company_name}</p>
                      <p className="text-sm text-gray-600">{dealer.total_sales} satış</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{formatCurrency(dealer.total_revenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Son Aktiviteler</h2>
          </div>
          {activities.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Activity className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>Aktivite bulunmuyor</p>
            </div>
          ) : (
            <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${getActivityTypeColor(activity.type)}`}></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">
                      <span className="font-semibold">{activity.user_name}</span>
                      {' '}{activity.action}
                      {activity.item && <span className="font-medium"> "{activity.item}"</span>}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{formatDate(activity.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

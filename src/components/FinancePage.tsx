import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Calendar, PieChart, Receipt, Server, Globe, Megaphone, CreditCard, Settings, Save, X, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { financeApi, settingsApi } from '../lib/api';

export default function FinancePage() {
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(true);

  const [taxRate, setTaxRate] = useState(18);
  const [expenses, setExpenses] = useState({
    hosting: 300,
    domain: 60,
    ads: 4500,
    equipment: 1500
  });

  const [dashboardData, setDashboardData] = useState<any>(null);
  const [monthlyTrend, setMonthlyTrend] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
    fetchSettings();
  }, [selectedPeriod]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [dashResponse, trendResponse] = await Promise.all([
        financeApi.getDashboard(selectedPeriod),
        financeApi.getMonthlyTrend(6)
      ]);
      setDashboardData(dashResponse.data);
      setMonthlyTrend(trendResponse.data);
    } catch (error) {
      console.error('Error fetching finance data:', error);
      setError('Finans verileri yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      setDashboardData({
        revenue: 0,
        tax: 0,
        expenses: {},
        netProfit: 0,
        totalExpenses: 0,
        taxRate: 18,
        profitMargin: 0
      });
      setMonthlyTrend([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const settingsResponse = await settingsApi.getAll({ category: 'finance' });
      const settingsData = settingsResponse.data;

      settingsData.forEach((setting: any) => {
        if (setting.key === 'tax_rate') {
          setTaxRate(parseFloat(setting.value));
        } else if (setting.key === 'expense_hosting') {
          setExpenses(prev => ({ ...prev, hosting: parseFloat(setting.value) }));
        } else if (setting.key === 'expense_domain') {
          setExpenses(prev => ({ ...prev, domain: parseFloat(setting.value) }));
        } else if (setting.key === 'expense_ads') {
          setExpenses(prev => ({ ...prev, ads: parseFloat(setting.value) }));
        } else if (setting.key === 'expense_equipment') {
          setExpenses(prev => ({ ...prev, equipment: parseFloat(setting.value) }));
        }
      });
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const handleSaveSettings = async () => {
    try {
      await Promise.all([
        settingsApi.createOrUpdate({
          key: 'tax_rate',
          value: taxRate.toString(),
          category: 'finance',
          description: 'Tax rate percentage'
        }),
        settingsApi.createOrUpdate({
          key: 'expense_hosting',
          value: expenses.hosting.toString(),
          category: 'finance',
          description: 'Monthly hosting cost'
        }),
        settingsApi.createOrUpdate({
          key: 'expense_domain',
          value: expenses.domain.toString(),
          category: 'finance',
          description: 'Monthly domain cost'
        }),
        settingsApi.createOrUpdate({
          key: 'expense_ads',
          value: expenses.ads.toString(),
          category: 'finance',
          description: 'Monthly ads cost'
        }),
        settingsApi.createOrUpdate({
          key: 'expense_equipment',
          value: expenses.equipment.toString(),
          category: 'finance',
          description: 'Monthly equipment cost'
        })
      ]);

      setShowSettings(false);
      fetchData();
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const getPeriodText = (period: string) => {
    switch (period) {
      case 'daily': return 'Günlük';
      case 'weekly': return 'Haftalık';
      case 'monthly': return 'Aylık';
      case 'yearly': return 'Yıllık';
      default: return 'Aylık';
    }
  };

  const getMonthName = (monthStr: string) => {
    const date = new Date(monthStr + '-01');
    return date.toLocaleDateString('tr-TR', { month: 'long' });
  };

  if (loading || !dashboardData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const data = {
    revenue: dashboardData.revenue || 0,
    tax: dashboardData.tax || 0,
    expenses: dashboardData.expenses || {},
    netProfit: dashboardData.netProfit || 0,
    totalExpenses: dashboardData.totalExpenses || 0
  };

  const profitMargin = dashboardData.profitMargin || 0;

  const expenseBreakdown = [
    { name: 'Reklam', amount: data.expenses.ads || 0, color: 'from-amber-400 to-orange-500', bgColor: 'bg-gradient-to-br from-amber-50 to-orange-50', textColor: 'text-orange-600', icon: <Megaphone className="w-5 h-5" /> },
    { name: 'Ekipman', amount: data.expenses.equipment || 0, color: 'from-sky-400 to-cyan-500', bgColor: 'bg-gradient-to-br from-sky-50 to-cyan-50', textColor: 'text-cyan-600', icon: <CreditCard className="w-5 h-5" /> },
    { name: 'Hosting', amount: data.expenses.hosting || 0, color: 'from-teal-400 to-emerald-500', bgColor: 'bg-gradient-to-br from-teal-50 to-emerald-50', textColor: 'text-emerald-600', icon: <Server className="w-5 h-5" /> },
    { name: 'Domain', amount: data.expenses.domain || 0, color: 'from-blue-400 to-sky-500', bgColor: 'bg-gradient-to-br from-blue-50 to-sky-50', textColor: 'text-sky-600', icon: <Globe className="w-5 h-5" /> },
  ].filter(item => item.amount > 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-cyan-50 -m-8 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent">
                  Finans Yönetimi
                </h1>
              </div>
            </div>
            <p className="text-slate-600">Gelir, gider ve vergi hesaplamalarını gerçek zamanlı takip edin</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="group flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-slate-200 text-slate-700 rounded-xl hover:border-sky-400 hover:bg-sky-50 transition-all duration-300 font-semibold shadow-sm hover:shadow-md"
            >
              <Settings className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
              Ayarlar
            </button>
            <div className="flex gap-1 bg-white p-1 rounded-xl border-2 border-slate-200 shadow-sm">
              <button
                onClick={() => setSelectedPeriod('daily')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                  selectedPeriod === 'daily'
                    ? 'bg-gradient-to-br from-sky-500 to-cyan-600 text-white shadow-lg shadow-sky-500/30'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Günlük
              </button>
              <button
                onClick={() => setSelectedPeriod('weekly')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                  selectedPeriod === 'weekly'
                    ? 'bg-gradient-to-br from-sky-500 to-cyan-600 text-white shadow-lg shadow-sky-500/30'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Haftalık
              </button>
              <button
                onClick={() => setSelectedPeriod('monthly')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                  selectedPeriod === 'monthly'
                    ? 'bg-gradient-to-br from-sky-500 to-cyan-600 text-white shadow-lg shadow-sky-500/30'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Aylık
              </button>
              <button
                onClick={() => setSelectedPeriod('yearly')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                  selectedPeriod === 'yearly'
                    ? 'bg-gradient-to-br from-sky-500 to-cyan-600 text-white shadow-lg shadow-sky-500/30'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Yıllık
              </button>
            </div>
          </div>
        </div>

        {showSettings && (
          <div className="bg-white rounded-2xl border-2 border-sky-200 p-8 shadow-2xl shadow-sky-500/10 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-600 flex items-center justify-center">
                  <Settings className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Finans Ayarları</h2>
              </div>
              <button
                onClick={() => setShowSettings(false)}
                className="w-10 h-10 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all duration-300 flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
                    <Receipt className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Aylık Giderler</h3>
                </div>
                <div className="space-y-4">
                  <div className="group">
                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                      <Server className="w-4 h-4 text-emerald-600" />
                      Hosting Maliyeti
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-semibold">₺</span>
                      <input
                        type="number"
                        value={expenses.hosting}
                        onChange={(e) => setExpenses({ ...expenses, hosting: Number(e.target.value) })}
                        className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-300 font-semibold group-hover:border-slate-300"
                      />
                    </div>
                  </div>
                  <div className="group">
                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                      <Globe className="w-4 h-4 text-sky-600" />
                      Domain Maliyeti
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-semibold">₺</span>
                      <input
                        type="number"
                        value={expenses.domain}
                        onChange={(e) => setExpenses({ ...expenses, domain: Number(e.target.value) })}
                        className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-300 font-semibold group-hover:border-slate-300"
                      />
                    </div>
                  </div>
                  <div className="group">
                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                      <Megaphone className="w-4 h-4 text-orange-600" />
                      Reklam Harcaması
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-semibold">₺</span>
                      <input
                        type="number"
                        value={expenses.ads}
                        onChange={(e) => setExpenses({ ...expenses, ads: Number(e.target.value) })}
                        className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-300 font-semibold group-hover:border-slate-300"
                      />
                    </div>
                  </div>
                  <div className="group">
                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-cyan-600" />
                      Ekipman Gideri
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-semibold">₺</span>
                      <input
                        type="number"
                        value={expenses.equipment}
                        onChange={(e) => setExpenses({ ...expenses, equipment: Number(e.target.value) })}
                        className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-300 font-semibold group-hover:border-slate-300"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center">
                    <Receipt className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Vergi Ayarları</h3>
                </div>
                <div className="group">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Vergi Oranı
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={taxRate}
                      onChange={(e) => setTaxRate(Number(e.target.value))}
                      min="0"
                      max="100"
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-300 font-semibold group-hover:border-slate-300"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-semibold">%</span>
                  </div>
                  <p className="text-sm text-slate-500 mt-2 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
                    Yaygın oranlar: %1, %8, %10, %20
                  </p>
                </div>

                <div className="bg-gradient-to-br from-sky-50 to-cyan-50 border-2 border-sky-200 rounded-xl p-6 space-y-4">
                  <h4 className="font-bold text-slate-900 flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-sky-600" />
                    Özet Bilgiler
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 font-medium">Toplam Aylık Gider</span>
                      <span className="text-xl font-bold text-slate-900">
                        ₺{(expenses.hosting + expenses.domain + expenses.ads + expenses.equipment).toLocaleString()}
                      </span>
                    </div>
                    <div className="h-px bg-gradient-to-r from-transparent via-sky-300 to-transparent"></div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 font-medium">Vergi Oranı</span>
                      <span className="text-xl font-bold text-rose-600">%{taxRate}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-5">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <TrendingUp className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-1">Otomatik Hesaplama</h4>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        Değerleri güncelledikçe tüm finans raporları anlık olarak yeniden hesaplanır.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3 pt-6 border-t-2 border-slate-100">
              <button
                onClick={() => setShowSettings(false)}
                className="px-6 py-3 border-2 border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-all duration-300 font-semibold"
              >
                İptal
              </button>
              <button
                onClick={handleSaveSettings}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-sky-500 to-cyan-600 text-white rounded-xl hover:from-sky-600 hover:to-cyan-700 transition-all duration-300 font-semibold shadow-lg shadow-sky-500/30 hover:shadow-xl hover:shadow-sky-500/40"
              >
                <Save className="w-5 h-5" />
                Kaydet
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0 mt-0.5">
              <X className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-red-900 mb-1">Hata</h3>
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="group relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 border-2 border-slate-100 hover:border-emerald-200 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-400/20 to-teal-500/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform duration-500">
                  <DollarSign className="w-7 h-7 text-white" />
                </div>
                <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                  <ArrowUpRight className="w-4 h-4" />
                  <span className="text-sm font-bold">+12%</span>
                </div>
              </div>
              <p className="text-sm font-semibold text-slate-600 mb-1">{getPeriodText(selectedPeriod)} Gelir</p>
              <p className="text-4xl font-bold bg-gradient-to-br from-emerald-600 to-teal-700 bg-clip-text text-transparent">
                ₺{Math.round(data.revenue).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="group relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 border-2 border-slate-100 hover:border-rose-200 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-rose-400/20 to-red-500/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-rose-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-rose-500/30 group-hover:scale-110 transition-transform duration-500">
                  <Receipt className="w-7 h-7 text-white" />
                </div>
                <div className="flex items-center gap-1 text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                  <span className="text-sm font-bold">%{dashboardData.taxRate}</span>
                </div>
              </div>
              <p className="text-sm font-semibold text-slate-600 mb-1">Vergi Tutarı</p>
              <p className="text-4xl font-bold bg-gradient-to-br from-rose-600 to-red-700 bg-clip-text text-transparent">
                ₺{Math.round(data.tax).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="group relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 border-2 border-slate-100 hover:border-amber-200 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-400/20 to-orange-500/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/30 group-hover:scale-110 transition-transform duration-500">
                  <PieChart className="w-7 h-7 text-white" />
                </div>
                <div className="flex items-center gap-1 text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
                  <ArrowDownRight className="w-4 h-4" />
                  <span className="text-sm font-bold">-8%</span>
                </div>
              </div>
              <p className="text-sm font-semibold text-slate-600 mb-1">Toplam Gider</p>
              <p className="text-4xl font-bold bg-gradient-to-br from-amber-600 to-orange-700 bg-clip-text text-transparent">
                ₺{Math.round(data.totalExpenses).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="group relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 border-2 border-slate-100 hover:border-sky-200 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-sky-400/20 to-cyan-500/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-sky-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg shadow-sky-500/30 group-hover:scale-110 transition-transform duration-500">
                  <TrendingUp className="w-7 h-7 text-white" />
                </div>
                <div className="flex items-center gap-1 text-sky-600 bg-sky-50 px-3 py-1 rounded-full">
                  <span className="text-sm font-bold">%{profitMargin}</span>
                </div>
              </div>
              <p className="text-sm font-semibold text-slate-600 mb-1">Net Kar</p>
              <p className="text-4xl font-bold bg-gradient-to-br from-sky-600 to-cyan-700 bg-clip-text text-transparent">
                ₺{Math.round(data.netProfit).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl border-2 border-slate-100 p-8 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-600 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">6 Aylık Finans Özeti</h2>
            </div>
            {monthlyTrend.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                Henüz veri bulunmuyor
              </div>
            ) : (
              <div className="space-y-5">
                {monthlyTrend.map((month, idx) => (
                  <div key={idx} className="group relative bg-gradient-to-br from-slate-50 to-slate-50/50 hover:from-sky-50 hover:to-cyan-50 rounded-xl p-5 transition-all duration-300 border-2 border-transparent hover:border-sky-200">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-bold text-slate-900 text-lg">{getMonthName(month.month)}</span>
                      <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-full border-2 border-emerald-200">
                        <TrendingUp className="w-4 h-4 text-emerald-600" />
                        <span className="font-bold text-emerald-700">
                          +₺{Math.round(month.profit).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mb-3">
                      <div className="flex flex-col">
                        <span className="text-xs text-slate-500 font-semibold mb-1">Gelir</span>
                        <span className="font-bold text-slate-900">₺{Math.round(month.revenue).toLocaleString()}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-slate-500 font-semibold mb-1">Vergi</span>
                        <span className="font-bold text-rose-600">-₺{Math.round(month.tax).toLocaleString()}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-slate-500 font-semibold mb-1">Gider</span>
                        <span className="font-bold text-orange-600">-₺{Math.round(month.expenses).toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="relative w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-full transition-all duration-500 shadow-lg"
                        style={{ width: `${month.revenue > 0 ? (month.profit / month.revenue) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border-2 border-slate-100 p-8 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
                <PieChart className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Gider Dağılımı</h2>
            </div>
            {expenseBreakdown.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                Henüz gider kaydı bulunmuyor
              </div>
            ) : (
              <>
                <div className="space-y-5">
                  {expenseBreakdown.map((expense, idx) => {
                    const percentage = data.totalExpenses > 0 ? ((expense.amount / data.totalExpenses) * 100).toFixed(1) : 0;
                    return (
                      <div key={idx} className="group">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 ${expense.bgColor} rounded-xl flex items-center justify-center border-2 ${expense.textColor.replace('text-', 'border-')} group-hover:scale-110 transition-transform duration-300`}>
                              <div className={expense.textColor}>
                                {expense.icon}
                              </div>
                            </div>
                            <span className="font-bold text-slate-900">{expense.name}</span>
                          </div>
                          <span className="font-bold text-slate-900 text-lg">₺{Math.round(expense.amount).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 bg-slate-200 rounded-full h-3 overflow-hidden">
                            <div
                              className={`bg-gradient-to-r ${expense.color} h-full rounded-full transition-all duration-500 shadow-md`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-bold text-slate-600 w-14 text-right">{percentage}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 pt-6 border-t-2 border-slate-100">
                  <div className="flex items-center justify-between bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4">
                    <span className="font-semibold text-slate-700">Toplam Gider</span>
                    <span className="text-2xl font-bold text-slate-900">₺{Math.round(data.totalExpenses).toLocaleString()}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border-2 border-slate-100 p-8 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center">
              <Receipt className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Detaylı Kar-Zarar Analizi</h2>
          </div>
          <div className="bg-gradient-to-br from-slate-50 to-sky-50/50 rounded-xl p-8 border-2 border-slate-100">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="font-bold text-slate-900">Gelir</h3>
                </div>
                <div className="bg-white rounded-xl p-4 border-2 border-slate-200">
                  <div className="text-sm text-slate-600 font-medium mb-1">Brüt Gelir</div>
                  <div className="text-2xl font-bold text-emerald-600">₺{Math.round(data.revenue).toLocaleString()}</div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center">
                    <TrendingDown className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="font-bold text-slate-900">Kesintiler</h3>
                </div>
                <div className="space-y-3">
                  <div className="bg-white rounded-xl p-4 border-2 border-rose-200">
                    <div className="text-sm text-slate-600 font-medium mb-1">Vergi (%{dashboardData.taxRate})</div>
                    <div className="text-xl font-bold text-rose-600">-₺{Math.round(data.tax).toLocaleString()}</div>
                  </div>
                  <div className="bg-white rounded-xl p-4 border-2 border-orange-200">
                    <div className="text-sm text-slate-600 font-medium mb-1">Giderler</div>
                    <div className="text-xl font-bold text-orange-600">-₺{Math.round(data.totalExpenses).toLocaleString()}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-cyan-600 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="font-bold text-slate-900">Sonuç</h3>
                </div>
                <div className="bg-gradient-to-br from-sky-500 to-cyan-600 rounded-xl p-6 border-2 border-sky-400 shadow-xl shadow-sky-500/30">
                  <div className="text-sm text-sky-100 font-semibold mb-2">Net Kar</div>
                  <div className="text-3xl font-bold text-white mb-2">₺{Math.round(data.netProfit).toLocaleString()}</div>
                  <div className="flex items-center gap-2 text-sky-100 text-sm">
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                    Kar Marjı: %{profitMargin}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

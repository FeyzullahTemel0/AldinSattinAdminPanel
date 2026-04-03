import { useEffect, useMemo, useState } from 'react';
import { Plus, Tags, Layers3, ListTree, Package2, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { taxonomyApi } from '../lib/api';

type Brand = {
  id: string;
  name: string;
  logo_url?: string | null;
  series: Series[];
  models_without_series: Model[];
};

type Series = {
  id: string;
  brand_id: string;
  name: string;
  year_start?: number | null;
  year_end?: number | null;
  models: Model[];
};

type Model = {
  id: string;
  brand_id: string;
  series_id?: string | null;
  name: string;
  year_start?: number | null;
  year_end?: number | null;
  packages: VehiclePackage[];
};

type VehiclePackage = {
  id: string;
  model_id: string;
  name: string;
  subpackages?: VehicleSubpackage[];
};

type VehicleSubpackage = {
  id: string;
  package_id: string;
  name: string;
};

export default function TaxonomyManagementPage() {
  const NO_SERIES_VALUE = '__NO_SERIES__';
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const [brandName, setBrandName] = useState('');
  const [seriesForm, setSeriesForm] = useState({ brand_id: '', name: '' });
  const [modelForm, setModelForm] = useState({ brand_id: '', series_id: '', name: '' });
  const [packageForm, setPackageForm] = useState({ brand_id: '', series_id: '', model_id: '', name: '' });
  const [subpackageForm, setSubpackageForm] = useState({ brand_id: '', series_id: '', model_id: '', package_id: '', name: '' });
  const [expandedBrands, setExpandedBrands] = useState<Record<string, boolean>>({});
  const [expandedSeries, setExpandedSeries] = useState<Record<string, boolean>>({});

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const allModels = useMemo(() => {
    const models: Model[] = [];
    for (const brand of brands) {
      for (const series of brand.series) {
        models.push(...series.models);
      }
      models.push(...brand.models_without_series);
    }
    return models;
  }, [brands]);

  const seriesBySelectedBrand = useMemo(() => {
    return brands.find((b) => b.id === modelForm.brand_id)?.series ?? [];
  }, [brands, modelForm.brand_id]);

  const packageSeriesBySelectedBrand = useMemo(() => {
    return brands.find((b) => b.id === packageForm.brand_id)?.series ?? [];
  }, [brands, packageForm.brand_id]);

  const packageModelsBySelection = useMemo(() => {
    const selectedBrand = brands.find((b) => b.id === packageForm.brand_id);
    if (!selectedBrand) return [];

    if (packageForm.series_id === NO_SERIES_VALUE) {
      return selectedBrand.models_without_series;
    }

    if (!packageForm.series_id) return [];

    const selectedSeries = selectedBrand.series.find((s) => s.id === packageForm.series_id);
    return selectedSeries?.models ?? [];
  }, [brands, packageForm.brand_id, packageForm.series_id, NO_SERIES_VALUE]);

  const subpackageSeriesBySelectedBrand = useMemo(() => {
    return brands.find((b) => b.id === subpackageForm.brand_id)?.series ?? [];
  }, [brands, subpackageForm.brand_id]);

  const subpackageModelsBySelection = useMemo(() => {
    const selectedBrand = brands.find((b) => b.id === subpackageForm.brand_id);
    if (!selectedBrand) return [];

    if (subpackageForm.series_id === NO_SERIES_VALUE) {
      return selectedBrand.models_without_series;
    }

    if (!subpackageForm.series_id) return [];

    const selectedSeries = selectedBrand.series.find((s) => s.id === subpackageForm.series_id);
    return selectedSeries?.models ?? [];
  }, [brands, subpackageForm.brand_id, subpackageForm.series_id, NO_SERIES_VALUE]);

  const subpackagePackagesBySelectedModel = useMemo(() => {
    if (!subpackageForm.model_id) return [];
    return allModels.find((m) => m.id === subpackageForm.model_id)?.packages ?? [];
  }, [allModels, subpackageForm.model_id]);

  const getSubpackages = (pkg: VehiclePackage) => pkg.subpackages ?? [];

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const response = await taxonomyApi.getAll();
        const nextBrands = response.data?.brands || [];
        setBrands(nextBrands);

        if (!seriesForm.brand_id && nextBrands.length > 0) {
          setSeriesForm((prev) => ({ ...prev, brand_id: nextBrands[0].id }));
        }
        if (!modelForm.brand_id && nextBrands.length > 0) {
          setModelForm((prev) => ({ ...prev, brand_id: nextBrands[0].id }));
        }
        if (!packageForm.brand_id && nextBrands.length > 0) {
          setPackageForm((prev) => ({ ...prev, brand_id: nextBrands[0].id }));
        }
        if (!subpackageForm.brand_id && nextBrands.length > 0) {
          setSubpackageForm((prev) => ({ ...prev, brand_id: nextBrands[0].id }));
        }
      } catch (error: any) {
        setMessage({ type: 'error', text: error.message || 'Veriler yuklenemedi' });
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [refreshKey]);

  const refresh = () => setRefreshKey((v) => v + 1);

  const showSuccess = (text: string) => setMessage({ type: 'success', text });
  const showError = (error: any) => setMessage({ type: 'error', text: error?.message || 'Islem basarisiz' });

  const handleCreateBrand = async () => {
    if (!brandName.trim()) return;
    try {
      await taxonomyApi.createBrand({ name: brandName.trim() });
      setBrandName('');
      showSuccess('Marka eklendi');
      refresh();
    } catch (error) {
      showError(error);
    }
  };

  const handleCreateSeries = async () => {
    if (!seriesForm.brand_id || !seriesForm.name.trim()) return;
    try {
      await taxonomyApi.createSeries({
        brand_id: seriesForm.brand_id,
        name: seriesForm.name.trim(),
      });
      setSeriesForm((prev) => ({ ...prev, name: '' }));
      showSuccess('Seri eklendi');
      refresh();
    } catch (error) {
      showError(error);
    }
  };

  const handleCreateModel = async () => {
    if (!modelForm.brand_id || !modelForm.name.trim()) return;
    try {
      await taxonomyApi.createModel({
        brand_id: modelForm.brand_id,
        series_id: modelForm.series_id || undefined,
        name: modelForm.name.trim(),
      });
      setModelForm((prev) => ({ ...prev, name: '', series_id: '' }));
      showSuccess('Model eklendi');
      refresh();
    } catch (error) {
      showError(error);
    }
  };

  const handleCreatePackage = async () => {
    if (!packageForm.brand_id || !packageForm.series_id || !packageForm.model_id || !packageForm.name.trim()) return;
    try {
      await taxonomyApi.createPackage({ model_id: packageForm.model_id, name: packageForm.name.trim() });
      setPackageForm((prev) => ({ ...prev, model_id: '', name: '' }));
      showSuccess('Paket eklendi');
      refresh();
    } catch (error) {
      showError(error);
    }
  };

  const handleCreateSubpackage = async () => {
    if (!subpackageForm.package_id || !subpackageForm.name.trim()) return;
    try {
      await taxonomyApi.createSubpackage({ package_id: subpackageForm.package_id, name: subpackageForm.name.trim() });
      setSubpackageForm((prev) => ({ ...prev, package_id: '', name: '' }));
      showSuccess('Alt paket eklendi');
      refresh();
    } catch (error) {
      showError(error);
    }
  };

  const handleDeleteBrand = async (id: string, name: string) => {
    if (!window.confirm(`"${name}" markasini silmek istediginize emin misiniz?`)) return;
    try {
      await taxonomyApi.deleteBrand(id);
      showSuccess('Marka silindi');
      refresh();
    } catch (error) {
      showError(error);
    }
  };

  const handleDeleteSeries = async (id: string, name: string) => {
    if (!window.confirm(`"${name}" serisini silmek istediginize emin misiniz?`)) return;
    try {
      await taxonomyApi.deleteSeries(id);
      showSuccess('Seri silindi');
      refresh();
    } catch (error) {
      showError(error);
    }
  };

  const handleDeleteModel = async (id: string, name: string) => {
    if (!window.confirm(`"${name}" modelini silmek istediginize emin misiniz?`)) return;
    try {
      await taxonomyApi.deleteModel(id);
      showSuccess('Model silindi');
      refresh();
    } catch (error) {
      showError(error);
    }
  };

  const handleDeletePackage = async (id: string, name: string) => {
    if (!window.confirm(`"${name}" paketini silmek istediginize emin misiniz?`)) return;
    try {
      await taxonomyApi.deletePackage(id);
      showSuccess('Paket silindi');
      refresh();
    } catch (error) {
      showError(error);
    }
  };

  const handleDeleteSubpackage = async (id: string, name: string) => {
    if (!window.confirm(`"${name}" alt paketini silmek istediginize emin misiniz?`)) return;
    try {
      await taxonomyApi.deleteSubpackage(id);
      showSuccess('Alt paket silindi');
      refresh();
    } catch (error) {
      showError(error);
    }
  };

  const toggleBrand = (brandId: string) => {
    setExpandedBrands((prev) => ({ ...prev, [brandId]: !prev[brandId] }));
  };

  const toggleSeries = (seriesId: string) => {
    setExpandedSeries((prev) => ({ ...prev, [seriesId]: !prev[seriesId] }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Yukleniyor...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Marka Seri Model Paket</h1>
        <p className="text-gray-600">Ilan olusturma secimlerini veritabanindan yonetin</p>
      </div>

      {message && (
        <div className={`rounded-lg border px-4 py-3 text-sm ${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2"><span className="text-sm text-gray-600">Marka</span><Tags className="w-4 h-4 text-gray-500" /></div>
          <p className="text-2xl font-bold text-gray-900">{brands.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2"><span className="text-sm text-gray-600">Seri</span><Layers3 className="w-4 h-4 text-gray-500" /></div>
          <p className="text-2xl font-bold text-gray-900">{brands.reduce((sum, b) => sum + b.series.length, 0)}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2"><span className="text-sm text-gray-600">Model</span><ListTree className="w-4 h-4 text-gray-500" /></div>
          <p className="text-2xl font-bold text-gray-900">{allModels.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2"><span className="text-sm text-gray-600">Paket</span><Package2 className="w-4 h-4 text-gray-500" /></div>
          <p className="text-2xl font-bold text-gray-900">{allModels.reduce((sum, m) => sum + m.packages.length, 0)}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2"><span className="text-sm text-gray-600">Alt Paket</span><Package2 className="w-4 h-4 text-gray-500" /></div>
          <p className="text-2xl font-bold text-gray-900">{allModels.reduce((sum, m) => sum + m.packages.reduce((acc, p) => acc + getSubpackages(p).length, 0), 0)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Marka Ekle</h2>
          <form
            className="flex gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              handleCreateBrand();
            }}
          >
            <input value={brandName} onChange={(e) => setBrandName(e.target.value)} placeholder="Ornek: BMW" className="flex-1 px-3 py-2 border border-gray-300 rounded-lg" />
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center gap-2"><Plus className="w-4 h-4" /> Ekle</button>
          </form>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Seri Ekle</h2>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              handleCreateSeries();
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <select value={seriesForm.brand_id} onChange={(e) => setSeriesForm((p) => ({ ...p, brand_id: e.target.value }))} className="px-3 py-2 border border-gray-300 rounded-lg bg-white">
                <option value="">Marka sec</option>
                {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
              <input value={seriesForm.name} onChange={(e) => setSeriesForm((p) => ({ ...p, name: e.target.value }))} placeholder="Ornek: 3 Serisi" className="px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center gap-2"><Plus className="w-4 h-4" /> Ekle</button>
          </form>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Model Ekle</h2>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              handleCreateModel();
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <select value={modelForm.brand_id} onChange={(e) => setModelForm((p) => ({ ...p, brand_id: e.target.value, series_id: '' }))} className="px-3 py-2 border border-gray-300 rounded-lg bg-white">
                <option value="">Marka sec</option>
                {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
              <select value={modelForm.series_id} onChange={(e) => setModelForm((p) => ({ ...p, series_id: e.target.value }))} className="px-3 py-2 border border-gray-300 rounded-lg bg-white">
                <option value="">Seri sec (opsiyonel)</option>
                {seriesBySelectedBrand.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <input value={modelForm.name} onChange={(e) => setModelForm((p) => ({ ...p, name: e.target.value }))} placeholder="Ornek: 320i" className="px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center gap-2"><Plus className="w-4 h-4" /> Ekle</button>
          </form>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Paket Ekle</h2>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              handleCreatePackage();
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
              <select
                value={packageForm.brand_id}
                onChange={(e) => setPackageForm((p) => ({ ...p, brand_id: e.target.value, series_id: '', model_id: '' }))}
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white"
              >
                <option value="">Marka sec</option>
                {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
              <select
                value={packageForm.series_id}
                onChange={(e) => setPackageForm((p) => ({ ...p, series_id: e.target.value, model_id: '' }))}
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white"
              >
                <option value="">Seri sec</option>
                {packageSeriesBySelectedBrand.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                {packageForm.brand_id && <option value={NO_SERIES_VALUE}>Serisiz modeller</option>}
              </select>
              <select
                value={packageForm.model_id}
                onChange={(e) => setPackageForm((p) => ({ ...p, model_id: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white"
              >
                <option value="">Model sec</option>
                {packageModelsBySelection.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
              <input value={packageForm.name} onChange={(e) => setPackageForm((p) => ({ ...p, name: e.target.value }))} placeholder="Ornek: M Sport" className="px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center gap-2"><Plus className="w-4 h-4" /> Ekle</button>
          </form>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4 xl:col-span-2">
          <h2 className="text-lg font-semibold text-gray-900">Paket Icine Paket Ekle</h2>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              handleCreateSubpackage();
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
              <select
                value={subpackageForm.brand_id}
                onChange={(e) => setSubpackageForm((p) => ({ ...p, brand_id: e.target.value, series_id: '', model_id: '', package_id: '' }))}
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white"
              >
                <option value="">Marka sec</option>
                {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
              <select
                value={subpackageForm.series_id}
                onChange={(e) => setSubpackageForm((p) => ({ ...p, series_id: e.target.value, model_id: '', package_id: '' }))}
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white"
              >
                <option value="">Seri sec</option>
                {subpackageSeriesBySelectedBrand.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                {subpackageForm.brand_id && <option value={NO_SERIES_VALUE}>Serisiz modeller</option>}
              </select>
              <select
                value={subpackageForm.model_id}
                onChange={(e) => setSubpackageForm((p) => ({ ...p, model_id: e.target.value, package_id: '' }))}
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white"
              >
                <option value="">Model sec</option>
                {subpackageModelsBySelection.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
              <select
                value={subpackageForm.package_id}
                onChange={(e) => setSubpackageForm((p) => ({ ...p, package_id: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white"
              >
                <option value="">Paket sec (or: 35 TFSI)</option>
                {subpackagePackagesBySelectedModel.map((pkg) => (
                  <option key={pkg.id} value={pkg.id}>{pkg.name}</option>
                ))}
              </select>
              <input value={subpackageForm.name} onChange={(e) => setSubpackageForm((p) => ({ ...p, name: e.target.value }))} placeholder="Ornek: Design / Sport" className="px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center gap-2"><Plus className="w-4 h-4" /> Ekle</button>
          </form>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Markaya Gore Liste</h2>

        <div className="space-y-5">
          {brands.map((brand) => {
            const isBrandExpanded = !!expandedBrands[brand.id];

            return (
              <div key={brand.id} className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between gap-3">
                  <button onClick={() => toggleBrand(brand.id)} className="inline-flex items-center gap-2 text-left">
                    {isBrandExpanded ? <ChevronDown className="w-4 h-4 text-gray-600" /> : <ChevronRight className="w-4 h-4 text-gray-600" />}
                    <h3 className="font-semibold text-gray-900">{brand.name}</h3>
                  </button>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">{brand.series.length + brand.models_without_series.length} grup</span>
                    <button
                      onClick={() => handleDeleteBrand(brand.id, brand.name)}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-700 border border-red-200 rounded-md hover:bg-red-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Sil
                    </button>
                  </div>
                </div>
                {isBrandExpanded && (
                <div className="p-4 space-y-4">
                  {brand.series.map((series) => (
                    <div key={series.id} className="border border-gray-200 rounded-lg">
                      <div className="px-3 py-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between gap-3">
                        <button onClick={() => toggleSeries(series.id)} className="inline-flex items-center gap-2 text-left">
                          {expandedSeries[series.id] ? <ChevronDown className="w-4 h-4 text-gray-600" /> : <ChevronRight className="w-4 h-4 text-gray-600" />}
                          <div className="text-sm font-medium text-gray-800">Seri: {series.name}</div>
                        </button>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">{series.models.length} model</span>
                          <button
                            onClick={() => handleDeleteSeries(series.id, series.name)}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-700 border border-red-200 rounded-md hover:bg-red-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Sil
                          </button>
                        </div>
                      </div>
                      {expandedSeries[series.id] && (
                      <div className="p-3 space-y-2">
                        {series.models.length === 0 ? (
                          <div className="text-sm text-gray-500">Bu seri altinda model yok</div>
                        ) : (
                          series.models.map((model) => (
                            <div key={model.id} className="border border-gray-100 rounded-md">
                              <div className="px-3 py-2 bg-white flex items-center justify-between gap-3">
                                <div className="text-sm text-gray-800">Model: {model.name}</div>
                                <button
                                  onClick={() => handleDeleteModel(model.id, model.name)}
                                  className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-700 border border-red-200 rounded-md hover:bg-red-50"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  Sil
                                </button>
                              </div>
                              <div className="px-3 pb-3 pt-1 flex flex-wrap gap-2">
                                {model.packages.length === 0 ? (
                                  <span className="text-xs text-gray-500">Paket yok</span>
                                ) : (
                                  model.packages.map((pkg) => (
                                    <span key={pkg.id} className="inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs border border-gray-200 bg-gray-50 text-gray-700">
                                      <span>{pkg.name}</span>
                                      {getSubpackages(pkg).length > 0 && (
                                        <span className="text-[11px] text-gray-500">({getSubpackages(pkg).map((sp) => sp.name).join(' / ')})</span>
                                      )}
                                      {getSubpackages(pkg).map((sp) => (
                                        <button
                                          key={sp.id}
                                          onClick={() => handleDeleteSubpackage(sp.id, sp.name)}
                                          className="text-amber-600 hover:text-amber-700"
                                          title={`Alt paketi sil: ${sp.name}`}
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      ))}
                                      <button
                                        onClick={() => handleDeletePackage(pkg.id, pkg.name)}
                                        className="text-red-600 hover:text-red-700"
                                        title="Paketi sil"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </span>
                                  ))
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                      )}
                    </div>
                  ))}

                  {brand.models_without_series.length > 0 && (
                    <div className="border border-gray-200 rounded-lg">
                      <div className="px-3 py-2 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-800">Serisiz Modeller</div>
                      <div className="p-3 space-y-2">
                        {brand.models_without_series.map((model) => (
                          <div key={model.id} className="border border-gray-100 rounded-md">
                            <div className="px-3 py-2 bg-white flex items-center justify-between gap-3">
                              <div className="text-sm text-gray-800">Model: {model.name}</div>
                              <button
                                onClick={() => handleDeleteModel(model.id, model.name)}
                                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-700 border border-red-200 rounded-md hover:bg-red-50"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Sil
                              </button>
                            </div>
                            <div className="px-3 pb-3 pt-1 flex flex-wrap gap-2">
                              {model.packages.length === 0 ? (
                                <span className="text-xs text-gray-500">Paket yok</span>
                              ) : (
                                model.packages.map((pkg) => (
                                  <span key={pkg.id} className="inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs border border-gray-200 bg-gray-50 text-gray-700">
                                    <span>{pkg.name}</span>
                                    {getSubpackages(pkg).length > 0 && (
                                      <span className="text-[11px] text-gray-500">({getSubpackages(pkg).map((sp) => sp.name).join(' / ')})</span>
                                    )}
                                    {getSubpackages(pkg).map((sp) => (
                                      <button
                                        key={sp.id}
                                        onClick={() => handleDeleteSubpackage(sp.id, sp.name)}
                                        className="text-amber-600 hover:text-amber-700"
                                        title={`Alt paketi sil: ${sp.name}`}
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    ))}
                                    <button
                                      onClick={() => handleDeletePackage(pkg.id, pkg.name)}
                                      className="text-red-600 hover:text-red-700"
                                      title="Paketi sil"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </span>
                                ))
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {brand.series.length === 0 && brand.models_without_series.length === 0 && (
                    <div className="text-sm text-gray-500">Bu marka icin henuz veri yok</div>
                  )}
                </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

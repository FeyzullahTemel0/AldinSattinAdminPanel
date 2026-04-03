import { useEffect, useMemo, useState } from 'react';
import { Car, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { marketListingsApi } from '../lib/api';

interface Listing {
  id: string;
  title: string;
  brand_name?: string;
  model_name?: string;
  seller_type: string;
  year: number;
  price: number;
  mileage: number;
  city?: string;
  status: string;
  created_at: string;
}

interface MetaData {
  brands: Array<{ id: string; name: string }>;
  models: Array<{ id: string; name: string; brand_id: string }>;
  user_profiles: Array<{ id: string; full_name: string; email: string }>;
  dealer_businesses: Array<{ id: string; business_name: string }>;
  statuses: string[];
}

export default function MarketplaceListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [meta, setMeta] = useState<MetaData>({ brands: [], models: [], user_profiles: [], dealer_businesses: [], statuses: [] });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [sellerTypeFilter, setSellerTypeFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [creating, setCreating] = useState(false);

  const [form, setForm] = useState({
    title: '',
    seller_type: 'individual',
    brand_id: '',
    model_id: '',
    price: '',
    year: '',
    mileage: '',
    city: '',
    status: 'active',
  });

  const filteredModels = useMemo(() => {
    if (!form.brand_id) return meta.models;
    return meta.models.filter((m) => m.brand_id === form.brand_id);
  }, [form.brand_id, meta.models]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (sellerTypeFilter !== 'all') params.seller_type = sellerTypeFilter;
      if (searchTerm.trim()) params.search = searchTerm.trim();

      const [listingsResponse, metaResponse] = await Promise.all([
        marketListingsApi.getAll(params),
        marketListingsApi.getMeta(),
      ]);

      const fetchedListings = listingsResponse.data || [];
      const fetchedMeta = metaResponse.data || { brands: [], models: [], user_profiles: [], dealer_businesses: [], statuses: [] };

      setListings(fetchedListings);
      setMeta(fetchedMeta);

      if (!form.brand_id && fetchedMeta.brands.length > 0) {
        setForm((prev) => ({ ...prev, brand_id: fetchedMeta.brands[0].id }));
      }
      if (fetchedMeta.statuses.length > 0 && !fetchedMeta.statuses.includes(form.status)) {
        setForm((prev) => ({ ...prev, status: fetchedMeta.statuses[0] }));
      }
    } catch (error) {
      console.error('Error fetching market listing data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, sellerTypeFilter, searchTerm]);

  const createListing = async () => {
    try {
      setCreating(true);
      await marketListingsApi.create({
        title: form.title || undefined,
        seller_type: form.seller_type,
        brand_id: form.brand_id || undefined,
        model_id: form.model_id || undefined,
        price: form.price ? Number(form.price) : undefined,
        year: form.year ? Number(form.year) : undefined,
        mileage: form.mileage ? Number(form.mileage) : undefined,
        city: form.city || undefined,
        status: form.status,
      });

      setForm({
        title: '',
        seller_type: 'individual',
        brand_id: meta.brands[0]?.id || '',
        model_id: '',
        price: '',
        year: '',
        mileage: '',
        city: '',
        status: 'active',
      });

      await fetchData();
    } catch (error) {
      console.error('Error creating market listing:', error);
    } finally {
      setCreating(false);
    }
  };

  const setListingStatus = async (id: string, status: string) => {
    try {
      await marketListingsApi.update(id, { status });
      await fetchData();
    } catch (error) {
      console.error('Error updating market listing status:', error);
    }
  };

  const deleteListing = async (id: string) => {
    try {
      await marketListingsApi.delete(id);
      await fetchData();
    } catch (error) {
      console.error('Error deleting market listing:', error);
    }
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Pazar Ilanlari</h1>
          <p className="text-gray-600">Canli vehicle_listings tablosu uzerinden ilan yonetimi</p>
        </div>
        <button
          onClick={fetchData}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
        >
          <RefreshCw className="w-4 h-4" /> Yenile
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
          <input
            type="text"
            placeholder="Ilan basligi"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          />
          <select
            value={form.brand_id}
            onChange={(e) => setForm({ ...form, brand_id: e.target.value, model_id: '' })}
            className="px-3 py-2 border border-gray-300 rounded-lg bg-white"
          >
            <option value="">Marka sec</option>
            {meta.brands.map((brand) => (
              <option key={brand.id} value={brand.id}>{brand.name}</option>
            ))}
          </select>
          <select
            value={form.model_id}
            onChange={(e) => setForm({ ...form, model_id: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg bg-white"
          >
            <option value="">Model sec</option>
            {filteredModels.map((model) => (
              <option key={model.id} value={model.id}>{model.name}</option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Fiyat"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          />
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg bg-white"
          >
            {(meta.statuses.length > 0 ? meta.statuses : ['active']).map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          <button
            disabled={creating}
            onClick={createListing}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60"
          >
            <Plus className="w-4 h-4" /> Olustur
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            type="text"
            placeholder="Ara (baslik/marka/model)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg bg-white"
          >
            <option value="all">Tum durumlar</option>
            {meta.statuses.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          <select
            value={sellerTypeFilter}
            onChange={(e) => setSellerTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg bg-white"
          >
            <option value="all">Tum saticilar</option>
            <option value="individual">individual</option>
            <option value="dealer">dealer</option>
          </select>
          <div className="flex items-center justify-end text-sm text-gray-600">
            Toplam: {listings.length}
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 text-xs font-medium uppercase text-gray-600">Ilan</th>
                <th className="text-left py-3 px-4 text-xs font-medium uppercase text-gray-600">Arac</th>
                <th className="text-left py-3 px-4 text-xs font-medium uppercase text-gray-600">Fiyat/KM</th>
                <th className="text-left py-3 px-4 text-xs font-medium uppercase text-gray-600">Satici</th>
                <th className="text-left py-3 px-4 text-xs font-medium uppercase text-gray-600">Durum</th>
                <th className="text-left py-3 px-4 text-xs font-medium uppercase text-gray-600">Islem</th>
              </tr>
            </thead>
            <tbody>
              {listings.map((listing) => (
                <tr key={listing.id} className="border-b border-gray-100">
                  <td className="py-3 px-4">
                    <div className="font-medium text-gray-900">{listing.title || 'Baslik yok'}</div>
                    <div className="text-xs text-gray-500">{new Date(listing.created_at).toLocaleString('tr-TR')}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="inline-flex items-center gap-2 text-gray-800">
                      <Car className="w-4 h-4 text-gray-500" />
                      {listing.brand_name || '-'} / {listing.model_name || '-'}
                    </div>
                    <div className="text-xs text-gray-500">{listing.year || '-'} • {listing.city || '-'}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-gray-900">{Number(listing.price || 0).toLocaleString('tr-TR')} TL</div>
                    <div className="text-xs text-gray-500">{Number(listing.mileage || 0).toLocaleString('tr-TR')} km</div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-700">{listing.seller_type}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">{listing.status}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <select
                        value={listing.status}
                        onChange={(e) => setListingStatus(listing.id, e.target.value)}
                        className="px-2 py-1 text-xs border border-gray-300 rounded-lg bg-white"
                      >
                        {meta.statuses.map((status) => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => deleteListing(listing.id)}
                        className="p-2 rounded hover:bg-red-50 text-red-600"
                        title="Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {listings.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-gray-500">Kayit bulunamadi</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

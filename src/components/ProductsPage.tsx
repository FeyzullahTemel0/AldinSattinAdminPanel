import { useEffect, useMemo, useState } from 'react';
import { Search, Filter, Download, Edit, Trash2, Eye, Package } from 'lucide-react';
import { adsApi } from '../lib/api';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: 'in-stock' | 'low-stock' | 'out-of-stock';
  sales: number;
  image: string;
}

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const response = await adsApi.getAll();
        const rows = response.data || [];
        const mapped: Product[] = rows.map((ad: any) => ({
          id: ad.id,
          name: ad.title || 'Basliksiz Urun',
          category: ad.category || 'general',
          price: Number(ad.price || 0),
          stock: ad.status === 'active' ? 1 : 0,
          status: ad.status === 'active' ? 'in-stock' : 'out-of-stock',
          sales: 0,
          image: (ad.brand || 'U').slice(0, 2).toUpperCase(),
        }));
        setProducts(mapped);
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || product.category.toLowerCase() === selectedCategory.toLowerCase();
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in-stock': return 'bg-green-100 text-green-700';
      case 'low-stock': return 'bg-yellow-100 text-yellow-700';
      case 'out-of-stock': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
  const totalProducts = products.length;
  const lowStockCount = products.filter((p) => p.status === 'low-stock').length;
  const outOfStockCount = products.filter((p) => p.status === 'out-of-stock').length;

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-gray-600">Yukleniyor...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Products</h1>
          <p className="text-gray-600">Manage your product inventory and stock levels.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4"><div className="flex items-center gap-3 mb-2"><div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center"><Package className="w-5 h-5 text-blue-600" /></div><p className="text-sm text-gray-600">Total Products</p></div><p className="text-2xl font-bold text-gray-900">{totalProducts}</p></div>
        <div className="bg-white rounded-lg border border-gray-200 p-4"><div className="flex items-center gap-3 mb-2"><div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center"><Package className="w-5 h-5 text-green-600" /></div><p className="text-sm text-gray-600">Inventory Value</p></div><p className="text-2xl font-bold text-gray-900">${totalValue.toLocaleString()}</p></div>
        <div className="bg-white rounded-lg border border-gray-200 p-4"><div className="flex items-center gap-3 mb-2"><div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center"><Package className="w-5 h-5 text-yellow-600" /></div><p className="text-sm text-gray-600">Low Stock</p></div><p className="text-2xl font-bold text-yellow-600">{lowStockCount}</p></div>
        <div className="bg-white rounded-lg border border-gray-200 p-4"><div className="flex items-center gap-3 mb-2"><div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center"><Package className="w-5 h-5 text-red-600" /></div><p className="text-sm text-gray-600">Out of Stock</p></div><p className="text-2xl font-bold text-red-600">{outOfStockCount}</p></div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" placeholder="Search products by name or category..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg" />
          </div>
          <div className="flex flex-wrap gap-2">
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="px-4 py-2.5 border border-gray-300 rounded-lg bg-white">
              <option value="all">All Categories</option>
              {[...new Set(products.map((p) => p.category.toLowerCase()))].map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg"><Filter className="w-5 h-5 text-gray-600" /></button>
            <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg"><Download className="w-5 h-5 text-gray-600" /></button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <div key={product.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300">
            <div className="aspect-video bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center"><span className="text-4xl font-bold text-white">{product.image}</span></div>
            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1"><h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3><p className="text-sm text-gray-500">{product.category}</p></div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>{product.status.replace('-', ' ')}</span>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4 py-3 border-t border-b border-gray-100"><div><p className="text-xs text-gray-500 mb-1">Price</p><p className="text-lg font-bold text-gray-900">${product.price}</p></div><div><p className="text-xs text-gray-500 mb-1">Stock</p><p className="text-lg font-bold text-gray-900">{product.stock}</p></div></div>
              <div className="flex gap-2"><button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium"><Eye className="w-4 h-4" />View</button><button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium"><Edit className="w-4 h-4" />Edit</button><button className="px-3 py-2 border border-red-300 text-red-600 rounded-lg"><Trash2 className="w-4 h-4" /></button></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

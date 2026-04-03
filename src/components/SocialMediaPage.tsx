import { useState, useEffect } from 'react';
import { Facebook, Instagram, Twitter, Youtube, Linkedin, Send, Mail, MessageCircle, ExternalLink, TrendingUp, Users, Heart, Share2, Plus, Trash2 } from 'lucide-react';
import { socialMediaApi } from '../lib/api';

interface SocialMedia {
  id: string;
  platform: string;
  ad_id?: string;
  post_title: string;
  post_content?: string;
  post_url?: string;
  status: string;
  views: number;
  likes: number;
  shares: number;
  created_at: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

export default function SocialMediaPage() {
  const [socialMedias, setSocialMedias] = useState<SocialMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSocialMedias();
  }, []);

  const getPlatformConfig = (platform: string) => {
    const configs: Record<string, { icon: React.ReactNode; color: string; bgColor: string }> = {
      facebook: { icon: <Facebook className="w-8 h-8" />, color: 'text-blue-600', bgColor: 'bg-blue-100' },
      instagram: { icon: <Instagram className="w-8 h-8" />, color: 'text-pink-600', bgColor: 'bg-pink-100' },
      whatsapp: { icon: <MessageCircle className="w-8 h-8" />, color: 'text-green-600', bgColor: 'bg-green-100' },
      twitter: { icon: <Twitter className="w-8 h-8" />, color: 'text-sky-600', bgColor: 'bg-sky-100' },
      youtube: { icon: <Youtube className="w-8 h-8" />, color: 'text-red-600', bgColor: 'bg-red-100' },
      linkedin: { icon: <Linkedin className="w-8 h-8" />, color: 'text-blue-700', bgColor: 'bg-blue-100' },
      telegram: { icon: <Send className="w-8 h-8" />, color: 'text-blue-500', bgColor: 'bg-blue-100' },
      email: { icon: <Mail className="w-8 h-8" />, color: 'text-gray-600', bgColor: 'bg-gray-100' },
    };
    return configs[platform] || configs.email;
  };

  const fetchSocialMedias = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await socialMediaApi.getAll();
      const formattedData = (response.data || []).map((item: any) => ({
        ...item,
        ...getPlatformConfig(item.platform),
        views: Number(item.views || 0),
        likes: Number(item.likes || 0),
        shares: Number(item.shares || 0),
      }));

      setSocialMedias(formattedData);
    } catch (err) {
      console.error('Error fetching social medias:', err);
      setError('Sosyal medya verileri yüklenirken bir hata oluştu.');
      setSocialMedias([]);
    } finally {
      setLoading(false);
    }
  };

  const createPost = async () => {
    try {
      await socialMediaApi.create({
        platform: 'instagram',
        post_title: 'Yeni Sosyal Medya Gonderisi',
        post_content: 'Admin panelinden olusturuldu',
        status: 'draft',
      });
      await fetchSocialMedias();
    } catch (err) {
      console.error('Error creating post:', err);
    }
  };

  const publishPost = async (id: string) => {
    try {
      await socialMediaApi.update(id, { status: 'published' });
      await fetchSocialMedias();
    } catch (err) {
      console.error('Error publishing post:', err);
    }
  };

  const deletePost = async (id: string) => {
    try {
      await socialMediaApi.delete(id);
      await fetchSocialMedias();
    } catch (err) {
      console.error('Error deleting post:', err);
    }
  };

  const stats = {
    totalFollowers: socialMedias.reduce((sum, sm) => sum + sm.views, 0),
    avgEngagement: socialMedias.length > 0
      ? (socialMedias.reduce((sum, sm) => sum + sm.likes + sm.shares, 0) / socialMedias.length).toFixed(1)
      : '0',
    totalPosts: socialMedias.length,
    monthlyGrowth: 12.5
  };

  const handleOpenLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Sosyal medya verileri yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Sosyal Medya Yönetimi</h1>
        <p className="text-gray-600">Tüm sosyal medya hesaplarınıza hızlıca erişin ve yönetin.</p>
      </div>

      <button
        onClick={createPost}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 w-fit"
      >
        <Plus className="w-4 h-4" />
        Yeni Gonderi
      </button>

      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3">
          <div className="flex-1">
            <h3 className="font-semibold text-red-900 mb-1">Hata</h3>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Toplam Takipçi</p>
          <p className="text-2xl font-bold text-gray-900">{stats.totalFollowers.toLocaleString()}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
              <Heart className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Ort. Etkileşim</p>
          <p className="text-2xl font-bold text-gray-900">%{stats.avgEngagement}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
              <Share2 className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Toplam Gönderi</p>
          <p className="text-2xl font-bold text-gray-900">{stats.totalPosts.toLocaleString()}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-cyan-100 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-cyan-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Aylık Büyüme</p>
          <p className="text-2xl font-bold text-gray-900">%{stats.monthlyGrowth}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {socialMedias.map((social, idx) => (
          <div
            key={idx}
            className="bg-white rounded-xl border border-gray-200 hover:shadow-xl transition-all duration-300 overflow-hidden group"
          >
            <div className={`${social.bgColor} p-6`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`${social.color}`}>
                  {social.icon}
                </div>
                <button
                  onClick={() => handleOpenLink(social.post_url || '#')}
                  className="p-2 bg-white rounded-lg hover:scale-110 transition-transform shadow-sm"
                >
                  <ExternalLink className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              <h3 className={`text-lg font-bold ${social.color}`}>{social.post_title}</h3>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Goruntulenme</span>
                  <span className="text-lg font-bold text-gray-900">{social.views}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Etkileşim</span>
                  <span className="text-lg font-bold text-green-600">{social.likes + social.shares}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Durum</span>
                  <span className="text-lg font-bold text-gray-900">{social.status}</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-2">
                <button
                  onClick={() => publishPost(social.id)}
                  className={`py-2 ${social.bgColor} ${social.color} rounded-lg font-medium hover:shadow-md transition-all`}
                >
                  Yayina Al
                </button>
                <button
                  onClick={() => deletePost(social.id)}
                  className="py-2 rounded-lg font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-all flex items-center justify-center gap-1"
                >
                  <Trash2 className="w-4 h-4" /> Sil
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Hızlı Erişim Linkleri</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {socialMedias.map((social, idx) => (
            <button
              key={idx}
              onClick={() => handleOpenLink(social.post_url || '#')}
              className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all group"
            >
              <div className={`w-12 h-12 ${social.bgColor} rounded-lg flex items-center justify-center ${social.color}`}>
                {social.icon}
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {social.post_title}
                </p>
                <p className="text-sm text-gray-500 truncate">{social.post_url || '-'}</p>
              </div>
              <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
            </button>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl p-8 text-white">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2">Sosyal Medya İpucu</h2>
            <p className="text-blue-100">
              Düzenli paylaşım yaparak takipçilerinizle etkileşimde kalın.
              Her platform için uygun içerik türlerini kullanarak erişiminizi artırın.
            </p>
          </div>
          <div className="flex gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold mb-1">8</p>
              <p className="text-sm text-blue-100">Platform</p>
            </div>
            <div className="w-px bg-blue-400"></div>
            <div className="text-center">
              <p className="text-3xl font-bold mb-1">{stats.totalFollowers.toLocaleString()}</p>
              <p className="text-sm text-blue-100">Toplam Erişim</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

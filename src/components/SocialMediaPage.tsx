import { useState, useEffect } from 'react';
import { Facebook, Instagram, Twitter, Youtube, Linkedin, Send, Mail, MessageCircle, ExternalLink, TrendingUp, Users, Heart, Share2 } from 'lucide-react';

interface SocialMedia {
  id: string;
  name: string;
  platform: string;
  url: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  followers: string;
  engagement: string;
  posts: number;
  is_active: boolean;
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

      const mockData = [
        {
          id: '1',
          name: 'Car Platform Official',
          platform: 'facebook',
          url: 'https://facebook.com/carplatform',
          followers: '45000',
          engagement: '3.5%',
          posts: 234,
          is_active: true,
        },
      ];

      const formattedData = mockData.map(item => ({
        ...item,
        ...getPlatformConfig(item.platform)
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

  const parseFollowers = (followers: string): number => {
    const num = parseFloat(followers.replace(/[KkMm]/g, ''));
    if (followers.includes('K') || followers.includes('k')) return num * 1000;
    if (followers.includes('M') || followers.includes('m')) return num * 1000000;
    return num;
  };

  const parseEngagement = (engagement: string): number => {
    return parseFloat(engagement.replace('%', '')) || 0;
  };

  const stats = {
    totalFollowers: socialMedias.reduce((sum, sm) => sum + parseFollowers(sm.followers), 0),
    avgEngagement: socialMedias.length > 0
      ? (socialMedias.reduce((sum, sm) => sum + parseEngagement(sm.engagement), 0) / socialMedias.length).toFixed(1)
      : '0',
    totalPosts: socialMedias.reduce((sum, sm) => sum + sm.posts, 0),
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
                  onClick={() => handleOpenLink(social.url)}
                  className="p-2 bg-white rounded-lg hover:scale-110 transition-transform shadow-sm"
                >
                  <ExternalLink className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              <h3 className={`text-lg font-bold ${social.color}`}>{social.name}</h3>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Takipçi</span>
                  <span className="text-lg font-bold text-gray-900">{social.followers}</span>
                </div>

                {social.posts > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Gönderi</span>
                    <span className="text-lg font-bold text-gray-900">{social.posts}</span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Etkileşim</span>
                  <span className="text-lg font-bold text-green-600">{social.engagement}</span>
                </div>
              </div>

              <button
                onClick={() => handleOpenLink(social.url)}
                className={`mt-6 w-full py-3 ${social.bgColor} ${social.color} rounded-lg font-medium hover:shadow-md transition-all group-hover:scale-105 flex items-center justify-center gap-2`}
              >
                {social.platform === 'email' ? 'E-posta Gönder' :
                 social.platform === 'whatsapp' ? 'Mesaj Gönder' :
                 'Hesabı Aç'}
                <ExternalLink className="w-4 h-4" />
              </button>
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
              onClick={() => handleOpenLink(social.url)}
              className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all group"
            >
              <div className={`w-12 h-12 ${social.bgColor} rounded-lg flex items-center justify-center ${social.color}`}>
                {social.icon}
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {social.name}
                </p>
                <p className="text-sm text-gray-500 truncate">{social.url}</p>
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

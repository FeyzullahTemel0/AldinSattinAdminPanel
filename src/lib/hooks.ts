import { useState, useEffect } from 'react';
import { dashboardApi } from './api';

export interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  bio: string;
  avatar_url: string | null;
  language: string;
  timezone: string;
  date_format: string;
  email_notifications: boolean;
  push_notifications: boolean;
  security_alerts: boolean;
  payment_updates: boolean;
  created_at: string;
  updated_at: string;
}

export function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    return (saved as 'light' | 'dark') || 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  return { theme, setTheme };
}

export interface DashboardStats {
  totalAds: number;
  totalAdsChange: number;
  activeAds: number;
  activeDealers: number;
  activeDealersChange: number;
  carRequests: number;
  carRequestsChange: number;
  monthlyRevenue: number;
  monthlyRevenueChange: number;
  pendingAds: number;
  todayPublished: number;
  reportedAds: number;
  activeUsers: number;
}

export function useDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalAds: 0,
    totalAdsChange: 0,
    activeAds: 0,
    activeDealers: 0,
    activeDealersChange: 0,
    carRequests: 0,
    carRequestsChange: 0,
    monthlyRevenue: 0,
    monthlyRevenueChange: 0,
    pendingAds: 0,
    todayPublished: 0,
    reportedAds: 0,
    activeUsers: 0,
  });
  const [recentAds, setRecentAds] = useState<any[]>([]);
  const [carRequests, setCarRequests] = useState<any[]>([]);
  const [topDealers, setTopDealers] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      setLoading(true);
      setError(null);

      const [
        statsRes,
        adsRes,
        requestsRes,
        dealersRes,
        categoriesRes,
        activitiesRes,
      ] = await Promise.all([
        dashboardApi.getStats(),
        dashboardApi.getRecentAds(5),
        dashboardApi.getRecentRequests(4),
        dashboardApi.getTopDealers(5),
        dashboardApi.getCategoryDistribution(),
        dashboardApi.getActivities(8),
      ]);

      setStats(statsRes.data);
      setRecentAds(adsRes.data);
      setCarRequests(requestsRes.data);
      setTopDealers(dealersRes.data);
      setCategories(categoriesRes.data);
      setActivities(activitiesRes.data);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }

  return {
    stats,
    recentAds,
    carRequests,
    topDealers,
    categories,
    activities,
    loading,
    error,
    refreshDashboard: loadDashboardData,
  };
}

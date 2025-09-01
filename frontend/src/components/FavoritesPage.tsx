import React, { useState, useEffect } from 'react';
import { Job } from '../types/Job';
import { jobService } from '../services/jobService';
import { authService } from '../services/authService';
import JobCard from './JobCard';

const FavoritesPage: React.FC = () => {
  const [favorites, setFavorites] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    if (!authService.isAuthenticated()) {
      setError('请先登录');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const favoriteJobs = await jobService.getUserFavorites();
      setFavorites(favoriteJobs);
      setError(null);
    } catch (err) {
      setError('获取收藏列表失败: ' + (err instanceof Error ? err.message : '未知错误'));
    } finally {
      setLoading(false);
    }
  };

  const handleFavoriteChange = () => {
    // 当收藏状态改变时，重新加载收藏列表
    loadFavorites();
  };

  if (!authService.isAuthenticated()) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">我的收藏</h1>
            <p className="text-gray-600 mb-8">请先登录后查看您的收藏</p>
            <button
              onClick={() => window.location.href = '/'}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              返回首页
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">加载中...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">我的收藏</h1>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800">{error}</p>
            </div>
            <button
              onClick={loadFavorites}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors mr-4"
            >
              重试
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              返回首页
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">我的收藏</h1>
              <p className="text-gray-600">
                共收藏了 {favorites.length} 个工作
              </p>
            </div>
            <button
              onClick={() => window.location.href = '/'}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              返回首页
            </button>
          </div>
        </div>

        {/* 收藏列表 */}
        {favorites.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <svg
                className="mx-auto h-12 w-12 text-gray-400 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">暂无收藏</h3>
              <p className="text-gray-600 mb-6">
                您还没有收藏任何工作，去首页发现更多机会吧！
              </p>
              <button
                onClick={() => window.location.href = '/'}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                浏览工作
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onFavoriteChange={handleFavoriteChange}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;

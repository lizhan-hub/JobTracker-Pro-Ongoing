import React, { useState, useEffect } from 'react';
import { Job } from './types/Job';
import { jobService } from './services/jobService';
import { authService } from './services/authService';
import { User, AuthState, LoginRequest, RegisterRequest } from './types/Auth';
import SearchForm from './components/SearchForm';
import JobCard from './components/JobCard';
import LoginModal from './components/LoginModal';
import FavoritesPage from './components/FavoritesPage';
import ResumeUpload from './components/ResumeUpload';
import './index.css';

function App() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<'home' | 'favorites' | 'resume'>('home');

  useEffect(() => {
    // 检查用户是否已登录
    const userInfo = authService.getUser();
    if (userInfo) {
      setUser(userInfo);
    }
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const jobsData = await jobService.getAllJobs();
      setJobs(jobsData);
      setError(null);
    } catch (err) {
      setError('获取工作列表失败: ' + (err instanceof Error ? err.message : '未知错误'));
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (title: string, company: string, location: string) => {
    try {
      setLoading(true);
      const jobsData = await jobService.getAllJobs(title, company, location);
      setJobs(jobsData);
      setError(null);
    } catch (err) {
      setError('搜索失败: ' + (err instanceof Error ? err.message : '未知错误'));
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (credentials: LoginRequest) => {
    try {
      await authService.login(credentials);
      setUser(authService.getUser());
      setShowLoginModal(false);
      // 重新加载工作列表以获取收藏状态
      loadJobs();
    } catch (err) {
      alert('登录失败: ' + (err instanceof Error ? err.message : '未知错误'));
    }
  };

  const handleRegister = async (credentials: RegisterRequest) => {
    try {
      await authService.register(credentials);
      // 注册成功后自动登录
      await handleLogin(credentials);
    } catch (err) {
      alert('注册失败: ' + (err instanceof Error ? err.message : '未知错误'));
    }
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    // 重新加载工作列表以清除收藏状态
    loadJobs();
  };

  const handleFavoriteChange = () => {
    // 当收藏状态改变时，重新加载工作列表
    loadJobs();
  };

  const navigateToHome = () => {
    setCurrentPage('home');
  };

  const navigateToFavorites = () => {
    setCurrentPage('favorites');
  };

  const navigateToResume = () => {
    setCurrentPage('resume');
  };

  // 渲染简历上传页面
  if (currentPage === 'resume') {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* 导航栏 */}
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold text-gray-900">JobTracker Pro</h1>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={navigateToHome}
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  首页
                </button>
                {user ? (
                  <>
                    <button
                      onClick={navigateToFavorites}
                      className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      我的收藏
                    </button>
                    <button
                      onClick={navigateToResume}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                    >
                      简历匹配
                    </button>
                    <span className="text-gray-700 text-sm">{user.email}</span>
                    <button
                      onClick={handleLogout}
                      className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      退出
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setShowLoginModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    登录/注册
                  </button>
                )}
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ResumeUpload onFavoriteChange={handleFavoriteChange} />
        </div>
      </div>
    );
  }

  // 渲染收藏页面
  if (currentPage === 'favorites') {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* 导航栏 */}
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold text-gray-900">JobTracker Pro</h1>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={navigateToHome}
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  首页
                </button>
                {user ? (
                  <>
                    <button
                      onClick={navigateToFavorites}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                    >
                      我的收藏
                    </button>
                    <button
                      onClick={navigateToResume}
                      className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      简历匹配
                    </button>
                    <span className="text-gray-700 text-sm">{user.email}</span>
                    <button
                      onClick={handleLogout}
                      className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      退出
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setShowLoginModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    登录/注册
                  </button>
                )}
              </div>
            </div>
          </div>
        </nav>

        <FavoritesPage />
      </div>
    );
  }

  // 渲染主页
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 导航栏 */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">JobTracker Pro</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={navigateToHome}
                className="bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                首页
              </button>
              {user ? (
                <>
                  <button
                    onClick={navigateToFavorites}
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    我的收藏
                  </button>
                  <button
                    onClick={navigateToResume}
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    简历匹配
                  </button>
                  <span className="text-gray-700 text-sm">{user.email}</span>
                  <button
                    onClick={handleLogout}
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    退出
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  登录/注册
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* 主要内容 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 搜索表单 */}
        <SearchForm onSearch={handleSearch} />

        {/* 错误信息 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* 加载状态 */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">加载中...</p>
          </div>
        )}

        {/* 工作列表 */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onFavoriteChange={handleFavoriteChange}
              />
            ))}
          </div>
        )}

        {/* 空状态 */}
        {!loading && !error && jobs.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无工作</h3>
            <p className="text-gray-600">尝试调整搜索条件</p>
          </div>
        )}
      </div>

      {/* 登录模态框 */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={handleLogin}
        onRegister={handleRegister}
      />
    </div>
  );
}

export default App;


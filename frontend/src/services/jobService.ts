import { Job } from '../types/Job';
import { authService } from './authService';

// 使用相对路径，通过Vite代理访问后端
const API_BASE_URL = '/api';

class JobService {
  async getAllJobs(title: string = '', company: string = '', location: string = '', url:string = ''): Promise<Job[]> {
    const params = new URLSearchParams();
    if (title) params.append('title', title);
    if (company) params.append('company', company);
    if (location) params.append('location', location);
      if (url) params.append('url', url);

    const response = await fetch(`${API_BASE_URL}/jobs?${params.toString()}`);
    if (!response.ok) {
      throw new Error('获取工作列表失败');
    }

    const jobs: Job[] = await response.json();
    
    // 如果用户已登录，获取收藏状态
    if (authService.isAuthenticated()) {
      try {
        const favorites = await this.getUserFavorites();
        const favoriteJobIds = new Set(favorites.map(job => job.id));
        
        return jobs.map(job => ({
          ...job,
          isFavorite: favoriteJobIds.has(job.id)
        }));
      } catch (error) {
        console.error('获取收藏状态失败:', error);
        return jobs;
      }
    }

    return jobs;
  }

  async getUserFavorites(): Promise<Job[]> {
    const response = await fetch(`${API_BASE_URL}/jobs/favorites`, {
      headers: authService.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('获取收藏列表失败');
    }

    const jobs: Job[] = await response.json();
    return jobs.map(job => ({ ...job, isFavorite: true }));
  }

  async addToFavorites(jobId: number, notes?: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/favorite`, {
      method: 'POST',
      headers: {
        ...authService.getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: notes ? JSON.stringify(notes) : "{}",
    });

    if (!response.ok) {
      throw new Error('添加收藏失败');
    }
  }

  async removeFromFavorites(jobId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/favorite`, {
      method: 'DELETE',
      headers: authService.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('移除收藏失败');
    }
  }

  async getRecommendationsFromResume(file: File): Promise<Job[]> {
    const formData = new FormData();
    formData.append('resume', file);

    const response = await fetch(`${API_BASE_URL}/jobs/recommend-file`, {
      method: 'POST',
      headers: authService.getAuthHeaders(),
      body: formData,
    });

    if (!response.ok) {
      throw new Error('获取推荐工作失败');
    }

    const recommendedJobs: Job[] = await response.json();
    
    // 如果用户已登录，获取收藏状态
    if (authService.isAuthenticated()) {
      try {
        const favorites = await this.getUserFavorites();
        const favoriteJobIds = new Set(favorites.map(job => job.id));
        
        return recommendedJobs.map(job => ({
          ...job,
          isFavorite: favoriteJobIds.has(job.id)
        }));
      } catch (error) {
        console.error('获取收藏状态失败:', error);
        return recommendedJobs;
      }
    }

    return recommendedJobs;
  }
}

export const jobService = new JobService();


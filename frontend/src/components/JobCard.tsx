import React, { useState } from 'react';
import { Job } from '../types/Job';
import { jobService } from '../services/jobService';
import { authService } from '../services/authService';

interface JobCardProps {
  job: Job;
  onFavoriteChange?: () => void;
}

const JobCard: React.FC<JobCardProps> = ({ job, onFavoriteChange }) => {
  const [isFavorite, setIsFavorite] = useState(job.isFavorite || false);
  const [loading, setLoading] = useState(false);

  const handleFavoriteToggle = async () => {
    if (!authService.isAuthenticated()) {
      alert('请先登录后再收藏工作');
      return;
    }

    setLoading(true);
    try {
      if (isFavorite) {
        await jobService.removeFromFavorites(job.id);
        setIsFavorite(false);
      } else {
        await jobService.addToFavorites(job.id);
        setIsFavorite(true);
      }
      onFavoriteChange?.();
    } catch (error) {
      console.error('收藏操作失败:', error);
      alert('收藏操作失败: ' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200 border border-gray-200">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{job.title}</h3>
          <p className="text-lg text-gray-700 font-medium">{job.company}</p>
        </div>
        <button
          onClick={handleFavoriteToggle}
          disabled={loading}
          className={`ml-4 p-2 rounded-full transition-colors duration-200 ${
            isFavorite
              ? 'text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100'
              : 'text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100'
          } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          title={isFavorite ? '取消收藏' : '收藏'}
        >
          <svg
            className={`w-6 h-6 ${isFavorite ? 'fill-current' : 'stroke-current fill-none'}`}
            viewBox="0 0 24 24"
            strokeWidth={isFavorite ? 0 : 2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
            />
          </svg>
        </button>
      </div>
      
      <div className="flex items-center text-gray-600 mb-3">
        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
        </svg>
        <span>{job.location}</span>
      </div>
      
      <div className="mb-3 flex flex-wrap gap-2">
        {job.source && (
          <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded">
            来源: {job.source}
          </span>
        )}
        {job.matchScore !== undefined && (
          <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
            匹配度: {Math.round(job.matchScore * 100)}%
          </span>
        )}
      </div>
      
      {job.description && (
        <div className="mb-3">
          <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
            {job.description}
          </p>
        </div>
      )}
      
      {job.url && (
        <div className="mb-3">
          <a 
            href={job.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 text-sm underline hover:no-underline transition-colors duration-200 flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" clipRule="evenodd" />
              <path fillRule="evenodd" d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" clipRule="evenodd" />
            </svg>
            查看职位详情
          </a>
        </div>
      )}

      {!authService.isAuthenticated() && (
        <div className="mt-4 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-500 text-center">
            登录后可收藏此工作
          </p>
        </div>
      )}
    </div>
  );
};

export default JobCard;

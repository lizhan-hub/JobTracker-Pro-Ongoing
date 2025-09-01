import React, { useState, useRef } from 'react';
import { Job } from '../types/Job';
import { jobService } from '../services/jobService';
import { authService } from '../services/authService';
import JobCard from './JobCard';

interface ResumeUploadProps {
  onFavoriteChange?: () => void;
}

const ResumeUpload: React.FC<ResumeUploadProps> = ({ onFavoriteChange }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    // 检查文件类型
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      setError('请上传PDF或Word文档格式的简历');
      return;
    }

    // 检查文件大小 (10MB限制)
    if (file.size > 10 * 1024 * 1024) {
      setError('文件大小不能超过10MB');
      return;
    }

    setSelectedFile(file);
    setError(null);
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('请先选择文件');
      return;
    }

    if (!authService.isAuthenticated()) {
      setError('请先登录后再上传简历');
      return;
    }

    setUploading(true);
    setError(null);
    setRecommendedJobs([]);

    try {
      const jobs = await jobService.getRecommendationsFromResume(selectedFile);
      setRecommendedJobs(jobs);
    } catch (err) {
      setError('上传失败: ' + (err instanceof Error ? err.message : '未知错误'));
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setRecommendedJobs([]);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">简历匹配推荐</h2>
        <p className="text-gray-600 mb-6">
          上传您的简历（PDF或Word格式），我们将为您推荐最匹配的工作机会
        </p>

        {/* 文件上传区域 */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? 'border-blue-500 bg-blue-50'
              : selectedFile
              ? 'border-green-500 bg-green-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {selectedFile ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <svg className="w-12 h-12 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-lg font-medium text-gray-900">{selectedFile.name}</p>
                <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
              </div>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {uploading ? '分析中...' : '开始匹配'}
                </button>
                <button
                  onClick={handleRemoveFile}
                  disabled={uploading}
                  className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  重新选择
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div>
                <p className="text-lg font-medium text-gray-900">拖拽文件到此处或点击选择</p>
                <p className="text-sm text-gray-500">支持PDF、Word格式，最大10MB</p>
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                选择文件
              </button>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleFileInputChange}
          className="hidden"
        />

        {/* 错误信息 */}
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* 上传进度 */}
        {uploading && (
          <div className="mt-4 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600">正在分析您的简历，请稍候...</p>
          </div>
        )}
      </div>

      {/* 推荐结果 */}
      {recommendedJobs.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            为您推荐的工作 ({recommendedJobs.length}个)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onFavoriteChange={onFavoriteChange}
              />
            ))}
          </div>
        </div>
      )}

      {/* 空状态 */}
      {!uploading && recommendedJobs.length === 0 && !error && selectedFile && (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-600">暂无匹配的工作，请尝试上传其他简历或调整搜索条件</p>
        </div>
      )}
    </div>
  );
};

export default ResumeUpload;

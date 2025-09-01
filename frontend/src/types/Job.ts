export interface Job {
  id: number;           // 对应后端id (Long)
  title: string;        // 对应后端title
  company: string;      // 对应后端company
  location: string;     // 对应后端location
  source: string;       // 对应后端source
  url?: string;         // 对应后端url
  description?: string; // 对应后端description
  isFavorite?: boolean; // 是否被当前用户收藏
  matchScore?: number;  // 匹配分数 (仅用于简历推荐结果)
}

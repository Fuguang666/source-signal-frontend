import request from './request';

// ==================== 采集配置管理 ====================

export interface CollectKeyword {
  id: number;
  keyword: string;
  note: string | null;
  enabled: boolean;
  todayHits: number;
  createdAt: string;
  updatedAt: string;
}

export interface CollectSubreddit {
  id: number;
  name: string;
  enabled: boolean;
  todayNew: number;
  lastCollectedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CollectStats {
  enabledSubreddits: number;
  disabledSubreddits: number;
  enabledKeywords: number;
  todayCollected: number;
}

/** 采集器统计概览 */
export const getCollectStats = () =>
  request.get<unknown, CollectStats>('/admin/collect-config/stats');

/** 获取所有监控板块 */
export const listSubreddits = () =>
  request.get<unknown, CollectSubreddit[]>('/admin/collect-config/subreddits');

/** 新增监控板块 */
export const addSubreddit = (name: string) =>
  request.post<unknown, CollectSubreddit>('/admin/collect-config/subreddits', { name });

/** 删除监控板块 */
export const deleteSubreddit = (id: number) =>
  request.delete(`/admin/collect-config/subreddits/${id}`);

/** 启用/停用监控板块 */
export const toggleSubreddit = (id: number) =>
  request.put<unknown, CollectSubreddit>(`/admin/collect-config/subreddits/${id}/toggle`);

/** 获取所有采集关键词 */
export const listKeywords = () =>
  request.get<unknown, CollectKeyword[]>('/admin/collect-config/keywords');

/** 新增采集关键词 */
export const addKeyword = (keyword: string, note?: string) =>
  request.post<unknown, CollectKeyword>('/admin/collect-config/keywords', { keyword, note });

/** 删除采集关键词 */
export const deleteKeyword = (id: number) =>
  request.delete(`/admin/collect-config/keywords/${id}`);

/** 启用/停用采集关键词 */
export const toggleKeyword = (id: number) =>
  request.put<unknown, CollectKeyword>(`/admin/collect-config/keywords/${id}/toggle`);

// ==================== 后台用户管理 ====================

export interface AdminUser {
  id: number;
  username: string;
  email: string | null;
  company: string | null;
  enabled: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  planType: string;
  status: string;
}

export interface AdminUserPage {
  list: AdminUser[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

/** 分页查询用户列表 */
export const listAdminUsers = (params: {
  page?: number;
  size?: number;
  status?: string;
  keyword?: string;
}) => request.get<unknown, AdminUserPage>('/admin/users', { params });

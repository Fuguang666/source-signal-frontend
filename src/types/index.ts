// ===== 通用分页 =====
export interface PageResult<T> {
  list: T[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

// ===== 用户相关 =====
export interface User {
  id: number;
  username: string;
  email?: string;
  companyName?: string;
  role?: string;
  createdAt?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

// 后端 AuthResponse 结构
export interface AuthResponse {
  token: string;
  refreshToken: string;
  userId: number;
  username: string;
  email?: string;
  planType: string;
  subscriptionStatus: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  email?: string;
}

// ===== 线索相关 =====
export type Grade = 'S' | 'A' | 'B';

// 后端 LeadDTO 结构
export interface Lead {
  id: number;
  grade: Grade;
  gradeLabel: string;
  title: string;
  body: string;
  sourceUrl: string;
  author: string;
  subreddit: string;
  category: string;
  orderScale: string; // 枚举：UNKNOWN / SMALL / MEDIUM / LARGE
  needType: string;    // 枚举：FULL_AGENT / FACTORY / QC / LOGISTICS / SUPPLY_CHAIN / CONSIDERING_AGENT / BEGINNER
  region: string;       // 枚举：NORTH_AMERICA / EUROPE / SOUTHEAST_ASIA / AUSTRALIA / OTHER
  postedAt: string;
  pushedAt: string;
  marked?: boolean;
  isRead?: boolean;
  note?: string;
}

export interface LeadFilter {
  grade?: string;
  category?: string;
  region?: string;
  needType?: string;
  keyword?: string;
  marked?: boolean;
  page?: number;
  size?: number;
}

// ===== 仪表盘 =====
export interface DashboardDTO {
  todayNewLeads: number;
  todaySGradeLeads: number;
  totalLeads: number;
  unreadCount: number;
  dailySampleLimit: number;
  todaySampleUsed: number;
  trialDaysLeft: number;
  isPaid: boolean;
  monitoredCategories: string[];
  monitoredRegions: string[];
  gradeDistribution: Array<{ grade: string; count: number }>;
  categoryDistribution: Array<{ category: string; count: number }>;
  regionDistribution: Array<{ region: string; count: number }>;
  needTypeDistribution: Array<{ needType: string; count: number }>;
  weeklyTrend: Array<{ date: string; count: number }>;
  recentLeads: Lead[];
}

// ===== 订阅相关 =====
export interface Subscription {
  todaySampleUsed: number;
  planType: 'TRIAL' | 'PAID';
  planLabel: string;
  maxCategories: number;
  dailySampleLimit: number;
  monthlyPrice: number;
  trialDaysLeft: number;
  statusLabel: string;
  maxRegions: number;
  status: string;
  trialTotalDays: number;
  paidStartDate?: string;
  paidEndDate?: string;
  historyDays?: number;
}

export interface PlanInfo {
  code: string;
  name: string;
  price: string;
  priceRmb: string;
  description: string;
  features: Array<{ name: string; included: boolean }>;
  hot?: boolean;
}

// ===== 推送相关 =====
export type ChannelType = 'IN_APP' | 'EMAIL' | 'TELEGRAM' | 'WECHAT_WORK' | 'DINGTALK';

// 后端 UserPushChannel 实体
export interface PushChannel {
  id?: number;
  userId?: number;
  channel: ChannelType;
  channelName?: string;
  enabled: boolean;
  frequency?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PushRecord {
  id: number;
  userId: number;
  leadId: number;
  channel: ChannelType;
  title: string;
  content: string;
  isRead: boolean;
  sentAt: string;
  lead?: Lead;
}

// ===== 账号配置 =====
export interface UserSubscriptionConfig {
  id?: number;
  userId?: number;
  categories: string[];
  regions: string[];
  keywords: string[];
  pushFrequency: string;
  createdAt?: string;
  updatedAt?: string;
}

// ===== 枚举中文映射 =====
export const ORDER_SCALE_MAP: Record<string, string> = {
  UNKNOWN: '量级未知',
  SMALL: '小单 · 月采<1万美金',
  MEDIUM: '中单 · 1–10万美金',
  LARGE: '大单 · 10万美金以上',
};

export const NEED_TYPE_MAP: Record<string, string> = {
  FULL_AGENT: '找全链路采购代理',
  FACTORY: '找工厂代工',
  QC: '找质检服务',
  LOGISTICS: '找物流清关',
  SUPPLY_CHAIN: '找供应链合作',
  CONSIDERING_AGENT: '考虑找代理',
  BEGINNER: '新手入门咨询',
};

export const REGION_MAP: Record<string, string> = {
  NORTH_AMERICA: '北美',
  EUROPE: '欧洲',
  SOUTHEAST_ASIA: '东南亚',
  AUSTRALIA: '澳洲',
  OTHER: '其他',
};

export const translateOrderScale = (v: string) => ORDER_SCALE_MAP[v] || v;
export const translateNeedType = (v: string) => NEED_TYPE_MAP[v] || v;
export const translateRegion = (v: string) => REGION_MAP[v] || v;

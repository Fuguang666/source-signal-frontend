import request from './request';
import type { User, UserSubscriptionConfig } from '@/types';

export const accountApi = {
  getProfile: () =>
    request.get<unknown, User>('/account/profile'),

  updateProfile: (data: { email?: string; companyName?: string }) =>
    request.put<unknown, User>('/account/profile', data),

  getConfig: () =>
    request.get<unknown, UserSubscriptionConfig>('/account/config'),

  updateCategories: (categories: string[]) =>
    request.put<unknown, UserSubscriptionConfig>('/account/config/categories', { categories }),

  updateRegions: (regions: string[]) =>
    request.put<unknown, UserSubscriptionConfig>('/account/config/regions', { regions }),

  updateKeywords: (keywords: string[]) =>
    request.put<unknown, UserSubscriptionConfig>('/account/config/keywords', { keywords }),

  getPrivacy: () =>
    request.get('/account/privacy'),
};

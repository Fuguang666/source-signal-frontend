import request from './request';
import type { Subscription, PlanInfo } from '@/types';

export const subscriptionApi = {
  getSubscription: () =>
    request.get<unknown, Subscription>('/subscription'),

  getPlans: () =>
    request.get<unknown, PlanInfo[]>('/subscription/plans'),

  upgrade: () =>
    request.post('/subscription/upgrade'),

  cancel: () =>
    request.post('/subscription/cancel'),
};

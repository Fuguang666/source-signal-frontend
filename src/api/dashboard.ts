import request from './request';
import type { DashboardDTO } from '@/types';

export const dashboardApi = {
  getDashboard: () =>
    request.get<unknown, DashboardDTO>('/dashboard'),
};

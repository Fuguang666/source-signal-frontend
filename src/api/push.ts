import request from './request';
import type { PushChannel, PageResult } from '@/types';

export const pushApi = {
  getNotifications: (page = 1, size = 10) =>
    request.get<unknown, PageResult<Record<string, unknown>>>('/push/notifications', { params: { page, size } }),

  getUnreadCount: () =>
    request.get<unknown, number>('/push/notifications/unread-count'),

  readAll: () =>
    request.post('/push/notifications/read-all'),

  readOne: (leadId: number) =>
    request.post(`/push/notifications/${leadId}/read`),

  getChannels: () =>
    request.get<unknown, PushChannel[]>('/push/channels'),

  toggleChannel: (channel: string) =>
    request.post<unknown, PushChannel>(`/push/channels/${channel}/toggle`),

  // 后端路径：/push/channels/{channel}/frequency?frequency=XXX
  updateFrequency: (channel: string, frequency: string) =>
    request.post<unknown, PushChannel>(`/push/channels/${channel}/frequency`, null, { params: { frequency } }),

  sendTest: () =>
    request.post<unknown, Record<string, unknown>>('/push/test'),
};

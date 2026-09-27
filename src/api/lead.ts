import request from './request';
import type { Lead, LeadFilter, PageResult } from '@/types';

export const leadApi = {
  getLeads: (params: LeadFilter) =>
    request.get<unknown, PageResult<Lead>>('/leads', { params }),

  getLead: (id: number) =>
    request.get<unknown, Lead>(`/leads/${id}`),

  toggleMark: (id: number) =>
    request.post<unknown, Lead>(`/leads/${id}/mark`),

  saveNote: (id: number, note: string) =>
    request.post<unknown, Lead>(`/leads/${id}/note`, { note }),

  getMarkedLeads: () =>
    request.get<unknown, Lead[]>('/leads/marked'),

  getUnreadCount: () =>
    request.get<unknown, { count: number }>('/leads/unread-count'),

  markAsRead: (id: number) =>
    request.post<unknown, void>(`/leads/${id}/read`),

  markAllAsRead: () =>
    request.post<unknown, { count: number }>('/leads/read-all'),
};

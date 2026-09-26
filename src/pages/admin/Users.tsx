import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Card,
  Table,
  Select,
  Avatar,
  Tag,
  Empty,
  message,
} from 'antd';
import { listAdminUsers, type AdminUser } from '@/api/admin';
import dayjs from 'dayjs';

const statusOptions = [
  { value: 'all', label: '全部' },
  { value: 'TRIALING', label: '试用中' },
  { value: 'ACTIVE', label: '已付费' },
  { value: 'EXPIRED', label: '已到期' },
];

const statusMap: Record<string, { label: string; color: string }> = {
  TRIALING: { label: '试用中', color: 'gold' },
  ACTIVE: { label: '已付费', color: 'green' },
  EXPIRED: { label: '已到期', color: 'default' },
  CANCELLED: { label: '已取消', color: 'default' },
};

const planMap: Record<string, string> = {
  TRIAL: '试用版',
  PAID: '付费版',
  FREE: '免费版',
};

export default function AdminUsersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const currentStatus = searchParams.get('status') || 'all';
  const currentKeyword = searchParams.get('keyword') || '';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const currentSize = parseInt(searchParams.get('size') || '50', 10);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listAdminUsers({
        page: currentPage,
        size: currentSize,
        status: currentStatus,
        keyword: currentKeyword || undefined,
      });
      setUsers(res.list || []);
      setTotal(res.total || 0);
    } catch (e) {
      message.error('加载用户列表失败');
    } finally {
      setLoading(false);
    }
  }, [currentPage, currentSize, currentStatus, currentKeyword]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleStatusChange = (status: string) => {
    const params = new URLSearchParams(searchParams);
    if (status === 'all') params.delete('status');
    else params.set('status', status);
    params.set('page', '1');
    setSearchParams(params);
  };

  const handlePageChange = (page: number, size: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(page));
    params.set('size', String(size));
    setSearchParams(params);
  };

  const columns = [
    {
      title: '用户邮箱',
      dataIndex: 'email',
      key: 'email',
      render: (email: string | null, record: AdminUser) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar
            size={30}
            style={{ background: '#0F766E', fontSize: 12, fontWeight: 700, flex: 'none' }}
          >
            {(email || record.username || '?')[0].toUpperCase()}
          </Avatar>
          <div>
            <div style={{ fontWeight: 600, color: '#1E293B' }}>{email || record.username}</div>
            {email && email !== record.username && (
              <div style={{ fontSize: 11, color: '#94A3B8' }}>@{record.username}</div>
            )}
          </div>
        </div>
      ),
    },
    {
      title: '订阅状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => {
        const info = statusMap[status] || { label: status, color: 'default' };
        return <Tag color={info.color} style={{ borderRadius: 6, padding: '2px 9px', fontSize: 12, fontWeight: 700 }}>{info.label}</Tag>;
      },
    },
    {
      title: '套餐',
      dataIndex: 'planType',
      key: 'planType',
      width: 100,
      render: (plan: string) => planMap[plan] || plan,
    },
    {
      title: '注册时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 170,
      render: (t: string) => (t ? dayjs(t).format('YYYY-MM-DD HH:mm') : '—'),
    },
    {
      title: '最近登录时间',
      dataIndex: 'lastLoginAt',
      key: 'lastLoginAt',
      width: 170,
      render: (t: string | null) => (t ? dayjs(t).format('YYYY-MM-DD HH:mm') : '从未登录'),
    },
  ];

  return (
    <div>
      {/* 页面标题 */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 21, fontWeight: 700, margin: 0, letterSpacing: 0.2 }}>用户列表</h2>
        <div style={{ color: '#64748B', fontSize: 13, marginTop: 4 }}>
          全部注册用户及其订阅状态、注册与最近登录时间。
        </div>
      </div>

      {/* 筛选栏 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12.5, color: '#94A3B8' }}>订阅状态</span>
        <Select
          value={currentStatus}
          onChange={handleStatusChange}
          options={statusOptions}
          style={{ width: 140 }}
        />
        {currentKeyword && (
          <Tag
            closable
            onClose={() => {
              const params = new URLSearchParams(searchParams);
              params.delete('keyword');
              setSearchParams(params);
            }}
            style={{ fontSize: 12 }}
          >
            搜索: {currentKeyword}
          </Tag>
        )}
        <span style={{ marginLeft: 8, fontSize: 12.5, color: '#94A3B8' }}>
          共 <b style={{ color: '#1E293B' }}>{total}</b> 位用户
        </span>
      </div>

      {/* 用户表格 */}
      <Card style={{ borderRadius: 10 }} styles={{ body: { padding: 0 } }}>
        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          loading={loading}
          pagination={{
            current: currentPage,
            pageSize: currentSize,
            total,
            showSizeChanger: true,
            showTotal: (t) => `共 ${t} 位用户`,
            onChange: handlePageChange,
          }}
          locale={{ emptyText: <Empty description="没有符合条件的用户" /> }}
        />
      </Card>
    </div>
  );
}

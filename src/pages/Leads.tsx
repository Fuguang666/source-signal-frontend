import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Select, Input, Button, Table, Tooltip, message, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { leadApi } from '@/api';
import type { Lead, Grade } from '@/types';
import { translateOrderScale, translateNeedType, translateRegion } from '@/types';
import GradeBadge from '@/components/GradeBadge';
import dayjs from 'dayjs';

const CATEGORIES = ['宠物用品', '户外露营', '3C数码', '家居收纳', '服装配饰', '跨境电商物流', '未分类', '其他'];

const LeadsPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Lead[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [filters, setFilters] = useState({
    grade: undefined as string | undefined,
    category: undefined as string | undefined,
    region: undefined as string | undefined,
    needType: undefined as string | undefined,
    keyword: undefined as string | undefined,
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await leadApi.getLeads({
        page,
        size: pageSize,
        grade: filters.grade,
        category: filters.category,
        region: filters.region,
        needType: filters.needType,
        keyword: filters.keyword,
      });
      setData(res.list || []);
      setTotal(res.total || 0);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleToggleMark = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await leadApi.toggleMark(id);
      setData((prev) => prev.map((l) => (l.id === id ? { ...l, marked: res.marked } : l)));
      message.success(res.marked ? t('leads.markReviewed') : t('leads.markUnreviewed'));
    } catch {
      // 错误已处理
    }
  };

  const handleClearFilters = () => {
    setFilters({ grade: undefined, category: undefined, region: undefined, needType: undefined, keyword: undefined });
    setPage(1);
  };

  const formatTime = (timeStr: string) => {
    if (!timeStr) return '';
    const diff = dayjs().diff(dayjs(timeStr), 'hour');
    if (diff < 1) return t('dashboard.justNow');
    if (diff < 24) return `${diff}h`;
    const days = Math.floor(diff / 24);
    return days === 1 ? t('dashboard.yesterday') : `${days}d`;
  };

  const columns: ColumnsType<Lead> = [
    {
      title: t('leads.grade'),
      dataIndex: 'grade',
      key: 'grade',
      width: 80,
      render: (grade: Grade) => <GradeBadge grade={grade} />,
    },
    {
      title: t('leads.leadTitle'),
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      render: (_: string, record) => (
        <div>
          <div style={{ color: 'var(--text)', fontWeight: 500, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {record.title}
          </div>
          <div style={{ color: 'var(--text-3)', fontWeight: 400, fontSize: 12, marginTop: 2 }}>
            {record.author} · {record.subreddit}
          </div>
        </div>
      ),
    },
    {
      title: t('leads.category'),
      dataIndex: 'category',
      key: 'category',
      width: 100,
      render: (cat: string) => <Tag style={{ margin: 0 }}>{cat}</Tag>,
    },
    {
      title: t('leadDetail.orderScale'),
      dataIndex: 'orderScale',
      key: 'orderScale',
      width: 140,
      ellipsis: true,
      render: (v: string) => translateOrderScale(v),
    },
    {
      title: t('leadDetail.needType'),
      dataIndex: 'needType',
      key: 'needType',
      width: 140,
      ellipsis: true,
      render: (v: string) => translateNeedType(v),
    },
    {
      title: t('leads.region'),
      dataIndex: 'region',
      key: 'region',
      width: 80,
      render: (v: string) => translateRegion(v),
    },
    {
      title: t('leads.postedAt'),
      dataIndex: 'pushedAt',
      key: 'pushedAt',
      width: 80,
      render: (time: string) => <span className="num">{formatTime(time)}</span>,
    },
    {
      title: t('common.action'),
      key: 'action',
      width: 60,
      render: (_, record) => (
        <Tooltip title={record.marked ? t('leads.markUnreviewed') : t('leads.markReviewed')}>
          <button
            onClick={(e) => handleToggleMark(record.id, e)}
            style={{
              border: `1px solid ${record.marked ? 'var(--primary)' : 'var(--line)'}`,
              background: record.marked ? 'var(--primary-soft)' : '#fff',
              borderRadius: 7, width: 28, height: 28, display: 'grid', placeItems: 'center',
              color: record.marked ? 'var(--primary)' : 'var(--text-2)',
              cursor: 'pointer', transition: 'all .15s',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill={record.marked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.2 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8z" />
            </svg>
          </button>
        </Tooltip>
      ),
    },
  ];

  return (
    <div>
      <div className="page-head">
        <div>
          <h2>{t('leads.title')}</h2>
          <div className="desc">
            {t('leads.total')} <b className="num">{total}</b> {t('leads.itemsSuffix')}
          </div>
        </div>
        <Button onClick={() => message.info(t('notify.comingSoon'))} style={{ height: 38 }}>
          CSV
        </Button>
      </div>

      <div className="filters">
        <span className="lbl">{t('common.search')}</span>
        <Select
          allowClear
          placeholder={t('common.all') + t('leads.grade')}
          style={{ width: 110 }}
          value={filters.grade}
          onChange={(v) => { setFilters((f) => ({ ...f, grade: v })); setPage(1); }}
          options={[
            { value: 'S', label: t('grade.s') },
            { value: 'A', label: t('grade.a') },
            { value: 'B', label: t('grade.b') },
          ]}
        />
        <Select
          allowClear
          placeholder={t('common.all') + t('leads.category')}
          style={{ width: 130 }}
          value={filters.category}
          onChange={(v) => { setFilters((f) => ({ ...f, category: v })); setPage(1); }}
          options={CATEGORIES.map((c) => ({ value: c, label: c }))}
        />
        <Select
          allowClear
          placeholder={t('common.all') + t('leads.region')}
          style={{ width: 110 }}
          value={filters.region}
          onChange={(v) => { setFilters((f) => ({ ...f, region: v })); setPage(1); }}
          options={[
            { value: 'NORTH_AMERICA', label: '北美' },
            { value: 'EUROPE', label: '欧洲' },
            { value: 'SOUTHEAST_ASIA', label: '东南亚' },
            { value: 'AUSTRALIA', label: '澳洲' },
            { value: 'OTHER', label: '其他' },
          ]}
        />
        <Input.Search
          placeholder={t('leads.searchPlaceholder')}
          allowClear
          style={{ width: 180 }}
          onSearch={(v) => { setFilters((f) => ({ ...f, keyword: v || undefined })); setPage(1); }}
        />
        <button className="link-btn" onClick={handleClearFilters}>{t('common.reset')}</button>
      </div>

      <div className="ss-card">
        <Table<Lead>
          rowKey="id"
          columns={columns}
          dataSource={data}
          loading={loading}
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: false,
            showTotal: (totalCount) => `${totalCount} ${t('common.items')}`,
            onChange: (p) => setPage(p),
          }}
          onRow={(record) => ({
            onClick: () => navigate(`/lead/${record.id}`),
            style: { cursor: 'pointer' },
          })}
          scroll={{ x: 900 }}
        />
      </div>
    </div>
  );
};

export default LeadsPage;

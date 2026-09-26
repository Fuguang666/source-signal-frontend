import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
      message.success(res.marked ? '已标记为跟进中' : '已取消标记');
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
    if (diff < 1) return '刚刚';
    if (diff < 24) return `${diff}h前`;
    const days = Math.floor(diff / 24);
    return days === 1 ? '昨天' : `${days}天前`;
  };

  const columns: ColumnsType<Lead> = [
    {
      title: '等级',
      dataIndex: 'grade',
      key: 'grade',
      width: 80,
      render: (grade: Grade) => <GradeBadge grade={grade} />,
    },
    {
      title: '线索摘要',
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
      title: '品类',
      dataIndex: 'category',
      key: 'category',
      width: 100,
      render: (cat: string) => <Tag style={{ margin: 0 }}>{cat}</Tag>,
    },
    {
      title: '量级',
      dataIndex: 'orderScale',
      key: 'orderScale',
      width: 140,
      ellipsis: true,
      render: (v: string) => translateOrderScale(v),
    },
    {
      title: '需求类型',
      dataIndex: 'needType',
      key: 'needType',
      width: 140,
      ellipsis: true,
      render: (v: string) => translateNeedType(v),
    },
    {
      title: '地区',
      dataIndex: 'region',
      key: 'region',
      width: 80,
      render: (v: string) => translateRegion(v),
    },
    {
      title: '时间',
      dataIndex: 'pushedAt',
      key: 'pushedAt',
      width: 80,
      render: (time: string) => <span className="num">{formatTime(time)}</span>,
    },
    {
      title: '操作',
      key: 'action',
      width: 60,
      render: (_, record) => (
        <Tooltip title={record.marked ? '取消标记' : '标记跟进'}>
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
          <h2>线索库</h2>
          <div className="desc">
            共 <b className="num">{total}</b> 条匹配线索 · 试用版可见最近 7 天 · 付费版 30 天历史并支持 CSV 导出
          </div>
        </div>
        <Button onClick={() => message.info('CSV 导出属付费版功能')} style={{ height: 38 }}>
          导出 CSV
        </Button>
      </div>

      {/* 筛选器 */}
      <div className="filters">
        <span className="lbl">筛选</span>
        <Select
          allowClear
          placeholder="全部等级"
          style={{ width: 110 }}
          value={filters.grade}
          onChange={(v) => { setFilters((f) => ({ ...f, grade: v })); setPage(1); }}
          options={[
            { value: 'S', label: 'S 级' },
            { value: 'A', label: 'A 级' },
            { value: 'B', label: 'B 级' },
          ]}
        />
        <Select
          allowClear
          placeholder="全部品类"
          style={{ width: 130 }}
          value={filters.category}
          onChange={(v) => { setFilters((f) => ({ ...f, category: v })); setPage(1); }}
          options={CATEGORIES.map((c) => ({ value: c, label: c }))}
        />
        <Select
          allowClear
          placeholder="全部地区"
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
        <Select
          allowClear
          placeholder="全部需求类型"
          style={{ width: 150 }}
          value={filters.needType}
          onChange={(v) => { setFilters((f) => ({ ...f, needType: v })); setPage(1); }}
          options={[
            { value: 'FULL_AGENT', label: '找全链路采购代理' },
            { value: 'FACTORY', label: '找工厂代工' },
            { value: 'QC', label: '找质检服务' },
            { value: 'LOGISTICS', label: '找物流清关' },
            { value: 'SUPPLY_CHAIN', label: '找供应链合作' },
            { value: 'CONSIDERING_AGENT', label: '考虑找代理' },
            { value: 'BEGINNER', label: '新手入门咨询' },
          ]}
        />
        <Input.Search
          placeholder="关键词过滤…"
          allowClear
          style={{ width: 180 }}
          onSearch={(v) => { setFilters((f) => ({ ...f, keyword: v || undefined })); setPage(1); }}
        />
        <button className="link-btn" onClick={handleClearFilters}>清除筛选</button>
      </div>

      {/* 线索表格 */}
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
            showTotal: (t) => `共 ${t} 条`,
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

import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Table,
  Button,
  Switch,
  Modal,
  Input,
  Form,
  message,
  Popconfirm,
  Tag,
  Empty,
} from 'antd';
import { PlusOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import {
  getCollectStats,
  listSubreddits,
  addSubreddit,
  deleteSubreddit,
  toggleSubreddit,
  listKeywords,
  addKeyword,
  deleteKeyword,
  toggleKeyword,
  type CollectStats,
  type CollectSubreddit,
  type CollectKeyword,
} from '@/api/admin';
import dayjs from 'dayjs';

export default function AdminCollectorsPage() {
  const [stats, setStats] = useState<CollectStats | null>(null);
  const [subreddits, setSubreddits] = useState<CollectSubreddit[]>([]);
  const [keywords, setKeywords] = useState<CollectKeyword[]>([]);
  const [loading, setLoading] = useState(false);
  const [subModalOpen, setSubModalOpen] = useState(false);
  const [kwModalOpen, setKwModalOpen] = useState(false);
  const [subForm] = Form.useForm();
  const [kwForm] = Form.useForm();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, subsRes, kwsRes] = await Promise.all([
        getCollectStats(),
        listSubreddits(),
        listKeywords(),
      ]);
      setStats(statsRes);
      setSubreddits(subsRes);
      setKeywords(kwsRes);
    } catch (e) {
      message.error('加载采集配置失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ==================== 板块操作 ====================

  const handleAddSubreddit = async () => {
    try {
      const values = await subForm.validateFields();
      await addSubreddit(values.name);
      message.success('板块添加成功，已开始监控');
      setSubModalOpen(false);
      subForm.resetFields();
      loadData();
    } catch (e: any) {
      if (e?.errorFields) return;
      message.error(e?.response?.data?.message || '添加失败');
    }
  };

  const handleToggleSubreddit = async (record: CollectSubreddit) => {
    try {
      await toggleSubreddit(record.id);
      message.success(record.enabled ? `已停用采集 r/${record.name}` : `已启用采集 r/${record.name}`);
      loadData();
    } catch (e) {
      message.error('操作失败');
    }
  };

  const handleDeleteSubreddit = async (record: CollectSubreddit) => {
    try {
      await deleteSubreddit(record.id);
      message.success(`已删除板块 r/${record.name}`);
      loadData();
    } catch (e) {
      message.error('删除失败');
    }
  };

  // ==================== 关键词操作 ====================

  const handleAddKeyword = async () => {
    try {
      const values = await kwForm.validateFields();
      await addKeyword(values.keyword, values.note);
      message.success('关键词添加成功');
      setKwModalOpen(false);
      kwForm.resetFields();
      loadData();
    } catch (e: any) {
      if (e?.errorFields) return;
      message.error(e?.response?.data?.message || '添加失败');
    }
  };

  const handleToggleKeyword = async (record: CollectKeyword) => {
    try {
      await toggleKeyword(record.id);
      message.success(record.enabled ? `已停用关键词「${record.keyword}」` : `已启用关键词「${record.keyword}」`);
      loadData();
    } catch (e) {
      message.error('操作失败');
    }
  };

  const handleDeleteKeyword = async (record: CollectKeyword) => {
    try {
      await deleteKeyword(record.id);
      message.success(`已删除关键词「${record.keyword}」`);
      loadData();
    } catch (e) {
      message.error('删除失败');
    }
  };

  const formatTime = (t: string | null) => {
    if (!t) return '—';
    const diff = dayjs().diff(dayjs(t), 'minute');
    if (diff < 1) return '刚刚';
    if (diff < 60) return `${diff} 分钟前`;
    if (diff < 1440) return `${Math.floor(diff / 60)} 小时前`;
    return dayjs(t).format('YYYY-MM-DD HH:mm');
  };

  const statCards = [
    { label: '监控中板块', value: stats?.enabledSubreddits ?? 0, unit: '个', desc: '已启用采集', color: '#047857' },
    { label: '已停用板块', value: stats?.disabledSubreddits ?? 0, unit: '个', desc: '暂停采集，可随时恢复', color: '#D97706' },
    { label: '启用关键词', value: stats?.enabledKeywords ?? 0, unit: '个', desc: '命中即进入打标队列', color: '#0F766E' },
    { label: '今日已采集信号', value: stats?.todayCollected ?? 0, unit: '条', desc: '近 24 小时新帖数', color: '#2F6FED' },
  ];

  const subColumns = [
    {
      title: '板块',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => <span style={{ fontWeight: 600, color: '#1E293B' }}>r/{name}</span>,
    },
    {
      title: '今日新线索',
      dataIndex: 'todayNew',
      key: 'todayNew',
      width: 120,
      render: (v: number, record: CollectSubreddit) => (record.enabled ? v : '—'),
    },
    {
      title: '最近采集',
      dataIndex: 'lastCollectedAt',
      key: 'lastCollectedAt',
      width: 140,
      render: (t: string | null) => formatTime(t),
    },
    {
      title: '状态',
      key: 'status',
      width: 140,
      render: (_: any, record: CollectSubreddit) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Switch checked={record.enabled} onChange={() => handleToggleSubreddit(record)} size="small" />
          <span style={{ fontSize: 12, color: record.enabled ? '#047857' : '#94A3B8' }}>
            {record.enabled ? '监控中' : '已停用'}
          </span>
        </div>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_: any, record: CollectSubreddit) => (
        <Popconfirm
          title={`确定删除板块 r/${record.name}？`}
          onConfirm={() => handleDeleteSubreddit(record)}
          okText="删除"
          cancelText="取消"
          okButtonProps={{ danger: true }}
        >
          <Button type="text" danger icon={<DeleteOutlined />} size="small" />
        </Popconfirm>
      ),
    },
  ];

  const kwColumns = [
    {
      title: '关键词',
      dataIndex: 'keyword',
      key: 'keyword',
      render: (kw: string) => <span style={{ fontWeight: 600, color: '#1E293B' }}>{kw}</span>,
    },
    {
      title: '说明',
      dataIndex: 'note',
      key: 'note',
      render: (note: string | null) => note || '—',
    },
    {
      title: '今日命中',
      dataIndex: 'todayHits',
      key: 'todayHits',
      width: 100,
      render: (v: number, record: CollectKeyword) => (record.enabled ? v : '—'),
    },
    {
      title: '状态',
      key: 'status',
      width: 140,
      render: (_: any, record: CollectKeyword) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Switch checked={record.enabled} onChange={() => handleToggleKeyword(record)} size="small" />
          <span style={{ fontSize: 12, color: record.enabled ? '#047857' : '#94A3B8' }}>
            {record.enabled ? '启用中' : '已停用'}
          </span>
        </div>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_: any, record: CollectKeyword) => (
        <Popconfirm
          title={`确定删除关键词「${record.keyword}」？`}
          onConfirm={() => handleDeleteKeyword(record)}
          okText="删除"
          cancelText="取消"
          okButtonProps={{ danger: true }}
        >
          <Button type="text" danger icon={<DeleteOutlined />} size="small" />
        </Popconfirm>
      ),
    },
  ];

  return (
    <div>
      {/* 页面标题 */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 21, fontWeight: 700, margin: 0, letterSpacing: 0.2 }}>采集器管理</h2>
        <div style={{ color: '#64748B', fontSize: 13, marginTop: 4 }}>
          管理正在监控的社区板块与采集关键词，变更即时生效（30秒内自动刷新缓存）。
        </div>
      </div>

      {/* 统计卡片 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 14,
          marginBottom: 20,
        }}
      >
        {statCards.map((card) => (
          <div
            key={card.label}
            style={{
              padding: '16px 18px',
              border: '1px solid #E3E8EF',
              borderLeft: `3px solid ${card.color}`,
              borderRadius: 8,
              background: '#fff',
            }}
          >
            <div style={{ fontSize: 12.5, color: '#64748B' }}>{card.label}</div>
            <div style={{ fontSize: 26, fontWeight: 700, marginTop: 6, letterSpacing: 0.3 }}>
              {card.value}
              <small style={{ fontSize: 12.5, color: '#94A3B8', fontWeight: 500, marginLeft: 3 }}>{card.unit}</small>
            </div>
            <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 3 }}>{card.desc}</div>
          </div>
        ))}
      </div>

      {/* 监控板块表格 */}
      <Card
        style={{ marginBottom: 16, borderRadius: 10 }}
        styles={{ body: { padding: 20 } }}
        title={
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#1E293B' }}>监控板块（Subreddit）</div>
            <div style={{ fontSize: 12.5, color: '#94A3B8', marginTop: 4 }}>
              实时采集这些社区的新帖；停用后该社区暂停采集，不影响其他板块。
            </div>
          </div>
        }
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setSubModalOpen(true)}>
            新增板块
          </Button>
        }
      >
        <Table
          columns={subColumns}
          dataSource={subreddits}
          rowKey="id"
          loading={loading}
          pagination={false}
          locale={{ emptyText: <Empty description="暂无监控板块" /> }}
        />
      </Card>

      {/* 采集关键词表格 */}
      <Card
        style={{ borderRadius: 10 }}
        styles={{ body: { padding: 20 } }}
        title={
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#1E293B' }}>采集关键词</div>
            <div style={{ fontSize: 12.5, color: '#94A3B8', marginTop: 4 }}>
              帖子命中任一启用关键词即进入 AI 打标队列；停用关键词不再参与初筛。
            </div>
          </div>
        }
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setKwModalOpen(true)}>
            新增关键词
          </Button>
        }
      >
        <Table
          columns={kwColumns}
          dataSource={keywords}
          rowKey="id"
          loading={loading}
          pagination={false}
          locale={{ emptyText: <Empty description="暂无采集关键词" /> }}
        />
      </Card>

      {/* 新增板块弹窗 */}
      <Modal
        title="新增监控板块"
        open={subModalOpen}
        onOk={handleAddSubreddit}
        onCancel={() => { setSubModalOpen(false); subForm.resetFields(); }}
        okText="确认添加"
        cancelText="取消"
      >
        <div style={{ fontSize: 12.5, color: '#94A3B8', marginBottom: 16 }}>
          添加后立即开始采集该社区新帖。
        </div>
        <Form form={subForm} layout="vertical">
          <Form.Item
            name="name"
            label="板块名称"
            rules={[{ required: true, message: '请输入板块名称' }]}
          >
            <Input placeholder="如 r/ChinaSourcing 或 ChinaSourcing" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 新增关键词弹窗 */}
      <Modal
        title="新增采集关键词"
        open={kwModalOpen}
        onOk={handleAddKeyword}
        onCancel={() => { setKwModalOpen(false); kwForm.resetFields(); }}
        okText="确认添加"
        cancelText="取消"
      >
        <div style={{ fontSize: 12.5, color: '#94A3B8', marginBottom: 16 }}>
          帖子命中该关键词即进入 AI 打标队列。
        </div>
        <Form form={kwForm} layout="vertical">
          <Form.Item
            name="keyword"
            label="关键词"
            rules={[{ required: true, message: '请输入关键词' }]}
          >
            <Input placeholder="如 supplier China" />
          </Form.Item>
          <Form.Item name="note" label="说明（可选）">
            <Input placeholder="如 找工厂代工" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

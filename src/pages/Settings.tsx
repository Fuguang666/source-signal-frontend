import React, { useEffect, useState } from 'react';
import { Button, Form, Input, Spin, message, Modal } from 'antd';
import { accountApi, subscriptionApi } from '@/api';
import type { User, UserSubscriptionConfig, Subscription } from '@/types';
import { useAuthStore } from '@/store/auth';

const ALL_CATEGORIES = ['宠物用品', '户外露营', '3C数码', '家居收纳', '服装配饰', '跨境电商物流', '其他'];
const ALL_REGIONS = ['北美', '欧洲', '东南亚', '澳洲', '其他'];

const LockIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" style={{ marginRight: 4 }}>
    <rect x="5" y="11" width="14" height="9" rx="2" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </svg>
);

const SettingsPage: React.FC = () => {
  const { user, setUser } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<User | null>(null);
  const [config, setConfig] = useState<UserSubscriptionConfig | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    Promise.all([
      accountApi.getProfile(),
      accountApi.getConfig().catch(() => null),
      subscriptionApi.getSubscription(),
    ]).then(([prof, cfg, sub]) => {
      setProfile(prof);
      setConfig(cfg);
      setSubscription(sub);
      setUser(prof);
      form.setFieldsValue({
        email: prof.email || '',
        companyName: prof.companyName || '',
      });
    }).finally(() => setLoading(false));
  }, [setUser, form]);

  const isPaid = subscription?.planType === 'PAID';
  const myCategories = config?.categories || [];
  const myRegions = config?.regions || [];
  const myKeywords = config?.keywords || [];
  const lockedCategories = ALL_CATEGORIES.filter((c) => !myCategories.includes(c));
  const lockedRegions = ALL_REGIONS.filter((r) => !myRegions.includes(r));

  const handleSaveProfile = async (values: { email: string; companyName: string }) => {
    setSavingProfile(true);
    try {
      const updated = await accountApi.updateProfile({
        email: values.email || undefined,
        companyName: values.companyName || undefined,
      });
      setProfile(updated);
      setUser(updated);
      message.success('资料已保存');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleRemoveCategory = (cat: string) => {
    const newCats = myCategories.filter((c) => c !== cat);
    accountApi.updateCategories(newCats).then((cfg) => {
      setConfig(cfg);
      message.success('品类配置已更新');
    }).catch(() => {});
  };

  const handleRemoveRegion = (region: string) => {
    const newRegions = myRegions.filter((r) => r !== region);
    accountApi.updateRegions(newRegions).then((cfg) => {
      setConfig(cfg);
      message.success('地区配置已更新');
    }).catch(() => {});
  };

  const handleAddCategory = () => {
    if (isPaid) {
      Modal.info({ title: '添加品类', content: '付费版可添加全品类，功能开发中' });
    } else {
      message.info('更多品类属付费版功能');
    }
  };

  const handleAddRegion = () => {
    if (isPaid) {
      Modal.info({ title: '添加地区', content: '付费版可添加全地区，功能开发中' });
    } else {
      message.info('更多地区属付费版功能');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <h2>账号设置</h2>
          <div className="desc">订阅配置 · 推送偏好 · 数据与隐私</div>
        </div>
      </div>

      <div style={{ maxWidth: 760 }}>
        {/* 个人资料 */}
        <div className="setting-group">
          <h3>个人资料</h3>
          <div className="sg-sub">用于发送线索与账号找回</div>
          <div className="ss-card ss-card-pad">
            <Form form={form} layout="vertical" onFinish={handleSaveProfile}>
              <Form.Item label="用户名" style={{ marginBottom: 16 }}>
                <Input value={profile?.username} disabled style={{ maxWidth: 360, background: '#F8FAFC' }} />
              </Form.Item>
              <Form.Item name="email" label="邮箱" style={{ marginBottom: 16 }}>
                <Input placeholder="用于找回密码（选填）" style={{ maxWidth: 360 }} />
              </Form.Item>
              <Form.Item name="companyName" label="公司 / 团队名称" style={{ marginBottom: 16 }}>
                <Input placeholder="请输入公司或团队名称" style={{ maxWidth: 360 }} />
              </Form.Item>
              <Button type="primary" htmlType="submit" loading={savingProfile}>
                保存更改
              </Button>
            </Form>
          </div>
        </div>

        {/* 订阅配置 */}
        <div className="setting-group">
          <h3>订阅配置</h3>
          <div className="sg-sub">
            决定你收到哪些线索（试用版：{subscription?.maxCategories || 2} 个品类 + {subscription?.maxRegions || 1} 个地区 · 付费版全品类全地区）
          </div>
          <div className="ss-card ss-card-pad">
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>监控品类</div>
            <div className="chip-list" style={{ margin: '10px 0 18px' }}>
              {myCategories.map((c) => (
                <span key={c} className="chip">
                  {c}
                  <span className="x" onClick={() => handleRemoveCategory(c)}>×</span>
                </span>
              ))}
              {!isPaid && lockedCategories.map((c) => (
                <span key={c} className="chip locked" onClick={() => message.info('更多品类属付费版功能')}>
                  <LockIcon />{c}
                </span>
              ))}
              <span className="add-chip" onClick={handleAddCategory}>+ 添加品类</span>
            </div>

            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>目标地区</div>
            <div className="chip-list" style={{ margin: '10px 0 4px' }}>
              {myRegions.map((r) => (
                <span key={r} className="chip">
                  {r}
                  <span className="x" onClick={() => handleRemoveRegion(r)}>×</span>
                </span>
              ))}
              {!isPaid && lockedRegions.map((r) => (
                <span key={r} className="chip locked" onClick={() => message.info('更多地区属付费版功能')}>
                  <LockIcon />{r}
                </span>
              ))}
              <span className="add-chip" onClick={handleAddRegion}>+ 添加地区</span>
            </div>
          </div>
        </div>

        {/* 自定义关键词过滤 */}
        <div className="setting-group">
          <h3>自定义关键词过滤</h3>
          <div className="sg-sub">命中关键词的线索优先展示，不匹配的自动隐藏（付费版功能）</div>
          <div className="ss-card ss-card-pad">
            <div className="chip-list">
              {myKeywords.length > 0 ? (
                myKeywords.map((k) => (
                  <span key={k} className="chip">{k}</span>
                ))
              ) : (
                <span className="chip locked" onClick={() => message.info('自定义关键词过滤属付费版功能')}>
                  <LockIcon />升级后可用
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 数据与历史 */}
        <div className="setting-group">
          <h3>数据与历史</h3>
          <div className="sg-sub">线索历史保存与数据权益</div>
          <div className="ss-card ss-card-pad">
            <div className="meta-row" style={{ border: 'none', padding: '8px 0' }}>
              <span className="k" style={{ width: 'auto', marginRight: 12 }}>历史线索库</span>
              <span className="v">
                {subscription?.historyDays || 7} 天（{isPaid ? '付费版' : '试用版'}）
                {isPaid ? ' · 可查 30 天并导出 CSV' : ' · 付费版可查 30 天并导出 CSV'}
              </span>
            </div>
            <div className="meta-row" style={{ border: 'none', padding: '8px 0' }}>
              <span className="k" style={{ width: 'auto', marginRight: 12 }}>数据来源</span>
              <span className="v">Reddit 公开帖子 · 官方授权 API · 不转售个人隐私数据</span>
            </div>
            <div className="meta-row" style={{ border: 'none', padding: '8px 0' }}>
              <span className="k" style={{ width: 'auto', marginRight: 12 }}>隐私</span>
              <span className="v">
                <a onClick={() => message.info('隐私政策文档即将上线')} style={{ cursor: 'pointer' }}>查看隐私政策</a>
                {' · '}
                <a onClick={() => {
                  Modal.confirm({
                    title: '申请删除我的数据',
                    content: '确认要删除您的所有数据吗？此操作不可恢复。',
                    onOk: () => message.success('已提交数据删除申请'),
                  });
                }} style={{ cursor: 'pointer' }}>申请删除我的数据</a>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;

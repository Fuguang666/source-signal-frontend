import React, { useEffect, useState } from 'react';
import { Button, Spin, Radio, message, Switch } from 'antd';
import { pushApi, subscriptionApi } from '@/api';
import type { PushChannel, Subscription } from '@/types';

const CHANNEL_CONFIG = [
  {
    key: 'IN_APP',
    name: '站内通知',
    desc: '平台内即时提醒，登录即可查看，所有版本可用',
    iconBg: 'var(--primary)',
    icon: (
      <>
        <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M10.3 21a2 2 0 0 0 3.4 0" />
      </>
    ),
  },
  {
    key: 'EMAIL',
    name: '邮件推送',
    desc: '高到达率，适合每日 / 每周汇总，正式场景首选（付费版解锁）',
    iconBg: 'var(--primary)',
    icon: (
      <>
        <path d="M4 6h16v12H4z" />
        <path d="m4 7 8 6 8-6" />
      </>
    ),
  },
  {
    key: 'TELEGRAM',
    name: 'Telegram Bot',
    desc: '实时性强，海外用户首选，新线索即时触达（付费版解锁）',
    iconBg: '#2F6FED',
    icon: (
      <>
        <path d="M21 4 3 11l5 2 2 6 3-4 5 4z" />
        <path d="m8 13 9-6" />
      </>
    ),
  },
];

const NotifyPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [channels, setChannels] = useState<PushChannel[]>([]);
  const [frequency, setFrequency] = useState('DAILY');
  const [isPaid, setIsPaid] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    Promise.all([
      pushApi.getChannels(),
      subscriptionApi.getSubscription(),
    ]).then(([chList, sub]) => {
      setChannels(chList);
      setIsPaid(sub.planType === 'PAID');
      // 从第一个渠道获取频率
      const firstCh = chList.find((c) => c.frequency);
      if (firstCh?.frequency) setFrequency(firstCh.frequency);
    }).finally(() => setLoading(false));
  }, []);

  const handleToggleChannel = async (channel: string, locked: boolean) => {
    if (locked) {
      message.info('多渠道推送属付费版功能，升级后解锁');
      return;
    }
    try {
      const res = await pushApi.toggleChannel(channel);
      setChannels((prev) =>
        prev.map((c) => (c.channel === channel ? { ...c, enabled: res.enabled } : c))
      );
      message.success(res.enabled ? '渠道已启用' : '渠道已停用');
    } catch {
      // 错误已处理
    }
  };

  const handleFrequencyChange = (value: string) => {
    setFrequency(value);
    // 使用站内通知渠道更新频率
    pushApi.updateFrequency('IN_APP', value).then(() => {
      const label = value === 'REALTIME' ? '实时推送' : value === 'DAILY' ? '每日汇总' : '每周汇总';
      message.success(`已切换为${label}`);
    }).catch(() => {});
  };

  const handleSendTest = async () => {
    setTesting(true);
    try {
      await pushApi.sendTest();
      message.success('已向启用的渠道发送 1 条测试线索');
    } catch {
      // 错误已处理
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  // 合并后端渠道数据与默认配置
  const mergedChannels = CHANNEL_CONFIG.map((cfg) => {
    const backend = channels.find((c) => c.channel === cfg.key);
    return {
      ...cfg,
      enabled: backend?.enabled ?? (cfg.key === 'IN_APP'),
      locked: cfg.key !== 'IN_APP' && !isPaid,
    };
  });

  return (
    <div>
      <div className="page-head">
        <div>
          <h2>推送与通知</h2>
          <div className="desc">新帖发布 5 分钟内推送到你选择的渠道</div>
        </div>
        <Button type="primary" loading={testing} onClick={handleSendTest} style={{ height: 38, fontWeight: 600 }}>
          发送测试线索
        </Button>
      </div>

      {/* 渠道卡片 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 20 }}>
        {mergedChannels.map((ch) => (
          <div key={ch.key} className="ss-card" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 34, height: 34, borderRadius: 9, display: 'grid', placeItems: 'center', flex: 'none',
                background: ch.iconBg,
              }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                  {ch.icon}
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{ch.name}</div>
                <div style={{ fontSize: 11.5, color: 'var(--text-3)' }}>{ch.enabled ? '已启用' : '未启用'}</div>
              </div>
              <Switch
                checked={ch.enabled}
                disabled={ch.locked}
                onChange={() => handleToggleChannel(ch.key, ch.locked)}
              />
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--text-2)', flex: 1, lineHeight: 1.65 }}>
              {ch.desc}
            </div>
          </div>
        ))}
      </div>

      {/* 推送频率 */}
      <div className="ss-card ss-card-pad" style={{ maxWidth: 640 }}>
        <div className="ss-card-title">推送频率</div>
        <div className="ss-card-sub">实时推送依赖对应渠道已启用</div>
        <Radio.Group
          value={frequency}
          onChange={(e) => handleFrequencyChange(e.target.value)}
          style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
        >
          <Radio value="REALTIME">实时推送（新线索即刻到达）</Radio>
          <Radio value="DAILY">每日汇总（每天 09:00）</Radio>
          <Radio value="WEEKLY">每周汇总（周一 09:00）</Radio>
        </Radio.Group>
      </div>
    </div>
  );
};

export default NotifyPage;

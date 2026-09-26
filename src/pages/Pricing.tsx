import React, { useEffect, useState } from 'react';
import { Button, Spin, message } from 'antd';
import { subscriptionApi } from '@/api';
import type { Subscription, PlanInfo } from '@/types';
import { useAuthStore } from '@/store/auth';

const CheckIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--ok)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flex: 'none', marginTop: 2 }}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

const PricingPage: React.FC = () => {
  const { setSubscription } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [subscription, setSub] = useState<Subscription | null>(null);
  const [plans, setPlans] = useState<PlanInfo[]>([]);
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    Promise.all([
      subscriptionApi.getSubscription(),
      subscriptionApi.getPlans(),
    ]).then(([sub, planList]) => {
      setSub(sub);
      setPlans(planList);
      setSubscription(sub);
    }).finally(() => setLoading(false));
  }, [setSubscription]);

  const handleUpgrade = async () => {
    setUpgrading(true);
    try {
      await subscriptionApi.upgrade();
      message.success('已升级付费版，全部功能已解锁');
      const sub = await subscriptionApi.getSubscription();
      setSub(sub);
      setSubscription(sub);
    } catch {
      // 错误已处理
    } finally {
      setUpgrading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  const isPaid = subscription?.planType === 'PAID';
  const trialDaysLeft = subscription?.trialDaysLeft ?? 7;

  // 默认套餐数据（如果后端未返回）
  const defaultPlans: PlanInfo[] = plans.length > 0 ? plans : [
    {
      code: 'TRIAL', name: '试用版', price: '$0', priceRmb: '7 天免费',
      description: '先跑通核心链路，7 天后到期', hot: false,
      features: [
        { name: '7 天试用期限', included: true },
        { name: '每日 3 条样例线索', included: true },
        { name: '站内推送', included: true },
        { name: '基础筛选（等级 / 品类 / 地区）', included: true },
        { name: '线索标记与备注', included: true },
        { name: 'Telegram / 企业微信推送', included: false },
        { name: '30 天历史库', included: false },
        { name: 'CSV 导出', included: false },
        { name: '自定义关键词过滤', included: false },
        { name: '子账号 / API', included: false },
      ],
    },
    {
      code: 'PAID', name: '付费版', price: '$129', priceRmb: '¥899 / 月',
      description: '解锁全部功能，团队协作无限制', hot: true,
      features: [
        { name: '不限线索量', included: true },
        { name: '全品类 + 全地区监控', included: true },
        { name: '多渠道推送（邮件 / Telegram / 企业微信 / 钉钉）', included: true },
        { name: '30 天历史库 + CSV 导出', included: true },
        { name: '自定义关键词过滤', included: true },
        { name: '线索标记与备注', included: true },
        { name: '子账号协作', included: true },
        { name: 'API 对接', included: true },
      ],
    },
  ];

  return (
    <div>
      <div className="page-head">
        <div>
          <h2>订阅与套餐</h2>
          <div className="desc">
            {isPaid
              ? '当前为 <b>付费版</b> · 全部功能已解锁'
              : `当前为 <b>试用版</b> · 剩余 ${trialDaysLeft} 天试用 · 每日 ${subscription?.dailySampleLimit || 3} 条样例`}
          </div>
        </div>
        <Button onClick={() => message.info('商务咨询请联系 sales@sourcesignal.io')} style={{ height: 38 }}>
          商务咨询
        </Button>
      </div>

      {/* 套餐对比卡片 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14, marginBottom: 20 }}>
        {defaultPlans.map((plan) => {
          const isCurrent = (plan.code === 'PAID' && isPaid) || (plan.code === 'TRIAL' && !isPaid);
          return (
            <div
              key={plan.code}
              className="ss-card"
              style={{
                position: 'relative', padding: 22, display: 'flex', flexDirection: 'column', gap: 6,
                border: plan.hot ? '1.5px solid var(--primary)' : '1px solid var(--line)',
                boxShadow: plan.hot ? '0 0 0 3px rgba(15,118,110,.08)' : 'var(--shadow)',
              }}
            >
              {plan.hot && (
                <span style={{
                  position: 'absolute', top: -11, left: '50%', transform: 'translateX(-50%)',
                  background: 'var(--primary)', color: '#fff', fontSize: 11.5, fontWeight: 700,
                  padding: '3px 12px', borderRadius: 999, whiteSpace: 'nowrap',
                }}>
                  解锁全部功能
                </span>
              )}
              <div style={{ fontSize: 15, fontWeight: 700 }}>{plan.name}</div>
              <div className="num" style={{ fontSize: 30, fontWeight: 700, letterSpacing: .3 }}>
                {plan.price}
                {plan.hot && <small style={{ fontSize: 13, color: 'var(--text-3)', fontWeight: 500 }}> / 月</small>}
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--text-3)', marginBottom: 6 }}>
                {plan.priceRmb} · {plan.description}
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8, margin: '10px 0 16px', flex: 1 }}>
                {plan.features.map((f, i) => (
                  <li key={i} style={{ display: 'flex', gap: 9, fontSize: 13, color: f.included ? 'var(--text)' : 'var(--text-3)', alignItems: 'flex-start' }}>
                    {f.included ? <CheckIcon /> : (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flex: 'none', marginTop: 2 }}>
                        <path d="M18 6 6 18M6 6l12 12" />
                      </svg>
                    )}
                    {f.name}
                  </li>
                ))}
              </ul>
              {isCurrent ? (
                <Button type={plan.hot ? 'primary' : 'default'} disabled style={{ height: 40, fontWeight: 600 }}>
                  {plan.hot ? '当前已付费' : '当前试用中'}
                </Button>
              ) : (
                <Button
                  type={plan.hot ? 'primary' : 'default'}
                  loading={plan.hot && upgrading}
                  onClick={plan.hot ? handleUpgrade : () => message.info('试用版已包含在当前账号中')}
                  style={{ height: 40, fontWeight: 600 }}
                >
                  {plan.hot ? '升级到付费版' : '重新试用'}
                </Button>
              )}
            </div>
          );
        })}
      </div>

      {/* 年付优惠 */}
      <div className="ss-card ss-card-pad" style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 220 }}>
          <div className="ss-card-title">付费版年付享 8 折</div>
          <div className="ss-card-sub">年付一次到账，随时可升级，随时取消</div>
        </div>
        <Button onClick={() => message.info('切换年付功能即将上线')}>切换为年付</Button>
        <Button onClick={() => message.info('7 天免费试用已包含在当前账号中')}>查看试用权益</Button>
      </div>

      <div style={{ fontSize: 12.5, color: 'var(--text-3)', lineHeight: 1.7, marginTop: 14 }}>
        试用版 7 天到期后自动停止样例推送；升级付费版解锁全部功能（不限线索量、全品类全地区、多渠道推送、30 天历史库、CSV 导出、自定义关键词、子账号与 API），年付享 8 折，随时可升级。
      </div>
    </div>
  );
};

export default PricingPage;

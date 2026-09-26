import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
      message.success(t('pricing.allFeatures'));
      const sub = await subscriptionApi.getSubscription();
      setSub(sub);
      setSubscription(sub);
    } catch {
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

  const defaultPlans: PlanInfo[] = plans.length > 0 ? plans : [
    {
      code: 'TRIAL', name: t('pricing.trialPlan'), price: '$0', priceRmb: '7 ' + t('common.days'),
      description: t('pricing.trialDesc'), hot: false,
      features: [
        { name: '7 ' + t('common.days'), included: true },
        { name: t('pricing.sampleLimit'), included: true },
        { name: t('notify.inApp'), included: true },
        { name: t('pricing.history'), included: true },
        { name: '30 ' + t('common.days') + ' ' + t('pricing.history'), included: false },
        { name: 'CSV', included: false },
      ],
    },
    {
      code: 'PAID', name: t('pricing.paidPlan'), price: '$129', priceRmb: '/ ' + t('common.days'),
      description: t('pricing.allFeatures'), hot: true,
      features: [
        { name: t('pricing.unlimited'), included: true },
        { name: t('pricing.allCategories') + ' + ' + t('pricing.allRegions'), included: true },
        { name: t('pricing.allChannels'), included: true },
        { name: '30 ' + t('common.days') + ' ' + t('pricing.history') + ' + CSV', included: true },
        { name: t('pricing.customKeywords'), included: true },
      ],
    },
  ];

  return (
    <div>
      <div className="page-head">
        <div>
          <h2>{t('pricing.title')}</h2>
          <div className="desc">
            {isPaid
              ? t('pricing.currentPlan') + ': ' + t('pricing.paidPlan')
              : `${t('pricing.currentPlan')}: ${t('pricing.trialPlan')} · ${t('pricing.trialDaysLeft')}: ${trialDaysLeft} ${t('common.days')}`}
          </div>
        </div>
      </div>

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
                  {t('pricing.allFeatures')}
                </span>
              )}
              <div style={{ fontSize: 15, fontWeight: 700 }}>{plan.name}</div>
              <div className="num" style={{ fontSize: 30, fontWeight: 700, letterSpacing: .3 }}>
                {plan.price}
                {plan.hot && <small style={{ fontSize: 13, color: 'var(--text-3)', fontWeight: 500 }}> / {t('pricing.perMonth')}</small>}
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--text-3)', marginBottom: 6 }}>
                {plan.description}
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
                  {t('pricing.currentPlan')}
                </Button>
              ) : (
                <Button
                  type={plan.hot ? 'primary' : 'default'}
                  loading={plan.hot && upgrading}
                  onClick={plan.hot ? handleUpgrade : () => message.info(t('notify.comingSoon'))}
                  style={{ height: 40, fontWeight: 600 }}
                >
                  {plan.hot ? t('pricing.upgrade') : t('pricing.trialPlan')}
                </Button>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ fontSize: 12.5, color: 'var(--text-3)', lineHeight: 1.7, marginTop: 14 }}>
        {t('pricing.trialDesc')}
      </div>
    </div>
  );
};

export default PricingPage;

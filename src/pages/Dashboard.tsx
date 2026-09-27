import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, Spin, Empty } from 'antd';
import { dashboardApi } from '@/api';
import type { DashboardDTO } from '@/types';
import GradeBadge from '@/components/GradeBadge';
import RadarMonitor from '@/components/RadarMonitor';
import dayjs from 'dayjs';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardDTO | null>(null);

  useEffect(() => {
    dashboardApi.getDashboard()
      .then((dash) => setData(dash))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!data) {
    return <Empty description={t('dashboard.noData')} />;
  }

  const aGradeCount = data.gradeDistribution?.find((g) => g.grade === 'A')?.count || 0;
  const topCategories = (data.categoryDistribution || []).slice(0, 15);
  const maxCat = Math.max(...(topCategories.map((c) => c.count) || [1]), 1);
  const recentLeads = data.recentLeads || [];
  const categories = data.monitoredCategories || [];
  const regions = data.monitoredRegions || [];

  const formatTime = (timeStr: string) => {
    if (!timeStr) return '';
    const diff = dayjs().diff(dayjs(timeStr), 'hour');
    if (diff < 1) return t('dashboard.justNow');
    if (diff < 24) return `${diff} ${t('dashboard.hoursAgo')}`;
    const days = Math.floor(diff / 24);
    return days === 1 ? t('dashboard.yesterday') : `${days} ${t('dashboard.daysAgo')}`;
  };

  return (
    <div>
      <div className="page-head">
        <div>
          <h2>{t('dashboard.welcome')}</h2>
          <div className="desc">
            {t('dashboard.todayNew')} <b className="num">{data.todayNewLeads}</b> {t('dashboard.welcomeSuffix')}，
            {data.isPaid ? t('dashboard.paidUnlockAll') : `${t('pricing.sampleLimit')} ${data.dailySampleLimit} ${t('dashboard.paidUnlockAll')}`}
          </div>
        </div>
        <Button type="primary" onClick={() => navigate('/app/leads')} style={{ height: 38, padding: '0 20px', fontWeight: 600 }}>
          {t('dashboard.viewAll')}
        </Button>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="k">{t('dashboard.todayNewLeads')}</div>
          <div className="v num">{data.todayNewLeads}<small>{t('common.items')}</small></div>
          <div className="d">{t('dashboard.total')}: {data.totalLeads} {t('common.items')}</div>
        </div>
        <div className="stat-card accent-s">
          <div className="k">
            <span className="sig-dot s" style={{ width: 7, height: 7, borderRadius: '50%', display: 'inline-block' }} />
            {t('grade.s')} · {t('grade.sDesc')}
          </div>
          <div className="v num" style={{ color: 'var(--s)' }}>{data.todaySGradeLeads}<small>{t('common.items')}</small></div>
          <div className="d">{t('dashboard.clearPurchasePlan')}</div>
        </div>
        <div className="stat-card accent-a">
          <div className="k">
            <span className="sig-dot a" style={{ width: 7, height: 7, borderRadius: '50%', display: 'inline-block' }} />
            {data.isPaid ? `${t('grade.a')} · ${t('grade.aDesc')}` : t('pricing.sampleLimit')}
          </div>
          <div className="v num" style={{ color: data.isPaid ? 'var(--a)' : undefined }}>
            {data.isPaid ? aGradeCount : data.dailySampleLimit}<small>{data.isPaid ? t('common.items') : `${t('common.items')}/${t('common.days')}`}</small>
          </div>
          <div className="d">{data.isPaid ? t('dashboard.hasPlan') : t('dashboard.paidUnlockAll')}</div>
        </div>
        <div className="stat-card">
          <div className="k">{data.isPaid ? t('pricing.paidPlan') : t('pricing.trialDaysLeft')}</div>
          <div className="v num">{data.isPaid ? '∞' : data.trialDaysLeft}<small>{data.isPaid ? '' : t('common.days')}</small></div>
          <div className="d">{data.isPaid ? t('pricing.allFeatures') : t('pricing.trialDesc')}</div>
        </div>
      </div>

      <div className="grid-2">
        <div className="ss-card ss-card-pad">
          <div className="ss-card-title">{t('dashboard.monitoring')}</div>
          <div className="ss-card-sub">{t('dashboard.monitoringDesc')}</div>
          <RadarMonitor />
          <div className="mon-label">{t('settings.monitorCategories')}</div>
          <div className="chip-list">
            {categories.map((c) => (
              <span key={c} className="chip">{c}</span>
            ))}
            {categories.length === 0 && <span style={{ color: 'var(--text-3)', fontSize: 13 }}>{t('dashboard.noConfig')}</span>}
          </div>
          <div className="mon-label">{t('settings.monitorRegions')}</div>
          <div className="chip-list">
            {regions.map((r) => (
              <span key={r} className="chip">{r}</span>
            ))}
            {regions.length === 0 && <span style={{ color: 'var(--text-3)', fontSize: 13 }}>{t('dashboard.noConfig')}</span>}
          </div>
          <div className="mon-status">
            <span className="mon-dot" />
            {t('dashboard.listening')} · {formatTime(recentLeads[0]?.pushedAt || '')}
          </div>
        </div>

        <div className="ss-card ss-card-pad">
          <div className="ss-card-title">{t('dashboard.categoryDistribution')}</div>
          <div className="ss-card-sub">{t('dashboard.categoryDistributionDesc')}</div>
          {topCategories.map((item) => (
            <div key={item.category} className="bar-row">
              <span className="lb">{item.category}</span>
              <div className="bar-track">
                <i style={{ width: `${Math.round((item.count / maxCat) * 100)}%` }} />
              </div>
              <span className="vl num">{item.count}</span>
            </div>
          ))}
          {topCategories.length === 0 && (
            <div style={{ color: 'var(--text-3)', textAlign: 'center', padding: 20 }}>{t('dashboard.noData')}</div>
          )}
        </div>
      </div>

      <div className="ss-card ss-card-pad">
        <div className="ss-card-title">{t('dashboard.recentPushes')}</div>
        <div className="ss-card-sub">{t('dashboard.recentPushesDesc')}</div>
        <div className="timeline">
          {recentLeads.slice(0, 5).map((lead) => (
            <div key={lead.id} className={`tl-item ${lead.grade.toLowerCase()}`}>
              <div className="tt" onClick={() => navigate(`/app/lead/${lead.id}`)}>
                {lead.title}
              </div>
              <div className="tm">
                <GradeBadge grade={lead.grade} />
                {' · '}{lead.category}
                {' · '}{lead.region}
                {' · '}<span className="num">{formatTime(lead.pushedAt)}</span>
              </div>
            </div>
          ))}
          {recentLeads.length === 0 && (
            <div style={{ color: 'var(--text-3)', padding: '10px 0' }}>{t('dashboard.noData')}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

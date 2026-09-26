import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Spin, Empty } from 'antd';
import { dashboardApi } from '@/api';
import type { DashboardDTO } from '@/types';
import GradeBadge from '@/components/GradeBadge';
import RadarMonitor from '@/components/RadarMonitor';
import dayjs from 'dayjs';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
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
    return <Empty description="暂无数据" />;
  }

  // 从分级分布计算 A/B 级数量
  const aGradeCount = data.gradeDistribution?.find((g) => g.grade === 'A')?.count || 0;
  const bGradeCount = data.gradeDistribution?.find((g) => g.grade === 'B')?.count || 0;

  const maxCat = Math.max(...(data.categoryDistribution?.map((c) => c.count) || [1]), 1);
  const recentLeads = data.recentLeads || [];
  const categories = data.monitoredCategories || [];
  const regions = data.monitoredRegions || [];

  const formatTime = (timeStr: string) => {
    if (!timeStr) return '';
    const diff = dayjs().diff(dayjs(timeStr), 'hour');
    if (diff < 1) return '刚刚';
    if (diff < 24) return `${diff} 小时前`;
    const days = Math.floor(diff / 24);
    return days === 1 ? '昨天' : `${days} 天前`;
  };

  return (
    <div>
      {/* 页面头部 */}
      <div className="page-head">
        <div>
          <h2>早上好</h2>
          <div className="desc">
            今天平台新增 <b className="num">{data.todayNewLeads}</b> 条采购信号，
            {data.isPaid ? '付费版已解锁全部线索。' : `试用版每日推送 ${data.dailySampleLimit} 条样例，付费版解锁全部线索。`}
          </div>
        </div>
        <Button type="primary" onClick={() => navigate('/leads')} style={{ height: 38, padding: '0 20px', fontWeight: 600 }}>
          查看全部线索
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="k">今日新信号</div>
          <div className="v num">{data.todayNewLeads}<small>条</small></div>
          <div className="d">累计共 {data.totalLeads} 条</div>
        </div>
        <div className="stat-card accent-s">
          <div className="k">
            <span className="sig-dot s" style={{ width: 7, height: 7, borderRadius: '50%', display: 'inline-block' }} />
            S 级 · 高意向
          </div>
          <div className="v num" style={{ color: 'var(--s)' }}>{data.todaySGradeLeads}<small>条</small></div>
          <div className="d">明确求购，建议当日跟进</div>
        </div>
        <div className="stat-card accent-a">
          <div className="k">
            <span className="sig-dot a" style={{ width: 7, height: 7, borderRadius: '50%', display: 'inline-block' }} />
            {data.isPaid ? 'A 级 · 中意向' : '试用版样例'}
          </div>
          <div className="v num" style={{ color: data.isPaid ? 'var(--a)' : undefined }}>
            {data.isPaid ? aGradeCount : data.dailySampleLimit}<small>{data.isPaid ? '条' : '条 / 天'}</small>
          </div>
          <div className="d">{data.isPaid ? '有明确采购计划' : '付费版解锁全部线索'}</div>
        </div>
        <div className="stat-card">
          <div className="k">{data.isPaid ? '付费版' : '剩余试用'}</div>
          <div className="v num">{data.isPaid ? '∞' : data.trialDaysLeft}<small>{data.isPaid ? '' : '天'}</small></div>
          <div className="d">{data.isPaid ? '全部功能已解锁' : '试用共 7 天 · 到期升级付费版'}</div>
        </div>
      </div>

      {/* 监控雷达 + 品类分布 */}
      <div className="grid-2">
        <div className="ss-card ss-card-pad">
          <div className="ss-card-title">正在监控</div>
          <div className="ss-card-sub">持续监听海外采购社区，捕获新帖即打标推送</div>
          <RadarMonitor />
          <div className="mon-label">监控品类</div>
          <div className="chip-list">
            {categories.map((c) => (
              <span key={c} className="chip">{c}</span>
            ))}
            {categories.length === 0 && <span style={{ color: 'var(--text-3)', fontSize: 13 }}>暂未配置，去账号设置添加</span>}
          </div>
          <div className="mon-label">监控地区</div>
          <div className="chip-list">
            {regions.map((r) => (
              <span key={r} className="chip">{r}</span>
            ))}
            {regions.length === 0 && <span style={{ color: 'var(--text-3)', fontSize: 13 }}>暂未配置</span>}
          </div>
          <div className="mon-status">
            <span className="mon-dot" />
            监听中 · r/ChinaSourcing · 最近信号 {formatTime(recentLeads[0]?.pushedAt || '')}
          </div>
        </div>

        <div className="ss-card ss-card-pad">
          <div className="ss-card-title">近 30 天品类分布</div>
          <div className="ss-card-sub">按已推送线索统计</div>
          {(data.categoryDistribution || []).map((item) => (
            <div key={item.category} className="bar-row">
              <span className="lb">{item.category}</span>
              <div className="bar-track">
                <i style={{ width: `${Math.round((item.count / maxCat) * 100)}%` }} />
              </div>
              <span className="vl num">{item.count}</span>
            </div>
          ))}
          {(data.categoryDistribution || []).length === 0 && (
            <div style={{ color: 'var(--text-3)', textAlign: 'center', padding: 20 }}>暂无数据</div>
          )}
        </div>
      </div>

      {/* 最近推送时间线 */}
      <div className="ss-card ss-card-pad">
        <div className="ss-card-title">最近推送</div>
        <div className="ss-card-sub">新帖发布 5 分钟内推送，点击查看详情</div>
        <div className="timeline">
          {recentLeads.slice(0, 5).map((lead) => (
            <div key={lead.id} className={`tl-item ${lead.grade.toLowerCase()}`}>
              <div className="tt" onClick={() => navigate(`/lead/${lead.id}`)}>
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
            <div style={{ color: 'var(--text-3)', padding: '10px 0' }}>暂无推送记录</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

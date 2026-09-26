import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import { Dropdown, Badge, message } from 'antd';
import { useAuthStore } from '@/store/auth';
import { subscriptionApi, pushApi } from '@/api';
import type { Subscription } from '@/types';

const NAV_ITEMS = [
  { key: '/dashboard', label: '仪表盘', icon: 'dashboard' },
  { key: '/leads', label: '线索库', icon: 'leads' },
  { key: '/pricing', label: '订阅与套餐', icon: 'pricing' },
  { key: '/notify', label: '推送与通知', icon: 'notify' },
  { key: '/settings', label: '账号设置', icon: 'settings' },
];

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': '仪表盘',
  '/leads': '线索库',
  '/lead': '线索详情',
  '/pricing': '订阅与套餐',
  '/notify': '推送与通知',
  '/settings': '账号设置',
};

const NavIcon: React.FC<{ type: string }> = ({ type }) => {
  const icons: Record<string, React.ReactNode> = {
    dashboard: (
      <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7.5" height="9" rx="1.5" /><rect x="13.5" y="3" width="7.5" height="5.5" rx="1.5" />
        <rect x="13.5" y="12" width="7.5" height="9" rx="1.5" /><rect x="3" y="15.5" width="7.5" height="5.5" rx="1.5" />
      </svg>
    ),
    leads: (
      <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 6h16M4 12h16M4 18h10" /><circle cx="19.5" cy="18" r="2.2" fill="currentColor" stroke="none" />
      </svg>
    ),
    pricing: (
      <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v20M17 6.5c0-1.9-2.2-3-5-3s-5 1.1-5 3 2 2.6 5 3.4 5 1.5 5 3.4-2.2 3-5 3-5-1.1-5-3" />
      </svg>
    ),
    notify: (
      <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M10.3 21a2 2 0 0 0 3.4 0" />
      </svg>
    ),
    settings: (
      <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.55V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1-1.55 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.55-1H3a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.55-1 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34h.01a1.7 1.7 0 0 0 1-1.55V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1 1.55 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87v.01a1.7 1.7 0 0 0 1.55 1H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.55 1z" />
      </svg>
    ),
  };
  return <>{icons[type]}</>;
};

const AppLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, subscription, setSubscription } = useAuthStore();
  const [unreadCount, setUnreadCount] = useState(0);

  const currentPath = location.pathname.startsWith('/lead/') ? '/lead' : location.pathname;
  const pageTitle = PAGE_TITLES[currentPath] || '仪表盘';
  const activeKey = currentPath === '/lead' ? '/leads' : currentPath;

  useEffect(() => {
    // 加载订阅信息
    subscriptionApi.getSubscription().then((sub) => {
      setSubscription(sub);
    }).catch(() => {});
    // 加载未读数
    pushApi.getUnreadCount().then((res) => {
      setUnreadCount(typeof res === "number" ? res : 0);
    }).catch(() => {});
  }, [setSubscription]);

  const trialDaysLeft = subscription?.trialDaysLeft ?? 7;
  const isPaid = subscription?.planType === 'PAID';
  const trialUsedPercent = isPaid ? 100 : Math.round(((7 - trialDaysLeft) / 7) * 100);

  const handleLogout = () => {
    logout();
    message.success('已退出登录');
    navigate('/login');
  };

  const userMenuItems = [
    { key: 'profile', label: '个人资料', onClick: () => navigate('/settings') },
    { key: 'logout', label: '退出登录', onClick: handleLogout, danger: true },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex' }}>
      {/* 侧边栏 */}
      <aside
        style={{
          position: 'fixed',
          inset: '0 auto 0 0',
          width: 'var(--sidebar-w)',
          background: 'var(--ink)',
          color: '#64748B',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 40,
          borderRight: '1px solid var(--line)',
        }}
      >
        <div style={{ padding: '20px 18px 14px', borderBottom: '1px solid var(--line)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 9, background: 'var(--primary)',
              display: 'grid', placeItems: 'center', flex: 'none',
            }}>
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="3.2" fill="#fff" stroke="none" />
                <circle cx="12" cy="12" r="6.5" stroke="#fff" strokeOpacity=".55" />
                <circle cx="12" cy="12" r="10" stroke="#fff" strokeOpacity=".28" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>SourceSignal</div>
              <div style={{ fontSize: 10.5, color: 'var(--text-3)', letterSpacing: 1 }}>采购信号</div>
            </div>
          </div>
        </div>

        <nav style={{ padding: '14px 10px', display: 'flex', flexDirection: 'column', gap: 2, flex: 1, overflowY: 'auto' }}>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              onClick={() => navigate(item.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: 11, padding: '9px 12px',
                borderRadius: 8, color: activeKey === item.key ? 'var(--primary-dark)' : '#64748B',
                fontSize: 13.5, cursor: 'pointer', border: 'none', background: activeKey === item.key ? 'var(--primary-soft)' : 'transparent',
                width: '100%', textAlign: 'left', transition: 'all .15s', position: 'relative',
              }}
              onMouseEnter={(e) => { if (activeKey !== item.key) { e.currentTarget.style.background = '#F1F5F9'; e.currentTarget.style.color = 'var(--text)'; } }}
              onMouseLeave={(e) => { if (activeKey !== item.key) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748B'; } }}
            >
              {activeKey === item.key && (
                <span style={{ position: 'absolute', left: 0, width: 3, height: 22, borderRadius: '0 3px 3px 0', background: 'var(--primary)' }} />
              )}
              <NavIcon type={item.icon} />
              <span>{item.label}</span>
              {item.key === '/notify' && unreadCount > 0 && (
                <Badge count={unreadCount} size="small" style={{ marginLeft: 'auto' }} />
              )}
            </button>
          ))}
        </nav>

        {/* 底部套餐卡片 */}
        <div style={{ padding: '14px 12px', borderTop: '1px solid var(--line)' }}>
          <div style={{
            background: '#fff', border: '1px solid var(--line)', borderRadius: 10, padding: 12,
          }}>
            <div style={{ color: 'var(--text)', fontSize: 13, fontWeight: 600 }}>
              {isPaid ? '付费版 · 已解锁全部功能' : '试用版 · 7 天试用'}
            </div>
            <div style={{ color: 'var(--text-3)', fontSize: 11.5, marginTop: 3 }}>
              {isPaid ? '无功能限制 · 随时管理订阅' : `剩余 ${trialDaysLeft} 天 · 每日 3 条样例`}
            </div>
            <div style={{ height: 5, background: '#EDF1F6', borderRadius: 3, marginTop: 9, overflow: 'hidden' }}>
              <div style={{ display: 'block', height: '100%', background: 'var(--primary)', borderRadius: 3, width: `${trialUsedPercent}%` }} />
            </div>
            <button
              onClick={() => navigate('/pricing')}
              style={{
                marginTop: 10, width: '100%', padding: 7, fontSize: 12.5,
                background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 8,
                fontWeight: 600, cursor: 'pointer',
              }}
            >
              {isPaid ? '管理订阅' : '升级付费版'}
            </button>
          </div>
        </div>
      </aside>

      {/* 主内容区 */}
      <div style={{ marginLeft: 'var(--sidebar-w)', minHeight: '100vh', display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* 顶栏 */}
        <header style={{
          position: 'sticky', top: 0, zIndex: 30,
          background: 'rgba(255,255,255,.92)', backdropFilter: 'blur(6px)',
          borderBottom: '1px solid var(--line)', padding: '0 28px', height: 58,
          display: 'flex', alignItems: 'center', gap: 18,
        }}>
          <div style={{ fontSize: 16.5, fontWeight: 700, color: 'var(--text)' }}>{pageTitle}</div>
          <div style={{ flex: 1 }} />
          <div style={{ position: 'relative' }}>
            <svg style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, stroke: 'var(--text-3)', fill: 'none', strokeWidth: 2, strokeLinecap: 'round' }} viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
            </svg>
            <input
              type="text"
              placeholder="搜索线索、品类…"
              onKeyDown={(e) => { if (e.key === 'Enter') navigate('/leads'); }}
              style={{
                width: 240, padding: '8px 12px 8px 34px', border: '1px solid var(--line)',
                borderRadius: 8, fontSize: 13, background: '#fff', fontFamily: 'inherit', color: 'var(--text)',
              }}
            />
          </div>
          {!isPaid && (
            <div
              onClick={() => navigate('/pricing')}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'var(--s-soft)', color: 'var(--warn)',
                border: '1px solid #F4D9A8', borderRadius: 999,
                padding: '5px 12px', fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
              }}
            >
              试用剩余 {trialDaysLeft} 天 · 每日 3 条样例
            </div>
          )}
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '5px 8px', borderRadius: 8, cursor: 'pointer' }}>
              <div style={{
                width: 30, height: 30, borderRadius: '50%', background: 'var(--primary)',
                color: '#fff', display: 'grid', placeItems: 'center', fontSize: 12.5, fontWeight: 700,
              }}>
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{user?.username || '用户'}</span>
            </div>
          </Dropdown>
        </header>

        {/* 内容区 */}
        <div style={{ padding: '26px 28px 48px', flex: 1 }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AppLayout;

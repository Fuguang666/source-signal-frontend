import { Layout, Menu, Avatar, Input, Tag } from 'antd';
import {
  RadarChartOutlined,
  TeamOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/auth';

const { Sider, Header, Content } = Layout;

const menuItems = [
  { key: '/admin/collectors', icon: <RadarChartOutlined />, label: '采集器管理' },
  { key: '/admin/users', icon: <TeamOutlined />, label: '用户列表' },
];

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const selectedKey = location.pathname.startsWith('/admin/users')
    ? '/admin/users'
    : '/admin/collectors';

  const pageTitle = selectedKey === '/admin/users' ? '用户列表' : '采集器管理';

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        width={232}
        style={{
          background: '#F7FAFC',
          borderRight: '1px solid #E3E8EF',
          position: 'fixed',
          height: '100vh',
          left: 0,
          top: 0,
          zIndex: 100,
        }}
      >
        {/* 品牌 */}
        <div style={{ padding: '20px 18px 16px', borderBottom: '1px solid #E3E8EF' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 9,
                background: '#0F766E',
                display: 'grid',
                placeItems: 'center',
                flex: 'none',
              }}
            >
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 12l6-6" />
                <circle cx="12" cy="12" r="2.6" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 16.5, fontWeight: 700, color: '#1E293B', letterSpacing: 0.3 }}>
                SourceSignal
              </div>
              <div style={{ color: '#94A3B8', fontSize: 11.5, letterSpacing: 1.5, marginTop: 2 }}>
                后台管理 · ADMIN
              </div>
            </div>
          </div>
        </div>

        {/* 导航 */}
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{
            background: 'transparent',
            borderRight: 'none',
            padding: '14px 10px',
            fontSize: 13.5,
          }}
        />

        <div style={{ flex: 1 }} />

        {/* 底部管理员卡片 */}
        <div style={{ padding: '14px 12px', borderTop: '1px solid #E3E8EF' }}>
          <div
            style={{
              background: '#fff',
              border: '1px solid #E3E8EF',
              borderRadius: 10,
              padding: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <Avatar
              size={30}
              style={{ background: '#0F766E', fontSize: 12.5, fontWeight: 700, flex: 'none' }}
            >
              {user?.username?.[0]?.toUpperCase() || 'A'}
            </Avatar>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#1E293B' }}>
                {user?.username || 'admin'}
              </div>
              <div style={{ fontSize: 11.5, color: '#94A3B8' }}>运营管理员 · 全部权限</div>
            </div>
          </div>
          <div
            style={{
              marginTop: 8,
              textAlign: 'center',
              cursor: 'pointer',
              fontSize: 12,
              color: '#94A3B8',
              padding: '6px 0',
              borderRadius: 6,
            }}
            onClick={() => { logout(); navigate('/login'); }}
          >
            <LogoutOutlined style={{ marginRight: 4 }} /> 退出登录
          </div>
        </div>
      </Sider>

      <Layout style={{ marginLeft: 232 }}>
        <Header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 30,
            background: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(6px)',
            borderBottom: '1px solid #E3E8EF',
            padding: '0 28px',
            height: 58,
            display: 'flex',
            alignItems: 'center',
            gap: 18,
          }}
        >
          <span style={{ fontSize: 16.5, fontWeight: 700, color: '#1E293B' }}>{pageTitle}</span>
          <div style={{ flex: 1 }} />
          {selectedKey === '/admin/users' && (
            <Input.Search
              placeholder="搜索用户邮箱…"
              allowClear
              style={{ width: 240 }}
              onSearch={(v) => {
                const url = new URL(window.location.href);
                if (v) url.searchParams.set('keyword', v);
                else url.searchParams.delete('keyword');
                url.searchParams.set('page', '1');
                navigate(`${url.pathname}?${url.searchParams}`);
              }}
            />
          )}
          <Tag color="green" style={{ borderRadius: 999, padding: '5px 12px', fontSize: 12, fontWeight: 600, border: 'none' }}>
            后台管理
          </Tag>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer', padding: '5px 8px', borderRadius: 8 }}>
            <Avatar size={30} style={{ background: '#0F766E', fontSize: 12.5, fontWeight: 700 }}>
              {user?.username?.[0]?.toUpperCase() || 'A'}
            </Avatar>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#1E293B' }}>{user?.username || 'admin'}</span>
          </div>
        </Header>

        <Content style={{ padding: '26px 28px 48px', background: '#F4F6F9', flex: 1 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}

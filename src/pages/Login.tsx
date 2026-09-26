import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, message, Tabs } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { useAuthStore } from '@/store/auth';
import { authApi } from '@/api';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  const handleLogin = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      await login(values.username, values.password);
      message.success('登录成功，欢迎回来');
      navigate('/dashboard');
    } catch {
      // 错误已在拦截器处理
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (values: { username: string; password: string; email?: string }) => {
    setLoading(true);
    try {
      await authApi.register({ username: values.username, password: values.password, email: values.email });
      message.success('注册成功，已自动登录');
      navigate('/dashboard');
    } catch {
      // 错误已在拦截器处理
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--ink)', display: 'grid', placeItems: 'center',
      padding: 24, position: 'relative', overflow: 'hidden',
    }}>
      {/* 背景装饰 */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `
          radial-gradient(circle at 20% 25%, rgba(15,118,110,.14), transparent 46%),
          radial-gradient(circle at 82% 78%, rgba(47,111,237,.1), transparent 42%),
          repeating-linear-gradient(0deg, rgba(15,118,110,.05) 0 1px, transparent 1px 56px),
          repeating-linear-gradient(90deg, rgba(15,118,110,.05) 0 1px, transparent 1px 56px)
        `,
      }} />

      <div style={{
        position: 'relative', width: 'min(940px, 100%)', display: 'grid',
        gridTemplateColumns: '1.05fr 1fr', background: '#fff',
        border: '1px solid var(--line)', borderRadius: 16, overflow: 'hidden',
        boxShadow: '0 18px 50px rgba(15,23,42,.08)',
      }}>
        {/* 左侧品牌区 */}
        <div style={{
          padding: '56px 48px', color: 'var(--text)', display: 'flex',
          flexDirection: 'column', gap: 22,
          background: 'linear-gradient(160deg,#F0F9F8 0%,#F8FAFC 100%)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10, background: 'var(--primary)',
              display: 'grid', placeItems: 'center', flex: 'none',
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="3.2" fill="#fff" stroke="none" />
                <circle cx="12" cy="12" r="6.5" stroke="#fff" strokeOpacity=".55" />
                <circle cx="12" cy="12" r="10" stroke="#fff" strokeOpacity=".28" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: .5 }}>SourceSignal</div>
              <div style={{ color: 'var(--text-3)', fontSize: 12.5, letterSpacing: 1 }}>采购信号 · CROSS-BORDER SOURCING INTELLIGENCE</div>
            </div>
          </div>

          <h1 style={{ fontSize: 30, lineHeight: 1.3, fontWeight: 700, letterSpacing: .5 }}>
            把海外采购需求，<br />变成<em style={{ fontStyle: 'normal', color: 'var(--primary)' }}>可立即跟进</em>的商机
          </h1>
          <p style={{ color: 'var(--text-2)', fontSize: 14.5, lineHeight: 1.8 }}>
            实时采集 Reddit 跨境采购社区公开需求，AI 打标分级，5 分钟内推送高意向采购线索。中文界面，多渠道触达。
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
            {[
              { grade: 's', text: 'Looking for a sourcing agent for pet products from China', meta: 'S 级 · 高意向' },
              { grade: 'a', text: 'Considering hiring an agent for home organization products', meta: 'A 级 · 中意向' },
              { grade: 'b', text: 'New to importing from China, how does sourcing work?', meta: 'B 级 · 低意向' },
            ].map((item, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 12, background: '#fff',
                border: '1px solid var(--line)', borderRadius: 10, padding: '12px 14px',
              }}>
                <span className={`sig-dot ${item.grade}`} />
                <span style={{ fontSize: 13, color: 'var(--text)', flex: 1 }}>{item.text}</span>
                <span style={{ marginLeft: 'auto', fontSize: 11.5, color: 'var(--text-3)', flex: 'none' }}>{item.meta}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 右侧表单区 */}
        <div style={{
          padding: '56px 48px', background: '#F8FAFC',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
        }}>
          <Tabs
            activeKey={activeTab}
            onChange={(key) => setActiveTab(key as 'login' | 'register')}
            items={[
              { key: 'login', label: '登录' },
              { key: 'register', label: '注册' },
            ]}
            style={{ marginBottom: 20 }}
          />

          {activeTab === 'login' ? (
            <Form
              layout="vertical"
              onFinish={handleLogin}
              autoComplete="off"
              size="large"
            >
              <Form.Item
                name="username"
                label="用户名"
                rules={[{ required: true, message: '请输入用户名' }]}
              >
                <Input prefix={<UserOutlined style={{ color: '#94A3B8' }} />} placeholder="请输入用户名" autoComplete="off" />
              </Form.Item>
              <Form.Item
                name="password"
                label="密码"
                rules={[{ required: true, message: '请输入密码' }]}
              >
                <Input.Password prefix={<LockOutlined style={{ color: '#94A3B8' }} />} placeholder="请输入密码" autoComplete="new-password" />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading} block style={{ height: 44, fontSize: 15, fontWeight: 600 }}>
                  登录
                </Button>
              </Form.Item>
              <div style={{ textAlign: 'center', color: 'var(--text-3)', fontSize: 12.5 }}>
                还没有账号？<a onClick={() => setActiveTab('register')} style={{ color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }}>免费注册，开启 7 天试用</a>
              </div>
            </Form>
          ) : (
            <Form
              layout="vertical"
              onFinish={handleRegister}
              autoComplete="off"
              size="large"
            >
              <Form.Item
                name="username"
                label="用户名"
                rules={[
                  { required: true, message: '请输入用户名' },
                  { min: 3, message: '用户名至少 3 个字符' },
                  { max: 20, message: '用户名最多 20 个字符' },
                ]}
              >
                <Input prefix={<UserOutlined style={{ color: '#94A3B8' }} />} placeholder="设置用户名（用于登录）" autoComplete="off" />
              </Form.Item>
              <Form.Item
                name="email"
                label="邮箱（选填）"
                rules={[{ type: 'email', message: '请输入有效的邮箱地址' }]}
              >
                <Input prefix={<MailOutlined style={{ color: '#94A3B8' }} />} placeholder="用于找回密码（选填）" autoComplete="off" />
              </Form.Item>
              <Form.Item
                name="password"
                label="密码"
                rules={[
                  { required: true, message: '请输入密码' },
                  { min: 6, message: '密码至少 6 个字符' },
                ]}
              >
                <Input.Password prefix={<LockOutlined style={{ color: '#94A3B8' }} />} placeholder="设置密码（至少 6 位）" autoComplete="new-password" />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading} block style={{ height: 44, fontSize: 15, fontWeight: 600 }}>
                  注册并开启 7 天免费试用
                </Button>
              </Form.Item>
              <div style={{ textAlign: 'center', color: 'var(--text-3)', fontSize: 12.5 }}>
                已有账号？<a onClick={() => setActiveTab('login')} style={{ color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }}>立即登录</a>
              </div>
            </Form>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

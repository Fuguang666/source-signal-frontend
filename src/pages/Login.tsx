import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Form, Input, Button, message, Tabs } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { useAuthStore } from '@/store/auth';
import { authApi } from '@/api';
import LanguageSwitcher from '@/components/LanguageSwitcher';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  const handleLogin = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      await login(values.username, values.password);
      message.success(t('login.loginSuccess'));
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
      message.success(t('login.registerSuccess'));
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
      {/* 右上角语言切换 */}
      <div style={{ position: 'absolute', top: 20, right: 24, zIndex: 10 }}>
        <LanguageSwitcher />
      </div>

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
              <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: .5 }}>{t('login.title')}</div>
              <div style={{ color: 'var(--text-3)', fontSize: 12.5, letterSpacing: 1 }}>{t('login.subtitle')} · CROSS-BORDER SOURCING INTELLIGENCE</div>
            </div>
          </div>

          <h1 style={{ fontSize: 30, lineHeight: 1.3, fontWeight: 700, letterSpacing: .5 }}>
            {t('login.slogan1')}<br />{t('login.slogan2')}
          </h1>
          <p style={{ color: 'var(--text-2)', fontSize: 14.5, lineHeight: 1.8 }}>
            {t('login.desc')}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
            {[
              { grade: 's', text: 'Looking for a sourcing agent for pet products from China', meta: `${t('grade.s')} · ${t('grade.sDesc')}` },
              { grade: 'a', text: 'Considering hiring an agent for home organization products', meta: `${t('grade.a')} · ${t('grade.aDesc')}` },
              { grade: 'b', text: 'New to importing from China, how does sourcing work?', meta: `${t('grade.b')} · ${t('grade.bDesc')}` },
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
              { key: 'login', label: t('login.tabLogin') },
              { key: 'register', label: t('login.tabRegister') },
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
                label={t('login.username')}
                rules={[{ required: true, message: t('login.usernameRequired') }]}
              >
                <Input prefix={<UserOutlined style={{ color: '#94A3B8' }} />} placeholder={t('login.usernamePlaceholder')} autoComplete="off" />
              </Form.Item>
              <Form.Item
                name="password"
                label={t('login.password')}
                rules={[{ required: true, message: t('login.passwordRequired') }]}
              >
                <Input.Password prefix={<LockOutlined style={{ color: '#94A3B8' }} />} placeholder={t('login.passwordPlaceholder')} autoComplete="new-password" />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading} block style={{ height: 44, fontSize: 15, fontWeight: 600 }}>
                  {t('login.loginBtn')}
                </Button>
              </Form.Item>
              <div style={{ textAlign: 'center', color: 'var(--text-3)', fontSize: 12.5 }}>
                {t('login.noAccount')}<a onClick={() => setActiveTab('register')} style={{ color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }}>{t('login.goRegister')}</a>
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
                label={t('login.username')}
                rules={[
                  { required: true, message: t('login.usernameRequired') },
                  { min: 3, message: t('login.usernameMin') },
                  { max: 20, message: t('login.usernameMax') },
                ]}
              >
                <Input prefix={<UserOutlined style={{ color: '#94A3B8' }} />} placeholder={t('login.registerUsernamePlaceholder')} autoComplete="off" />
              </Form.Item>
              <Form.Item
                name="email"
                label={t('login.email')}
                rules={[{ type: 'email', message: t('login.emailInvalid') }]}
              >
                <Input prefix={<MailOutlined style={{ color: '#94A3B8' }} />} placeholder={t('login.emailPlaceholder')} autoComplete="off" />
              </Form.Item>
              <Form.Item
                name="password"
                label={t('login.password')}
                rules={[
                  { required: true, message: t('login.passwordRequired') },
                  { min: 6, message: t('login.passwordMin') },
                ]}
              >
                <Input.Password prefix={<LockOutlined style={{ color: '#94A3B8' }} />} placeholder={t('login.registerPasswordPlaceholder')} autoComplete="new-password" />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading} block style={{ height: 44, fontSize: 15, fontWeight: 600 }}>
                  {t('login.registerBtn')}
                </Button>
              </Form.Item>
              <div style={{ textAlign: 'center', color: 'var(--text-3)', fontSize: 12.5 }}>
                {t('login.hasAccount')}<a onClick={() => setActiveTab('login')} style={{ color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }}>{t('login.goLogin')}</a>
              </div>
            </Form>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

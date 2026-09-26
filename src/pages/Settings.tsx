import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Form, Input, Spin, message, Modal, Select } from 'antd';
import { accountApi, subscriptionApi } from '@/api';
import type { User, UserSubscriptionConfig, Subscription } from '@/types';
import { useAuthStore } from '@/store/auth';
import LanguageSwitcher from '@/components/LanguageSwitcher';

const ALL_CATEGORIES = ['宠物用品', '户外露营', '3C数码', '家居收纳', '服装配饰', '跨境电商物流', '其他'];
const ALL_REGIONS = ['北美', '欧洲', '东南亚', '澳洲', '其他'];

const LockIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" style={{ marginRight: 4 }}>
    <rect x="5" y="11" width="14" height="9" rx="2" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </svg>
);

const SettingsPage: React.FC = () => {
  const { t, i18n } = useTranslation();
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
      message.success(t('settings.profileSaved'));
    } finally {
      setSavingProfile(false);
    }
  };

  const handleRemoveCategory = (cat: string) => {
    const newCats = myCategories.filter((c) => c !== cat);
    accountApi.updateCategories(newCats).then((cfg) => {
      setConfig(cfg);
      message.success(t('settings.profileSaved'));
    }).catch(() => {});
  };

  const handleRemoveRegion = (region: string) => {
    const newRegions = myRegions.filter((r) => r !== region);
    accountApi.updateRegions(newRegions).then((cfg) => {
      setConfig(cfg);
      message.success(t('settings.profileSaved'));
    }).catch(() => {});
  };

  const handleAddCategory = () => {
    if (isPaid) {
      Modal.info({ title: t('settings.addCategory'), content: t('pricing.allCategories') });
    } else {
      message.info(t('pricing.upgradeDesc'));
    }
  };

  const handleAddRegion = () => {
    if (isPaid) {
      Modal.info({ title: t('settings.addRegion'), content: t('pricing.allRegions') });
    } else {
      message.info(t('pricing.upgradeDesc'));
    }
  };

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('language', lang);
    message.success(t('settings.languageChanged'));
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
          <h2>{t('settings.title')}</h2>
          <div className="desc">{t('settings.subtitle')}</div>
        </div>
      </div>

      <div style={{ maxWidth: 760 }}>
        {/* 个人资料 */}
        <div className="setting-group">
          <h3>{t('settings.profile')}</h3>
          <div className="sg-sub">{t('settings.profileDesc')}</div>
          <div className="ss-card ss-card-pad">
            <Form form={form} layout="vertical" onFinish={handleSaveProfile}>
              <Form.Item label={t('settings.username')} style={{ marginBottom: 16 }}>
                <Input value={profile?.username} disabled style={{ maxWidth: 360, background: '#F8FAFC' }} />
              </Form.Item>
              <Form.Item name="email" label={t('settings.email')} style={{ marginBottom: 16 }}>
                <Input placeholder={t('login.emailPlaceholder')} style={{ maxWidth: 360 }} />
              </Form.Item>
              <Form.Item name="companyName" label={t('settings.company')} style={{ marginBottom: 16 }}>
                <Input placeholder={t('login.companyPlaceholder')} style={{ maxWidth: 360 }} />
              </Form.Item>
              <Button type="primary" htmlType="submit" loading={savingProfile}>
                {t('settings.saveProfile')}
              </Button>
            </Form>
          </div>
        </div>

        {/* 语言设置 */}
        <div className="setting-group">
          <h3>{t('settings.language')}</h3>
          <div className="sg-sub">{t('settings.languageDesc')}</div>
          <div className="ss-card ss-card-pad">
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <span style={{ fontSize: 13, color: 'var(--text-2)', minWidth: 80 }}>{t('settings.selectLanguage')}</span>
              <Select
                value={i18n.language === 'en' ? 'en' : 'zh'}
                onChange={changeLanguage}
                style={{ width: 200 }}
                options={[
                  { value: 'zh', label: t('common.chinese') },
                  { value: 'en', label: t('common.english') },
                ]}
              />
              <LanguageSwitcher />
            </div>
          </div>
        </div>

        {/* 订阅配置 */}
        <div className="setting-group">
          <h3>{t('settings.subscription')}</h3>
          <div className="sg-sub">
            {t('settings.subscriptionDesc')}（{t('pricing.trialPlan')}: {subscription?.maxCategories || 2} {t('pricing.categories')} + {subscription?.maxRegions || 1} {t('pricing.regions')} · {t('pricing.paidPlan')} {t('pricing.allCategories')}）
          </div>
          <div className="ss-card ss-card-pad">
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>{t('settings.monitorCategories')}</div>
            <div className="chip-list" style={{ margin: '10px 0 18px' }}>
              {myCategories.map((c) => (
                <span key={c} className="chip">
                  {c}
                  <span className="x" onClick={() => handleRemoveCategory(c)}>×</span>
                </span>
              ))}
              {!isPaid && lockedCategories.map((c) => (
                <span key={c} className="chip locked" onClick={() => message.info(t('pricing.upgradeDesc'))}>
                  <LockIcon />{c}
                </span>
              ))}
              <span className="add-chip" onClick={handleAddCategory}>+ {t('settings.addCategory')}</span>
            </div>

            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>{t('settings.monitorRegions')}</div>
            <div className="chip-list" style={{ margin: '10px 0 4px' }}>
              {myRegions.map((r) => (
                <span key={r} className="chip">
                  {r}
                  <span className="x" onClick={() => handleRemoveRegion(r)}>×</span>
                </span>
              ))}
              {!isPaid && lockedRegions.map((r) => (
                <span key={r} className="chip locked" onClick={() => message.info(t('pricing.upgradeDesc'))}>
                  <LockIcon />{r}
                </span>
              ))}
              <span className="add-chip" onClick={handleAddRegion}>+ {t('settings.addRegion')}</span>
            </div>
          </div>
        </div>

        {/* 数据与历史 */}
        <div className="setting-group">
          <h3>{t('settings.dataPrivacy')}</h3>
          <div className="sg-sub">{t('settings.dataPrivacyDesc')}</div>
          <div className="ss-card ss-card-pad">
            <div className="meta-row" style={{ border: 'none', padding: '8px 0' }}>
              <span className="k" style={{ width: 'auto', marginRight: 12 }}>{t('pricing.history')}</span>
              <span className="v">
                {subscription?.historyDays || 7} {t('common.days')}（{isPaid ? t('pricing.paidPlan') : t('pricing.trialPlan')}）
              </span>
            </div>
            <div className="meta-row" style={{ border: 'none', padding: '8px 0' }}>
              <span className="k" style={{ width: 'auto', marginRight: 12 }}>{t('settings.exportData')}</span>
              <span className="v">
                <a onClick={() => message.info(t('notify.comingSoon'))} style={{ cursor: 'pointer' }}>{t('settings.exportData')}</a>
              </span>
            </div>
            <div className="meta-row" style={{ border: 'none', padding: '8px 0' }}>
              <span className="k" style={{ width: 'auto', marginRight: 12 }}>{t('settings.deleteAccount')}</span>
              <span className="v">
                <a onClick={() => {
                  Modal.confirm({
                    title: t('settings.deleteAccount'),
                    content: t('settings.deleteAccountDesc'),
                    onOk: () => message.success(t('common.success')),
                  });
                }} style={{ cursor: 'pointer', color: '#DC2626' }}>{t('settings.deleteAccount')}</a>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;

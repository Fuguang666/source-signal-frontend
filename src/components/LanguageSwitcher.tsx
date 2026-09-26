import { useTranslation } from 'react-i18next';
import { GlobalOutlined } from '@ant-design/icons';
import { Dropdown, message } from 'antd';
import type { MenuProps } from 'antd';

interface LanguageSwitcherProps {
  size?: 'small' | 'default';
  style?: React.CSSProperties;
}

export default function LanguageSwitcher({ size = 'default', style }: LanguageSwitcherProps) {
  const { i18n, t } = useTranslation();

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('language', lang);
    message.success(t('settings.languageChanged'));
  };

  const items: MenuProps['items'] = [
    {
      key: 'zh',
      label: '中文',
      onClick: () => changeLanguage('zh'),
    },
    {
      key: 'en',
      label: 'English',
      onClick: () => changeLanguage('en'),
    },
  ];

  const currentLang = i18n.language === 'en' ? 'EN' : '中';

  return (
    <Dropdown menu={{ items }} placement="bottomRight">
      <span
        style={{
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          color: 'var(--text-2)',
          fontSize: size === 'small' ? 13 : 14,
          padding: '4px 8px',
          borderRadius: 6,
          transition: 'all 0.2s',
          ...style,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'var(--bg-2)';
          e.currentTarget.style.color = 'var(--primary)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = 'var(--text-2)';
        }}
      >
        <GlobalOutlined />
        <span>{currentLang}</span>
      </span>
    </Dropdown>
  );
}

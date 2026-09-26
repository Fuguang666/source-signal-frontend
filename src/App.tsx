import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import AppLayout from '@/components/AppLayout';
import AdminLayout from '@/components/AdminLayout';
import LoginPage from '@/pages/Login';
import DashboardPage from '@/pages/Dashboard';
import LeadsPage from '@/pages/Leads';
import LeadDetailPage from '@/pages/LeadDetail';
import PricingPage from '@/pages/Pricing';
import NotifyPage from '@/pages/Notify';
import SettingsPage from '@/pages/Settings';
import AdminCollectorsPage from '@/pages/admin/Collectors';
import AdminUsersPage from '@/pages/admin/Users';
import { getToken } from '@/api/request';

// 路由守卫
const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (!getToken()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#0F766E',
          colorInfo: '#0F766E',
          colorSuccess: '#047857',
          colorWarning: '#D97706',
          colorError: '#DC2626',
          borderRadius: 8,
          fontFamily: '"PingFang SC", "Microsoft YaHei", "Noto Sans SC", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        },
        components: {
          Button: {
            controlHeight: 36,
            primaryShadow: 'none',
          },
          Input: {
            controlHeight: 38,
          },
          Select: {
            controlHeight: 36,
          },
          Table: {
            headerBg: '#FAFBFD',
            headerColor: '#94A3B8',
            rowHoverBg: '#F8FAFD',
            borderColor: '#E3E8EF',
          },
          Tabs: {
            itemColor: '#64748B',
            itemSelectedColor: '#0F766E',
            itemActiveColor: '#0F766E',
            inkBarColor: '#0F766E',
          },
          Switch: {
            colorPrimary: '#0F766E',
          },
        },
      }}
    >
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <RequireAuth>
                <AppLayout />
              </RequireAuth>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="leads" element={<LeadsPage />} />
            <Route path="lead/:id" element={<LeadDetailPage />} />
            <Route path="pricing" element={<PricingPage />} />
            <Route path="notify" element={<NotifyPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
          {/* 后台管理 */}
          <Route
            path="/admin"
            element={
              <RequireAuth>
                <AdminLayout />
              </RequireAuth>
            }
          >
            <Route index element={<Navigate to="/admin/collectors" replace />} />
            <Route path="collectors" element={<AdminCollectorsPage />} />
            <Route path="users" element={<AdminUsersPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
};

export default App;

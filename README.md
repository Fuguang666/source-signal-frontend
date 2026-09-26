# SourceSignal 前端

SourceSignal 跨境采购线索 SaaS 产品前端，基于 React 18 + TypeScript + Vite + Ant Design 5 构建。

## 技术栈

- **框架**: React 18 + TypeScript
- **构建工具**: Vite 5
- **UI 组件库**: Ant Design 5（自定义主题：信号青绿 #0F766E）
- **路由**: React Router 6
- **HTTP 客户端**: Axios（统一响应拦截 + Token 管理）
- **状态管理**: Zustand
- **图表**: ECharts（预留）

## 项目结构

```
frontend/
├── src/
│   ├── api/                    # API 接口层
│   │   ├── request.ts          # Axios 实例 + 拦截器
│   │   ├── auth.ts             # 认证接口
│   │   ├── lead.ts             # 线索接口
│   │   ├── dashboard.ts        # 仪表盘接口
│   │   ├── push.ts             # 推送通知接口
│   │   ├── subscription.ts     # 订阅套餐接口
│   │   ├── account.ts          # 账号设置接口
│   │   └── index.ts
│   ├── assets/                 # 静态资源
│   ├── components/             # 通用组件
│   │   ├── AppLayout.tsx       # 应用布局（侧边栏 + 顶栏）
│   │   ├── GradeBadge.tsx      # 等级徽章（S/A/B）
│   │   └── RadarMonitor.tsx    # 监控雷达动画
│   ├── pages/                  # 页面组件
│   │   ├── Login.tsx           # 登录/注册页
│   │   ├── Dashboard.tsx       # 仪表盘
│   │   ├── Leads.tsx           # 线索库
│   │   ├── LeadDetail.tsx      # 线索详情
│   │   ├── Pricing.tsx         # 订阅与套餐
│   │   ├── Notify.tsx          # 推送与通知
│   │   └── Settings.tsx        # 账号设置
│   ├── store/                  # 状态管理
│   │   └── auth.ts             # 认证状态（Zustand）
│   ├── styles/                 # 全局样式
│   │   └── global.css          # 设计系统变量 + 通用组件样式
│   ├── types/                  # TypeScript 类型定义
│   │   └── index.ts
│   ├── utils/                  # 工具函数
│   ├── App.tsx                 # 根组件（路由 + 主题配置）
│   ├── main.tsx                # 入口文件
│   └── vite-env.d.ts
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 页面清单

| 页面 | 路由 | 功能 |
|------|------|------|
| 登录/注册 | `/login` | 用户名密码登录、注册（7天免费试用） |
| 仪表盘 | `/dashboard` | 统计卡片、监控雷达、品类分布、最近推送时间线 |
| 线索库 | `/leads` | 多条件筛选、线索表格、分页、标记跟进 |
| 线索详情 | `/lead/:id` | 帖子原文、结构化标签、意向分级、跟进备注 |
| 订阅与套餐 | `/pricing` | 试用版/付费版对比、升级付费、年付优惠 |
| 推送与通知 | `/notify` | 推送渠道开关、推送频率设置、测试推送 |
| 账号设置 | `/settings` | 个人资料、订阅配置（品类/地区）、自定义关键词、数据隐私 |

## 设计系统

- **主色**: 信号青绿 `#0F766E`
- **S 级**: 琥珀 `#D97706`（高意向）
- **A 级**: 蓝 `#2F6FED`（中意向）
- **B 级**: 灰 `#7C8794`（低意向）
- **背景**: `#F4F6F9`，卡片: `#FFFFFF`
- **圆角**: 10px，侧边栏宽: 232px，顶栏高: 58px
- **字体**: PingFang SC / Microsoft YaHei

## 快速开始

### 前置条件

- Node.js >= 16
- 后端服务运行在 `http://localhost:8080`

### 安装依赖

```bash
cd frontend
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:5173/

开发服务器已配置 `/api` 代理到 `http://localhost:8080`，无需额外配置 CORS。

### 构建生产版本

```bash
npm run build
```

产物输出到 `dist/` 目录。

### 预览生产构建

```bash
npm run preview
```

## 后端 API 对接

前端通过 Axios 统一封装，自动附加 JWT Token，统一处理错误提示。

### 认证

- `POST /api/auth/login` - 登录
- `POST /api/auth/register` - 注册
- `POST /api/auth/logout` - 登出
- `POST /api/auth/change-password` - 修改密码

### 线索

- `GET /api/leads` - 分页查询线索（支持等级/品类/地区/需求类型/关键词筛选）
- `GET /api/leads/:id` - 线索详情
- `POST /api/leads/:id/mark` - 标记/取消标记
- `POST /api/leads/:id/note` - 保存备注
- `GET /api/leads/marked` - 已标记线索列表

### 仪表盘

- `GET /api/dashboard` - 仪表盘统计数据

### 推送通知

- `GET /api/push/notifications` - 通知列表
- `GET /api/push/notifications/unread-count` - 未读数
- `POST /api/push/notifications/read-all` - 全部已读
- `GET /api/push/channels` - 渠道列表
- `POST /api/push/channels/:channel/toggle` - 切换渠道
- `POST /api/push/channels/:channel/frequency` - 更新频率
- `POST /api/push/test` - 发送测试

### 订阅

- `GET /api/subscription` - 订阅信息
- `GET /api/subscription/plans` - 套餐列表
- `POST /api/subscription/upgrade` - 升级付费版

### 账号

- `GET /api/account/profile` - 个人资料
- `PUT /api/account/profile` - 更新资料
- `GET /api/account/config` - 订阅配置
- `PUT /api/account/config/categories` - 更新品类
- `PUT /api/account/config/regions` - 更新地区
- `PUT /api/account/config/keywords` - 更新关键词

## 测试账号

- 用户名: `admin`
- 密码: `admin123`

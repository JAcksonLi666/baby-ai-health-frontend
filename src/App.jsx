import React, { useState, useEffect } from 'react';
import { Layout, Menu, Typography, Select } from 'antd';
import {
  UploadOutlined,
  MessageOutlined,
  FileTextOutlined,
  UserOutlined,
  GlobalOutlined,
  HomeOutlined,
  ClockCircleOutlined,
  FilterOutlined,
  AlertOutlined,
  CoffeeOutlined,
  MedicineBoxOutlined,
  LineChartOutlined,
  BellOutlined,
  FileSearchOutlined,
  HeartOutlined,
  HistoryOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import UploadComponent from './components/Upload';
import Chat from './components/Chat';
import RecordManagement from './components/RecordManagement';
import Dashboard from './components/Dashboard';
import SleepRecords from './components/SleepRecords';
import DiaperRecords from './components/DiaperRecords';
import CryRecords from './components/CryRecords';
import FeedingRecords from './components/FeedingRecords';
import GrowthRecords from './components/GrowthRecords';
import GrowthChart from './components/GrowthChart';
import ReminderCenter from './components/ReminderCenter';
import LabReportParser from './components/LabReportParser';
import SymptomChecker from './components/SymptomChecker';
import ChatHistory from './components/ChatHistory';
import './App.css';

const { Header, Content, Footer } = Layout;
const { Title } = Typography;
const { Option } = Select;

// 路由配置
const routes = [
  { path: '/', element: <Dashboard /> },
  { path: '/upload', element: <UploadComponent /> },
  { path: '/chat', element: <Chat /> },
  { path: '/records', element: <RecordManagement /> },
  { path: '/sleep', element: <SleepRecords /> },
  { path: '/diaper', element: <DiaperRecords /> },
  { path: '/cry', element: <CryRecords /> },
  { path: '/feeding', element: <FeedingRecords /> },
  { path: '/growth', element: <GrowthRecords /> },
  { path: '/growth-chart', element: <GrowthChart /> },
  { path: '/reminder', element: <ReminderCenter /> },
  { path: '/lab-report', element: <LabReportParser /> },
  { path: '/symptom', element: <SymptomChecker /> },
  { path: '/chat-history', element: <ChatHistory /> },
];

function AppContent() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [openKeys, setOpenKeys] = useState([]);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  useEffect(() => {
    setOpenKeys(getOpenKeys());
  }, [location.pathname]);

  // 菜单项配置
  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: <NavLink to="/" className="nav-link">{t('nav.dashboard')}</NavLink>,
    },
    {
      key: 'records-group',
      icon: <FileTextOutlined />,
      label: t('nav.records'),
      children: [
        {
          key: '/sleep',
          icon: <ClockCircleOutlined />,
          label: <NavLink to="/sleep" className="nav-link">{t('nav.sleep')}</NavLink>,
        },
        {
          key: '/diaper',
          icon: <FilterOutlined />,
          label: <NavLink to="/diaper" className="nav-link">{t('nav.diaper')}</NavLink>,
        },
        {
          key: '/cry',
          icon: <AlertOutlined />,
          label: <NavLink to="/cry" className="nav-link">{t('nav.cry')}</NavLink>,
        },
        {
          key: '/feeding',
          icon: <CoffeeOutlined />,
          label: <NavLink to="/feeding" className="nav-link">{t('nav.feeding')}</NavLink>,
        },
        {
          key: '/growth',
          icon: <MedicineBoxOutlined />,
          label: <NavLink to="/growth" className="nav-link">{t('nav.growth')}</NavLink>,
        },
        {
          key: '/growth-chart',
          icon: <LineChartOutlined />,
          label: <NavLink to="/growth-chart" className="nav-link">{t('nav.growthChart')}</NavLink>,
        },
      ],
    },
    {
      key: 'services-group',
      icon: <MessageOutlined />,
      label: t('nav.services'),
      children: [
        {
          key: '/chat',
          icon: <MessageOutlined />,
          label: <NavLink to="/chat" className="nav-link">{t('nav.chat')}</NavLink>,
        },
        {
          key: '/lab-report',
          icon: <FileSearchOutlined />,
          label: <NavLink to="/lab-report" className="nav-link">{t('nav.labReport')}</NavLink>,
        },
        {
          key: '/symptom',
          icon: <HeartOutlined />,
          label: <NavLink to="/symptom" className="nav-link">{t('nav.symptom')}</NavLink>,
        },
        {
          key: '/chat-history',
          icon: <HistoryOutlined />,
          label: <NavLink to="/chat-history" className="nav-link">{t('nav.chatHistory')}</NavLink>,
        },
      ],
    },
    {
      key: 'system-group',
      icon: <BellOutlined />,
      label: t('nav.system'),
      children: [
        {
          key: '/reminder',
          icon: <BellOutlined />,
          label: <NavLink to="/reminder" className="nav-link">{t('nav.reminder')}</NavLink>,
        },
        {
          key: '/upload',
          icon: <UploadOutlined />,
          label: <NavLink to="/upload" className="nav-link">{t('nav.upload')}</NavLink>,
        },
      ],
    },
  ];

  // 获取当前选中的菜单key
  const getSelectedKey = () => {
    const path = location.pathname;
    // 精确匹配
    const exactMatch = menuItems.find(item => item.key === path);
    if (exactMatch) return [path];
    
    // 在子菜单中查找
    for (const item of menuItems) {
      if (item.children) {
        const child = item.children.find(c => c.key === path);
        if (child) return [path];
      }
    }
    return ['/'];
  };

  // 获取展开的菜单keys
  const getOpenKeys = () => {
    const path = location.pathname;
    const openKeys = [];
    for (const item of menuItems) {
      if (item.children) {
        const hasActiveChild = item.children.some(c => c.key === path);
        if (hasActiveChild) openKeys.push(item.key);
      }
    }
    return openKeys;
  };

  return (
    <Layout className="app-layout">
      <Header className="app-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <div className="logo">
            <UserOutlined className="logo-icon" />
            <Title level={3} className="logo-title">{t('app.title')}</Title>
          </div>
          <Menu
            mode="horizontal"
            theme="light"
            selectedKeys={getSelectedKey()}
            openKeys={openKeys}
            onOpenChange={(keys) => setOpenKeys(keys)}
            items={menuItems}
            className="nav-menu"
          />
          <div className="language-selector">
            <Select
              value={i18n.language}
              onChange={changeLanguage}
              style={{ width: 120 }}
              variant="outlined"
              prefix={<GlobalOutlined />}
            >
              <Option value="zh">中文</Option>
              <Option value="en">English</Option>
            </Select>
          </div>
        </div>
      </Header>
      <Content className="app-content">
        <Routes>
          {routes.map((route) => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
        </Routes>
      </Content>
      <Footer className="app-footer">
        <p>{t('app.title')} ©2026 - {t('app.subtitle')}</p>
      </Footer>
    </Layout>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;

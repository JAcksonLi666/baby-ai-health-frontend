import React, { useState } from 'react';
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
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
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
import './App.css';

const { Header, Content, Footer } = Layout;
const { Title } = Typography;
const { Option } = Select;

function App() {
  const [activeTab, setActiveTab] = useState('upload');
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const menuItems = [
    {
      key: 'dashboard',
      icon: <HomeOutlined />,
      label: t('nav.dashboard') || '仪表盘',
    },
    {
      key: 'upload',
      icon: <UploadOutlined />,
      label: t('nav.upload'),
    },
    {
      key: 'chat',
      icon: <MessageOutlined />,
      label: t('nav.chat'),
    },
    {
      key: 'sleep',
      icon: <ClockCircleOutlined />,
      label: t('nav.sleep') || '睡眠记录',
    },
    {
      key: 'diaper',
      icon: <FilterOutlined />,
      label: t('nav.diaper') || '排泄记录',
    },
    {
      key: 'cry',
      icon: <AlertOutlined />,
      label: t('nav.cry') || '哭声记录',
    },
    {
      key: 'feeding',
      icon: <CoffeeOutlined />,
      label: t('nav.feeding') || '喂养记录',
    },
    {
      key: 'growth',
      icon: <MedicineBoxOutlined />,
      label: t('nav.growth') || '生长发育',
    },
    {
      key: 'growth-chart',
      icon: <LineChartOutlined />,
      label: t('nav.growthChart') || '生长曲线',
    },
    {
      key: 'reminder',
      icon: <BellOutlined />,
      label: t('nav.reminder') || '提醒中心',
    },
    {
      key: 'records',
      icon: <FileTextOutlined />,
      label: t('nav.records'),
    },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'upload':
        return <UploadComponent />;
      case 'chat':
        return <Chat />;
      case 'sleep':
        return <SleepRecords />;
      case 'diaper':
        return <DiaperRecords />;
      case 'cry':
        return <CryRecords />;
      case 'feeding':
        return <FeedingRecords />;
      case 'growth':
        return <GrowthRecords />;
      case 'growth-chart':
        return <GrowthChart />;
      case 'reminder':
        return <ReminderCenter />;
      case 'records':
        return <RecordManagement />;
      default:
        return <Dashboard />;
    }
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
            items={menuItems}
            selectedKeys={[activeTab]}
            onClick={(e) => setActiveTab(e.key)}
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
        {renderContent()}
      </Content>
      <Footer className="app-footer">
        <p>{t('app.title')} ©2026 - {t('app.subtitle')}</p>
      </Footer>
    </Layout>
  );
}

export default App;

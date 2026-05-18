import React, { useState } from 'react';
import { Layout, Menu, Typography, Row, Col } from 'antd';
import { UploadOutlined, MessageOutlined, FileTextOutlined, UserOutlined } from '@ant-design/icons';
import UploadComponent from './components/Upload';
import Chat from './components/Chat';
import RecordManagement from './components/RecordManagement';
import './App.css';

const { Header, Content, Footer } = Layout;
const { Title } = Typography;

function App() {
  const [activeTab, setActiveTab] = useState('upload');

  const menuItems = [
    {
      key: 'upload',
      icon: <UploadOutlined />,
      label: '上传化验单',
    },
    {
      key: 'chat',
      icon: <MessageOutlined />,
      label: '智能问答',
    },
    {
      key: 'records',
      icon: <FileTextOutlined />,
      label: '档案管理',
    },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'upload':
        return <UploadComponent />;
      case 'chat':
        return <Chat />;
      case 'records':
        return <RecordManagement />;
      default:
        return <UploadComponent />;
    }
  };

  return (
    <Layout className="app-layout">
      <Header className="app-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <div className="logo">
            <UserOutlined className="logo-icon" />
            <Title level={3} className="logo-title">宝宝健康助手</Title>
          </div>
          <Menu
            mode="horizontal"
            items={menuItems}
            selectedKeys={[activeTab]}
            onClick={(e) => setActiveTab(e.key)}
            className="nav-menu"
          />
        </div>
      </Header>
      <Content className="app-content">
        {renderContent()}
      </Content>
      <Footer className="app-footer">
        <p>宝宝健康助手 ©2026 - 让健康管理更简单</p>
      </Footer>
    </Layout>
  );
}

export default App;

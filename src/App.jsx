import React from 'react';
import { Layout, Menu, Typography, Select } from 'antd';
import { UserOutlined, GlobalOutlined } from '@ant-design/icons';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { routes } from './config/routes.jsx';
import { menuConfig } from './config/menu.jsx';
import { useMenu } from './hooks/useMenu';
import { useTranslationEnhanced } from './hooks/useTranslationEnhanced';
import './App.css';

const { Header, Content, Footer } = Layout;
const { Title } = Typography;
const { Option } = Select;

function MenuItems({ config, translateMenu }) {
  const renderItem = (item) => {
    if (item.children) {
      return {
        key: item.key,
        icon: item.icon,
        label: translateMenu(item.label),
        children: item.children.map(child => ({
          key: child.route,
          icon: child.icon,
          label: (
            <NavLink to={child.route} className="nav-link">
              {translateMenu(child.label)}
            </NavLink>
          ),
        })),
      };
    }
    return {
      key: item.route,
      icon: item.icon,
      label: (
        <NavLink to={item.route} className="nav-link">
          {translateMenu(item.label)}
        </NavLink>
      ),
    };
  };

  return config.map(renderItem);
}

function AppContent() {
  const { t, changeLanguage, currentLanguage } = useTranslationEnhanced();
  const { selectedKeys, openKeys, handleOpenChange } = useMenu();

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
            selectedKeys={selectedKeys}
            openKeys={openKeys}
            onOpenChange={handleOpenChange}
            items={MenuItems({ config: menuConfig, translateMenu: t })}
            className="nav-menu"
          />
          <div className="language-selector">
            <Select
              value={currentLanguage}
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
            <Route key={route.key} path={route.path} element={route.element} />
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

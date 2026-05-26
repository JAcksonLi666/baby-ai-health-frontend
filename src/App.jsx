import React, { useState } from 'react';
import { Layout, Menu, Typography, Select, Drawer, Button } from 'antd';
import { UserOutlined, GlobalOutlined, MenuOutlined } from '@ant-design/icons';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <Layout className="app-layout">
      <Header className="app-header">
        <div className="header-content">
          <div className="logo">
            <UserOutlined className="logo-icon" />
            <Title level={3} className="logo-title">{t('app.title')}</Title>
          </div>
          
          {/* Desktop Navigation */}
          <div className="desktop-nav">
            <Menu
              mode="horizontal"
              theme="light"
              selectedKeys={selectedKeys}
              openKeys={openKeys}
              onOpenChange={handleOpenChange}
              items={MenuItems({ config: menuConfig, translateMenu: t })}
              className="nav-menu"
            />
          </div>
          
          <div className="header-actions">
            <div className="language-selector">
              <Select
                value={currentLanguage}
                onChange={changeLanguage}
                style={{ width: 100 }}
                variant="outlined"
                prefix={<GlobalOutlined />}
                size="small"
              >
                <Option value="zh">中文</Option>
                <Option value="en">English</Option>
              </Select>
            </div>
            
            {/* Mobile Menu Button */}
            <Button
              type="text"
              icon={<MenuOutlined />}
              className="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(true)}
            />
          </div>
        </div>
      </Header>
      
      {/* Mobile Navigation Drawer */}
      <Drawer
        title={t('app.title')}
        placement="right"
        onClose={() => setMobileMenuOpen(false)}
        open={mobileMenuOpen}
        className="mobile-drawer"
        width={280}
      >
        <Menu
          mode="inline"
          selectedKeys={selectedKeys}
          openKeys={openKeys}
          onOpenChange={handleOpenChange}
          items={MenuItems({ config: menuConfig, translateMenu: t })}
          className="mobile-nav-menu"
          onClick={() => setMobileMenuOpen(false)}
        />
      </Drawer>
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

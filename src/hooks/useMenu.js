import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { menuConfig } from '../config/menu.jsx';

export const useMenu = () => {
  const location = useLocation();
  const [openKeys, setOpenKeys] = useState([]);

  useEffect(() => {
    setOpenKeys(getOpenKeys());
  }, [location.pathname]);

  const getSelectedKey = () => {
    const path = location.pathname;
    for (const item of menuConfig) {
      if (item.route === path) return [path];
      if (item.children) {
        const child = item.children.find(c => c.route === path);
        if (child) return [path];
      }
    }
    return ['/'];
  };

  const getOpenKeys = () => {
    const path = location.pathname;
    const keys = [];
    for (const item of menuConfig) {
      if (item.children) {
        const hasActiveChild = item.children.some(c => c.route === path);
        if (hasActiveChild) keys.push(item.key);
      }
    }
    return keys;
  };

  const handleOpenChange = (keys) => {
    setOpenKeys(keys);
  };

  return {
    selectedKeys: getSelectedKey(),
    openKeys,
    handleOpenChange,
  };
};

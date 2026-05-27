import React, { ReactNode } from 'react';
import {
  UploadOutlined,
  MessageOutlined,
  FileTextOutlined,
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
import { routeKeys } from './routes';

export interface MenuItemConfig {
  key: string;
  icon?: ReactNode;
  route?: string;
  label: string;
  children?: MenuItemConfig[];
}

export const menuConfig: MenuItemConfig[] = [
  {
    key: 'dashboard',
    icon: <HomeOutlined />,
    route: routeKeys.dashboard,
    label: 'nav.dashboard',
  },
  {
    key: 'records-group',
    icon: <FileTextOutlined />,
    label: 'nav.records',
    children: [
      {
        key: 'sleep',
        icon: <ClockCircleOutlined />,
        route: routeKeys.sleep,
        label: 'nav.sleep',
      },
      {
        key: 'diaper',
        icon: <FilterOutlined />,
        route: routeKeys.diaper,
        label: 'nav.diaper',
      },
      {
        key: 'cry',
        icon: <AlertOutlined />,
        route: routeKeys.cry,
        label: 'nav.cry',
      },
      {
        key: 'feeding',
        icon: <CoffeeOutlined />,
        route: routeKeys.feeding,
        label: 'nav.feeding',
      },
      {
        key: 'growth',
        icon: <MedicineBoxOutlined />,
        route: routeKeys.growth,
        label: 'nav.growth',
      },
      {
        key: 'growth-chart',
        icon: <LineChartOutlined />,
        route: routeKeys.growthChart,
        label: 'nav.growthChart',
      },
    ],
  },
  {
    key: 'services-group',
    icon: <MessageOutlined />,
    label: 'nav.services',
    children: [
      {
        key: 'chat',
        icon: <MessageOutlined />,
        route: routeKeys.chat,
        label: 'nav.chat',
      },
      {
        key: 'lab-report',
        icon: <FileSearchOutlined />,
        route: routeKeys.labReport,
        label: 'nav.labReport',
      },
      {
        key: 'symptom',
        icon: <HeartOutlined />,
        route: routeKeys.symptom,
        label: 'nav.symptom',
      },
      {
        key: 'chat-history',
        icon: <HistoryOutlined />,
        route: routeKeys.chatHistory,
        label: 'nav.chatHistory',
      },
    ],
  },
  {
    key: 'system-group',
    icon: <BellOutlined />,
    label: 'nav.system',
    children: [
      {
        key: 'reminder',
        icon: <BellOutlined />,
        route: routeKeys.reminder,
        label: 'nav.reminder',
      },
      {
        key: 'upload',
        icon: <UploadOutlined />,
        route: routeKeys.upload,
        label: 'nav.upload',
      },
    ],
  },
];

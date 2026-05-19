import { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Tag,
  List,
  Button,
  Spin,
  message,
  Typography,
} from 'antd';
import {
  AlertOutlined,
  SyncOutlined,
  FilterOutlined,
  ClockCircleOutlined,
  InfoOutlined,
} from '@ant-design/icons';
import { dashboardService } from '../services/apiService';
import { REASON_MAP } from '../constants/cryConstants';
import './Dashboard.css';

const { Title, Text } = Typography;

const COLOR_MAP = {
  yellow: '黄色',
  green: '绿色',
  brown: '棕色',
  black: '黑色',
  red: '红色',
  white: '白色',
};

const COLOR_TAG_COLOR = {
  yellow: 'gold',
  green: 'green',
  brown: 'brown',
  black: 'black',
  red: 'red',
  white: 'default',
};

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const res = await dashboardService.getTodaySummary();
      if (res.success) {
        setSummary(res);
      } else {
        message.error(res.message || '获取数据失败');
      }
    } catch (error) {
      message.error('获取今日汇总失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const handleRefresh = () => {
    fetchSummary();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="flex justify-center items-center h-64">
        <Text type="secondary">暂无数据</Text>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold">今日汇总</h2>
          <p className="text-gray-500 mt-1">{date}</p>
        </div>
        <Button icon={<SyncOutlined />} onClick={handleRefresh}>
          刷新
        </Button>
      </div>

      <Row gutter={16}>
        <Col span={8}>
          <Card className="dashboard-card" hoverable>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-50 rounded-lg">
                <ClockCircleOutlined className="text-blue-500" />
              </div>
              <div>
                <Title level={4}>睡眠</Title>
                {summary.sleep?.is_ongoing && (
                  <Tag color="green">正在睡觉</Tag>
                )}
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Text type="secondary">总时长</Text>
                <Statistic value={summary.sleep?.total_display || '-'} />
              </div>
              <div className="flex justify-between items-center">
                <Text type="secondary">小睡次数</Text>
                <Statistic value={summary.sleep?.nap_count || 0} suffix="次" />
              </div>
              <div className="flex justify-between items-center">
                <Text type="secondary">小睡时长</Text>
                <Statistic value={summary.sleep?.nap_minutes || 0} suffix="分钟" />
              </div>
              <div className="flex justify-between items-center">
                <Text type="secondary">夜间睡眠</Text>
                <Statistic value={summary.sleep?.night_minutes || 0} suffix="分钟" />
              </div>
            </div>
          </Card>
        </Col>

        <Col span={8}>
          <Card className="dashboard-card" hoverable>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-orange-50 rounded-lg">
                <FilterOutlined className="text-orange-500" />
              </div>
              <div>
                <Title level={4}>排泄</Title>
                {summary.diaper?.has_abnormal && (
                  <Tag color="red">异常颜色</Tag>
                )}
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Text type="secondary">总次数</Text>
                <Statistic value={summary.diaper?.total_count || 0} suffix="次" />
              </div>
              <div className="flex justify-between items-center">
                <Text type="secondary">小便</Text>
                <Statistic value={summary.diaper?.pee_count || 0} suffix="次" />
              </div>
              <div className="flex justify-between items-center">
                <Text type="secondary">大便</Text>
                <Statistic value={summary.diaper?.poop_count || 0} suffix="次" />
              </div>
              <div className="flex justify-between items-center">
                <Text type="secondary">颜色：</Text>
                <div className="flex gap-1">
                  {(summary.diaper?.colors || []).map((color) => (
                    <Tag key={color} color={COLOR_TAG_COLOR[color] || 'default'}>
                      {COLOR_MAP[color] || color}
                    </Tag>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </Col>

        <Col span={8}>
          <Card className="dashboard-card" hoverable>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-50 rounded-lg">
                <AlertOutlined className="text-red-500" />
              </div>
              <div>
                <Title level={4}>哭声</Title>
                {summary.cry?.is_ongoing && (
                  <Tag color="red">正在哭闹</Tag>
                )}
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Text type="secondary">累计时长</Text>
                <Statistic value={summary.cry?.total_minutes || 0} suffix="分钟" />
              </div>
              <div className="flex justify-between items-center">
                <Text type="secondary">哭闹次数</Text>
                <Statistic value={summary.cry?.total_count || 0} suffix="次" />
              </div>
              <div className="flex justify-between items-center">
                <Text type="secondary">主要原因</Text>
                <Tag
                  color="orange"
                >
                  {summary.cry?.top_reason
                    ? REASON_MAP[summary.cry.top_reason]
                    : '-'}
                </Tag>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Card title="智能洞察" className="mt-6">
        <List
          dataSource={summary.insights || []}
          renderItem={(item, index) => (
            <List.Item key={index}>
              <InfoOutlined className="text-yellow-500 mr-2" />
              {item}
            </List.Item>
          )}
          locale={{ emptyText: '暂无智能洞察' }}
        />
      </Card>
    </div>
  );
};

export default Dashboard;

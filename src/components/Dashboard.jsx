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
import { useTranslation } from 'react-i18next';
import { dashboardService } from '../services/apiService';
import { REASON_MAP } from '../constants/cryConstants';
import './Dashboard.css';

const { Title, Text } = Typography;

const Dashboard = () => {
  const { t } = useTranslation();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const COLOR_MAP = {
    yellow: t('diaper.colorOptions.yellow'),
    green: t('diaper.colorOptions.green'),
    brown: t('diaper.colorOptions.brown'),
    black: t('diaper.colorOptions.black'),
    red: t('diaper.colorOptions.red'),
    white: t('diaper.colorOptions.white'),
  };

  const COLOR_TAG_COLOR = {
    yellow: 'gold',
    green: 'green',
    brown: 'brown',
    black: 'black',
    red: 'red',
    white: 'default',
  };

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const res = await dashboardService.getTodaySummary();
      if (res.success) {
        setSummary(res);
      } else {
        message.error(res.message || t('dashboard.noData'));
      }
    } catch (error) {
      message.error(t('dashboard.noData'));
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
        <Text type="secondary">{t('dashboard.noData')}</Text>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold">{t('dashboard.title')}</h2>
          <p className="text-gray-500 mt-1">{date}</p>
        </div>
        <Button icon={<SyncOutlined />} onClick={handleRefresh}>
          {t('dashboard.refresh')}
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
                <Title level={4}>{t('dashboard.sleep')}</Title>
                {summary.sleep?.is_ongoing && (
                  <Tag color="green">{t('dashboard.sleeping')}</Tag>
                )}
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Text type="secondary">{t('dashboard.totalDuration')}</Text>
                <Statistic value={summary.sleep?.total_display || '-'} />
              </div>
              <div className="flex justify-between items-center">
                <Text type="secondary">{t('dashboard.napCount')}</Text>
                <Statistic value={summary.sleep?.nap_count || 0} suffix={t('dashboard.times')} />
              </div>
              <div className="flex justify-between items-center">
                <Text type="secondary">{t('dashboard.napMinutes')}</Text>
                <Statistic value={summary.sleep?.nap_minutes || 0} suffix={t('dashboard.minutes')} />
              </div>
              <div className="flex justify-between items-center">
                <Text type="secondary">{t('dashboard.nightMinutes')}</Text>
                <Statistic value={summary.sleep?.night_minutes || 0} suffix={t('dashboard.minutes')} />
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
                <Title level={4}>{t('dashboard.diaper')}</Title>
                {summary.diaper?.has_abnormal && (
                  <Tag color="red">{t('dashboard.abnormalColor')}</Tag>
                )}
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Text type="secondary">{t('dashboard.diaperCount')}</Text>
                <Statistic value={summary.diaper?.total_count || 0} suffix={t('dashboard.times')} />
              </div>
              <div className="flex justify-between items-center">
                <Text type="secondary">{t('diaper.typeOptions.wet')}</Text>
                <Statistic value={summary.diaper?.pee_count || 0} suffix={t('dashboard.times')} />
              </div>
              <div className="flex justify-between items-center">
                <Text type="secondary">{t('diaper.typeOptions.dirty')}</Text>
                <Statistic value={summary.diaper?.poop_count || 0} suffix={t('dashboard.times')} />
              </div>
              <div className="flex justify-between items-center">
                <Text type="secondary">{t('dashboard.diaperColor')}：</Text>
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
                <Title level={4}>{t('dashboard.cry')}</Title>
                {summary.cry?.is_ongoing && (
                  <Tag color="red">{t('cry.title')}</Tag>
                )}
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Text type="secondary">{t('dashboard.totalDuration')}</Text>
                <Statistic value={summary.cry?.total_minutes || 0} suffix={t('dashboard.minutes')} />
              </div>
              <div className="flex justify-between items-center">
                <Text type="secondary">{t('dashboard.cryCount')}</Text>
                <Statistic value={summary.cry?.total_count || 0} suffix={t('dashboard.times')} />
              </div>
              <div className="flex justify-between items-center">
                <Text type="secondary">{t('dashboard.lastCry')}</Text>
                <Tag color="orange">
                  {summary.cry?.top_reason
                    ? REASON_MAP[summary.cry.top_reason]
                    : '-'}
                </Tag>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Card title={t('dashboard.insights')} className="mt-6">
        <List
          dataSource={summary.insights || []}
          renderItem={(item, index) => (
            <List.Item key={index}>
              <InfoOutlined className="text-yellow-500 mr-2" />
              {item}
            </List.Item>
          )}
          locale={{ emptyText: t('dashboard.noData') }}
        />
      </Card>
    </div>
  );
};

export default Dashboard;

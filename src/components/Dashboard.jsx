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
import { dashboardService } from '../services';
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
      <div className="dashboard-loading">
        <Spin size="large" />
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="dashboard-loading">
        <Text type="secondary">{t('dashboard.noData')}</Text>
      </div>
    );
  }

  return (
    <div>
      <div className="dashboard-header">
        <div>
          <h2 className="dashboard-title">{t('dashboard.title')}</h2>
          <p className="dashboard-date">{date}</p>
        </div>
        <Button icon={<SyncOutlined />} onClick={handleRefresh}>
          {t('dashboard.refresh')}
        </Button>
      </div>

      <Row gutter={16}>
        <Col xs={24} sm={12} md={8}>
          <Card className="dashboard-card" hoverable>
            <div className="dashboard-card-header">
              <div className="dashboard-icon dashboard-icon-sleep">
                <ClockCircleOutlined />
              </div>
              <div>
                <Title level={4}>{t('dashboard.sleep')}</Title>
                {summary.sleep?.is_ongoing && (
                  <Tag color="green">{t('dashboard.sleeping')}</Tag>
                )}
              </div>
            </div>
            <div className="dashboard-stat-list">
              <div className="dashboard-stat-row">
                <Text type="secondary">{t('dashboard.totalDuration')}</Text>
                <Statistic value={summary.sleep?.total_display || '-'} />
              </div>
              <div className="dashboard-stat-row">
                <Text type="secondary">{t('dashboard.napCount')}</Text>
                <Statistic value={summary.sleep?.nap_count || 0} suffix={t('dashboard.times')} />
              </div>
              <div className="dashboard-stat-row">
                <Text type="secondary">{t('dashboard.napMinutes')}</Text>
                <Statistic value={summary.sleep?.nap_minutes || 0} suffix={t('dashboard.minutes')} />
              </div>
              <div className="dashboard-stat-row">
                <Text type="secondary">{t('dashboard.nightMinutes')}</Text>
                <Statistic value={summary.sleep?.night_minutes || 0} suffix={t('dashboard.minutes')} />
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8}>
          <Card className="dashboard-card" hoverable>
            <div className="dashboard-card-header">
              <div className="dashboard-icon dashboard-icon-diaper">
                <FilterOutlined />
              </div>
              <div>
                <Title level={4}>{t('dashboard.diaper')}</Title>
                {summary.diaper?.has_abnormal && (
                  <Tag color="red">{t('dashboard.abnormalColor')}</Tag>
                )}
              </div>
            </div>
            <div className="dashboard-stat-list">
              <div className="dashboard-stat-row">
                <Text type="secondary">{t('dashboard.diaperCount')}</Text>
                <Statistic value={summary.diaper?.total_count || 0} suffix={t('dashboard.times')} />
              </div>
              <div className="dashboard-stat-row">
                <Text type="secondary">{t('diaper.typeOptions.wet')}</Text>
                <Statistic value={summary.diaper?.pee_count || 0} suffix={t('dashboard.times')} />
              </div>
              <div className="dashboard-stat-row">
                <Text type="secondary">{t('diaper.typeOptions.dirty')}</Text>
                <Statistic value={summary.diaper?.poop_count || 0} suffix={t('dashboard.times')} />
              </div>
              <div className="dashboard-stat-row">
                <Text type="secondary">{t('dashboard.diaperColor')}：</Text>
                <div className="dashboard-color-tags">
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

        <Col xs={24} sm={12} md={8}>
          <Card className="dashboard-card" hoverable>
            <div className="dashboard-card-header">
              <div className="dashboard-icon dashboard-icon-cry">
                <AlertOutlined />
              </div>
              <div>
                <Title level={4}>{t('dashboard.cry')}</Title>
                {summary.cry?.is_ongoing && (
                  <Tag color="red">{t('cry.title')}</Tag>
                )}
              </div>
            </div>
            <div className="dashboard-stat-list">
              <div className="dashboard-stat-row">
                <Text type="secondary">{t('dashboard.totalDuration')}</Text>
                <Statistic value={summary.cry?.total_minutes || 0} suffix={t('dashboard.minutes')} />
              </div>
              <div className="dashboard-stat-row">
                <Text type="secondary">{t('dashboard.cryCount')}</Text>
                <Statistic value={summary.cry?.total_count || 0} suffix={t('dashboard.times')} />
              </div>
              <div className="dashboard-stat-row">
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

      <Card title={t('dashboard.insights')} className="dashboard-insights">
        <List
          dataSource={summary.insights || []}
          renderItem={(item, index) => (
            <List.Item key={index}>
              <InfoOutlined className="dashboard-insight-icon" />
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

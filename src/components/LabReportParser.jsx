import { useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Card,
  Table,
  Tag,
  Select,
  Input,
  Button,
  Statistic,
  Row,
  Col,
  Form,
  Space,
  message,
  Spin,
  Descriptions,
} from 'antd';
import {
  FileSearchOutlined,
  CheckCircleOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { labReportService } from '../services';
import './LabReportParser.css';

const LabReportParser = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState(null);
  const [monthAge, setMonthAge] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [form] = Form.useForm();

  // Report type options for the selector
  const REPORT_TYPES = useMemo(
    () => [
      { value: 'blood_routine', label: t('labReport.reportTypes.blood_routine') },
      { value: 'urine_routine', label: t('labReport.reportTypes.urine_routine') },
      { value: 'liver_function', label: t('labReport.reportTypes.liver_function') },
      { value: 'kidney_function', label: t('labReport.reportTypes.kidney_function') },
    ],
    [t]
  );

  // Status color mapping for indicator tags
  const STATUS_CONFIG = useMemo(
    () => ({
      normal: { color: 'green', text: t('labReport.statusOptions.normal') },
      low: { color: 'blue', text: t('labReport.statusOptions.low') },
      high: { color: 'orange', text: t('labReport.statusOptions.high') },
      critical: { color: 'red', text: t('labReport.statusOptions.critical') },
    }),
    [t]
  );

  // Table column definitions for lab report indicators
  const getColumns = () => [
    {
      title: t('labReport.indicatorName'),
      dataIndex: 'name',
      key: 'name',
      width: 160,
    },
    {
      title: t('labReport.value'),
      dataIndex: 'value',
      key: 'value',
      width: 100,
      render: (val) => (val != null ? val : '-'),
    },
    {
      title: t('labReport.unit'),
      dataIndex: 'unit',
      key: 'unit',
      width: 80,
      render: (val) => val || '-',
    },
    {
      title: t('labReport.referenceRange'),
      dataIndex: 'reference_range',
      key: 'reference_range',
      width: 140,
      render: (val) => val || '-',
    },
    {
      title: t('labReport.status'),
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status) => {
        const config = STATUS_CONFIG[status] || STATUS_CONFIG.normal;
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
  ];

  // Handle lab report evaluation
  const handleEvaluate = useCallback(async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const payload = {
        report_type: values.report_type,
        month_age: values.month_age,
        indicators: values.indicators
          ? values.indicators
              .split('\n')
              .filter((line) => line.trim())
              .map((line) => {
                const parts = line.split(/[,\t，]/);
                return {
                  name: parts[0]?.trim() || '',
                  value: parts[1]?.trim() || '',
                  unit: parts[2]?.trim() || '',
                };
              })
          : [],
      };

      const res = await labReportService.evaluate(payload);
      if (res.success) {
        setReportData(res.data);
        message.success(t('labReport.success'));
      } else {
        message.error(res.message || t('labReport.parseError'));
      }
    } catch (error) {
      if (error.errorFields) return; // form validation error
      message.error(t('labReport.error'));
    } finally {
      setLoading(false);
    }
  }, [form, t]);

  // Reset form and results
  const handleReset = () => {
    form.resetFields();
    setReportType(null);
    setMonthAge(null);
    setReportData(null);
  };

  // Count indicators by status
  const getStatusCounts = () => {
    if (!reportData?.indicators) return {};
    return reportData.indicators.reduce((acc, item) => {
      const status = item.status || 'normal';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
  };

  const statusCounts = getStatusCounts();
  const abnormalCount =
    (statusCounts.low || 0) +
    (statusCounts.high || 0) +
    (statusCounts.critical || 0);

  return (
    <div>
      {/* Input section */}
      <Card
        title={
          <Space>
            <FileSearchOutlined />
            <span>{t('labReport.title')}</span>
          </Space>
        }
        style={{ marginBottom: 16 }}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item
                label={t('labReport.reportType')}
                name="report_type"
                rules={[{ required: true, message: t('labReport.selectReportType') }]}
              >
                <Select
                  placeholder={t('labReport.selectReportType')}
                  options={REPORT_TYPES}
                  onChange={(val) => setReportType(val)}
                  allowClear
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                label={t('labReport.monthAge')}
                name="month_age"
                rules={[{ required: true, message: t('labReport.selectMonthAge') }]}
              >
                <Select
                  placeholder={t('labReport.selectMonthAge')}
                  onChange={(val) => setMonthAge(val)}
                  allowClear
                  showSearch
                >
                  {Array.from({ length: 36 }, (_, i) => i + 1).map((m) => (
                    <Select.Option key={m} value={m}>
                      {m} {t('labReport.months')}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item label=" ">
                <Space>
                  <Button
                    type="primary"
                    onClick={handleEvaluate}
                    loading={loading}
                    icon={<FileSearchOutlined />}
                  >
                    {t('labReport.parseButton')}
                  </Button>
                  <Button onClick={handleReset}>{t('labReport.reset')}</Button>
                </Space>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            label={t('labReport.indicators')}
            name="indicators"
            extra={t('labReport.indicatorsHint')}
          >
            <Input.TextArea
              rows={6}
              placeholder={t('labReport.indicatorsPlaceholder')}
            />
          </Form.Item>
        </Form>
      </Card>

      {/* Results section */}
      {reportData && (
        <Spin spinning={loading}>
          {/* Report type tag */}
          <Card
            title={t('labReport.result')}
            extra={
              reportType && (
                <Tag color="blue">
                  {REPORT_TYPES.find((t) => t.value === reportType)?.label ||
                    reportType}
                </Tag>
              )
            }
          >
            {/* Summary statistics */}
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col xs={24} sm={12} md={6}>
                <Statistic
                  title={t('labReport.totalIndicators')}
                  value={reportData.indicators?.length || 0}
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Statistic
                  title={t('labReport.normal')}
                  value={statusCounts.normal || 0}
                  valueStyle={{ color: '#52c41a' }}
                  prefix={<CheckCircleOutlined />}
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Statistic
                  title={t('labReport.abnormal')}
                  value={abnormalCount}
                  valueStyle={{ color: abnormalCount > 0 ? '#faad14' : '#52c41a' }}
                  prefix={<WarningOutlined />}
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Statistic
                  title={t('labReport.critical')}
                  value={statusCounts.critical || 0}
                  valueStyle={{
                    color: statusCounts.critical > 0 ? '#ff4d4f' : '#52c41a',
                  }}
                />
              </Col>
            </Row>

            {/* Indicators table */}
            <Table
              columns={getColumns()}
              dataSource={reportData.indicators || []}
              rowKey={(record, index) => record.name || `indicator-${index}`}
              pagination={false}
              size="small"
              bordered
              rowClassName={(record) => {
                if (record.status === 'critical') return 'lab-row-critical';
                if (record.status === 'high') return 'lab-row-high';
                if (record.status === 'low') return 'lab-row-low';
                return '';
              }}
            />

            {/* Summary section */}
            {reportData.summary && (
              <Descriptions
                title={t('labReport.summary')}
                bordered
                size="small"
                style={{ marginTop: 16 }}
              >
                <Descriptions.Item label={t('labReport.summary')} span={3}>
                  {reportData.summary}
                </Descriptions.Item>
                <Descriptions.Item label={t('labReport.abnormalCount')} span={3}>
                  <Tag color={abnormalCount > 0 ? 'orange' : 'green'}>
                    {abnormalCount} {t('labReport.items')}
                  </Tag>
                </Descriptions.Item>
              </Descriptions>
            )}
          </Card>
        </Spin>
      )}
    </div>
  );
};

export default LabReportParser;

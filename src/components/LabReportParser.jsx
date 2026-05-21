import { useState, useCallback } from 'react';
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
import { labReportService } from '../services/apiService';

// Report type options for the selector
const REPORT_TYPES = [
  { value: 'blood_routine', label: '血液常规' },
  { value: 'urine_routine', label: '尿液常规' },
  { value: 'liver_function', label: '肝功能' },
  { value: 'kidney_function', label: '肾功能' },
];

// Status color mapping for indicator tags
const STATUS_CONFIG = {
  normal: { color: 'green', text: '正常' },
  low: { color: 'blue', text: '偏低' },
  high: { color: 'orange', text: '偏高' },
  critical: { color: 'red', text: '危急' },
};

// Table column definitions for lab report indicators
const getColumns = () => [
  {
    title: '指标名称',
    dataIndex: 'name',
    key: 'name',
    width: 160,
  },
  {
    title: '测量值',
    dataIndex: 'value',
    key: 'value',
    width: 100,
    render: (val) => (val != null ? val : '-'),
  },
  {
    title: '单位',
    dataIndex: 'unit',
    key: 'unit',
    width: 80,
    render: (val) => val || '-',
  },
  {
    title: '参考范围',
    dataIndex: 'reference_range',
    key: 'reference_range',
    width: 140,
    render: (val) => val || '-',
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 80,
    render: (status) => {
      const config = STATUS_CONFIG[status] || STATUS_CONFIG.normal;
      return <Tag color={config.color}>{config.text}</Tag>;
    },
  },
];

const LabReportParser = () => {
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState(null);
  const [monthAge, setMonthAge] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [form] = Form.useForm();

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
        message.success('化验单解析完成');
      } else {
        message.error(res.message || '解析失败');
      }
    } catch (error) {
      if (error.errorFields) return; // form validation error
      message.error('化验单解析失败');
    } finally {
      setLoading(false);
    }
  }, [form]);

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
            <span>化验单解析</span>
          </Space>
        }
        className="mb-4"
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item
                label="报告类型"
                name="report_type"
                rules={[{ required: true, message: '请选择报告类型' }]}
              >
                <Select
                  placeholder="请选择报告类型"
                  options={REPORT_TYPES}
                  onChange={(val) => setReportType(val)}
                  allowClear
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                label="宝宝月龄"
                name="month_age"
                rules={[{ required: true, message: '请输入宝宝月龄' }]}
              >
                <Select
                  placeholder="请选择月龄"
                  onChange={(val) => setMonthAge(val)}
                  allowClear
                  showSearch
                >
                  {Array.from({ length: 36 }, (_, i) => i + 1).map((m) => (
                    <Select.Option key={m} value={m}>
                      {m} 个月
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
                    解析化验单
                  </Button>
                  <Button onClick={handleReset}>重置</Button>
                </Space>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            label="化验指标数据"
            name="indicators"
            extra="每行一个指标，格式：指标名称,测量值,单位（例如：白细胞,8.5,10^9/L）"
          >
            <Input.TextArea
              rows={6}
              placeholder="白细胞,8.5,10^9/L&#10;红细胞,4.5,10^12/L&#10;血红蛋白,120,g/L"
            />
          </Form.Item>
        </Form>
      </Card>

      {/* Results section */}
      {reportData && (
        <Spin spinning={loading}>
          {/* Report type tag */}
          <Card
            title="解析结果"
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
            <Row gutter={16} className="mb-4">
              <Col span={6}>
                <Statistic
                  title="总指标数"
                  value={reportData.indicators?.length || 0}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="正常"
                  value={statusCounts.normal || 0}
                  valueStyle={{ color: '#52c41a' }}
                  prefix={<CheckCircleOutlined />}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="异常"
                  value={abnormalCount}
                  valueStyle={{ color: abnormalCount > 0 ? '#faad14' : '#52c41a' }}
                  prefix={<WarningOutlined />}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="危急"
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
              rowKey={(record) => record.name || Math.random()}
              pagination={false}
              size="small"
              bordered
              rowClassName={(record) => {
                if (record.status === 'critical') return 'row-critical';
                if (record.status === 'high') return 'row-high';
                if (record.status === 'low') return 'row-low';
                return '';
              }}
            />

            {/* Summary section */}
            {reportData.summary && (
              <Descriptions
                title="总结摘要"
                bordered
                size="small"
                className="mt-4"
              >
                <Descriptions.Item label="总结" span={3}>
                  {reportData.summary}
                </Descriptions.Item>
                <Descriptions.Item label="异常指标数量" span={3}>
                  <Tag color={abnormalCount > 0 ? 'orange' : 'green'}>
                    {abnormalCount} 项
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

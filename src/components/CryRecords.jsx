import { useState, useEffect, useCallback } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Tag,
  Popconfirm,
  message,
  Spin,
  Card,
  Alert,
  Typography,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { cryService } from '../services/apiService';
import { REASON_MAP, REASON_TAG_COLOR } from '../constants/cryConstants';

const { TextArea } = Input;
const { Text } = Typography;

const CryRecords = () => {
  const [records, setRecords] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();
  const [dateRange, setDateRange] = useState([]);
  const [analyzeModalOpen, setAnalyzeModalOpen] = useState(false);
  const [analyzeLoading, setAnalyzeLoading] = useState(false);
  const [analyzeResult, setAnalyzeResult] = useState(null);
  const [ongoingCry, setOngoingCry] = useState(null);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const res = await cryService.listRecords();
      if (res.success) {
        setRecords(res.records || []);
        setTotal(res.total || (res.records || []).length);
      } else {
        message.error(res.message || '获取记录失败');
      }
    } catch (error) {
      message.error('获取哭声记录失败');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchOngoingCry = useCallback(async () => {
    try {
      const res = await cryService.getOngoing();
      if (res.success && res.data) {
        setOngoingCry(res.data);
      } else {
        setOngoingCry(null);
      }
    } catch (error) {
      setOngoingCry(null);
    }
  }, []);

  useEffect(() => {
    fetchRecords();
    fetchOngoingCry();
    const interval = setInterval(fetchOngoingCry, 30000);
    return () => clearInterval(interval);
  }, [fetchRecords, fetchOngoingCry]);

  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    setModalOpen(true);
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    form.setFieldsValue({
      start_time: record.start_time ? dayjs(record.start_time) : null,
      end_time: record.end_time ? dayjs(record.end_time) : null,
      reason: record.reason,
      intensity: record.intensity?.toString(),
      soothing_method: record.soothing_method,
      notes: record.notes,
      has_audio: record.has_audio,
    });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      const res = await cryService.deleteRecord(id);
      if (res.success) {
        message.success('删除成功');
        fetchRecords();
      } else {
        message.error(res.message || '删除失败');
      }
    } catch (err) {
      message.error('删除失败');
    }
  };

  const handleSubmit = async (values) => {
    const payload = {
      start_time: values.start_time?.format('YYYY-MM-DD HH:mm'),
      end_time: values.end_time?.format('YYYY-MM-DD HH:mm'),
      reason: values.reason,
      intensity: parseInt(values.intensity) || 1,
      soothing_method: values.soothing_method,
      notes: values.notes,
      has_audio: values.has_audio,
    };

    try {
      if (editingRecord) {
        await cryService.updateRecord(editingRecord.id, payload);
        message.success('更新成功');
      } else {
        await cryService.createRecord(payload);
        message.success('记录成功');
      }
      setModalOpen(false);
      fetchRecords();
    } catch (error) {
      message.error(editingRecord ? '更新失败' : '记录失败');
    }
  };

  const handleAnalyze = async () => {
    setAnalyzeModalOpen(true);
    setAnalyzeLoading(true);
    try {
      const res = await cryService.analyzeReason();
      if (res.success) {
        setAnalyzeResult(res);
      } else {
        message.error(res.message || '分析失败');
      }
    } catch (error) {
      message.error('分析哭声原因失败');
    } finally {
      setAnalyzeLoading(false);
    }
  };

  const getDuration = (start, end) => {
    if (!start || !end) return '-';
    try {
      const startDate = dayjs(start);
      const endDate = dayjs(end);
      const minutes = endDate.diff(startDate, 'minute');
      if (minutes <= 0) return '0分钟';
      if (minutes < 60) return `${minutes}分钟`;
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0 ? `${hours}小时${remainingMinutes}分钟` : `${hours}小时`;
    } catch {
      return '-';
    }
  };

  const columns = [
    {
      title: '开始时间',
      dataIndex: 'start_time',
      key: 'start_time',
      width: 150,
    },
    {
      title: '结束时间',
      dataIndex: 'end_time',
      key: 'end_time',
      width: 150,
      render: (text) => text || '-',
    },
    {
      title: '时长',
      dataIndex: 'duration',
      key: 'duration',
      width: 100,
      render: (_, record) => getDuration(record.start_time, record.end_time),
    },
    {
      title: '原因',
      dataIndex: 'reason',
      key: 'reason',
      width: 100,
      render: (reason) => (
        <Tag color={REASON_TAG_COLOR[reason] || 'default'}>
          {REASON_MAP[reason] || reason}
        </Tag>
      ),
    },
    {
      title: '强度',
      dataIndex: 'intensity',
      key: 'intensity',
      width: 80,
      render: (intensity) => (
        <div>
          {Array.from({ length: 5 }, (_, i) => (
            <span
              key={i}
              style={{
                color: i < (intensity || 1) ? '#FF6B6B' : '#E0E0E0',
                fontSize: '14px',
              }}
            >
              ★
            </span>
          ))}
        </div>
      ),
    },
    {
      title: '安抚方式',
      dataIndex: 'soothing_method',
      key: 'soothing_method',
      width: 100,
      render: (text) => text || '-',
    },
    {
      title: '音频',
      dataIndex: 'has_audio',
      key: 'has_audio',
      width: 60,
      render: (has_audio) => (has_audio ? '是' : '否'),
    },
    {
      title: '备注',
      dataIndex: 'notes',
      key: 'notes',
      width: 120,
      render: (text) => text || '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <div className="flex gap-2">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除该记录？"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button type="text" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div>
      {ongoingCry && (
        <Alert
          message="宝宝正在哭闹"
          description={`开始时间：${ongoingCry.start_time}`}
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <Card
        title="哭声记录"
        extra={
          <div className="flex gap-2">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAdd}
            >
              记录哭闹
            </Button>
            <Button
              icon={<ExclamationCircleOutlined />}
              onClick={handleAnalyze}
            >
              分析哭声原因
            </Button>
          </div>
        }
      >
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={records}
            rowKey="id"
            pagination={{
              total,
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
            }}
            variant="bordered"
          />
        </Spin>
      </Card>

      <Modal
        title={editingRecord ? '编辑哭声记录' : '记录哭闹'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            label="开始时间"
            name="start_time"
            rules={[{ required: true, message: '请选择开始时间' }]}
          >
            <DatePicker
              showTime
              format="YYYY-MM-DD HH:mm"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item label="结束时间" name="end_time">
            <DatePicker
              showTime
              format="YYYY-MM-DD HH:mm"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            label="原因"
            name="reason"
            rules={[{ required: true, message: '请选择原因' }]}
          >
            <Select style={{ width: '100%' }}>
              {Object.entries(REASON_MAP).map(([key, value]) => (
                <Select.Option key={key} value={key}>
                  {value}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="强度"
            name="intensity"
            rules={[{ required: true, message: '请选择强度' }]}
          >
            <Select style={{ width: '100%' }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Select.Option key={i} value={i.toString()}>
                  {i} 星 {i === 1 ? '轻微' : i === 5 ? '剧烈' : ''}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="安抚方式" name="soothing_method">
            <Input placeholder="如：喂奶、抱哄、换尿布等" />
          </Form.Item>

          <Form.Item label="是否保存音频" name="has_audio" valuePropName="checked">
            <Input.Checkbox />
          </Form.Item>

          <Form.Item label="备注" name="notes">
            <TextArea rows={3} placeholder="其他备注信息" />
          </Form.Item>

          <Form.Item className="flex justify-end gap-2">
            <Button onClick={() => setModalOpen(false)}>取消</Button>
            <Button type="primary" htmlType="submit">
              {editingRecord ? '更新' : '保存'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="哭声原因分析"
        open={analyzeModalOpen}
        onCancel={() => setAnalyzeModalOpen(false)}
        footer={null}
        width={600}
      >
        <Spin spinning={analyzeLoading}>
          {analyzeResult ? (
            <div>
              {analyzeResult.suggested_reasons && analyzeResult.suggested_reasons.length > 0 ? (
                <>
                  <h4 className="mb-3">可能的原因</h4>
                  <div className="space-y-3">
                    {analyzeResult.suggested_reasons.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-medium">
                            {REASON_MAP[item.reason] || item.reason}
                          </span>
                          <Tag color={REASON_TAG_COLOR[item.reason] || 'default'}>
                            置信度 {Math.round(item.confidence * 100)}%
                          </Tag>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <h5 className="font-medium mb-1">分析依据</h5>
                    <p className="text-sm text-gray-600">{analyzeResult.analysis_basis}</p>
                  </div>
                  <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
                    <p className="text-sm text-gray-600">{analyzeResult.note}</p>
                  </div>
                </>
              ) : (
                <p className="text-center text-gray-500 py-8">暂无分析结果</p>
              )}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">加载中...</p>
          )}
        </Spin>
      </Modal>
    </div>
  );
};

export default CryRecords;

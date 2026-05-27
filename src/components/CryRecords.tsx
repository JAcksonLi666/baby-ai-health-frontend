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
import { useTranslation } from 'react-i18next';
import { cryService } from '../services';
import { REASON_MAP, REASON_TAG_COLOR } from '../constants/cryConstants';

const { TextArea } = Input;
const { Text } = Typography;

interface CryRecord {
  id: string;
  start_time: string;
  end_time?: string;
  reason?: string;
  intensity?: string;
  soothe_method?: string;
  notes?: string;
}

const CryRecords = () => {
  const { t } = useTranslation();
  const [records, setRecords] = useState<CryRecord[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingRecord, setEditingRecord] = useState<CryRecord | null>(null);
  const [form] = Form.useForm();
  const [dateRange, setDateRange] = useState<any[]>([]);
  const [analyzeModalOpen, setAnalyzeModalOpen] = useState<boolean>(false);
  const [analyzeLoading, setAnalyzeLoading] = useState<boolean>(false);
  const [analyzeResult, setAnalyzeResult] = useState<any>(null);
  const [ongoingCry, setOngoingCry] = useState<any>(null);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const res = await cryService.listRecords();
      if (res.success) {
        setRecords(res.records || []);
        setTotal(res.total || (res.records || []).length);
      } else {
        message.error(res.message || t('cryRecords.fetchError'));
      }
    } catch (error) {
      message.error(t('cryRecords.fetchFailed'));
    } finally {
      setLoading(false);
    }
  }, [t]);

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

  const handleEdit = (record: CryRecord) => {
    setEditingRecord(record);
    form.setFieldsValue({
      start_time: record.start_time ? dayjs(record.start_time) : null,
      end_time: record.end_time ? dayjs(record.end_time) : null,
      reason: record.reason,
      intensity: record.intensity?.toString(),
      soothing_method: record.soothe_method,
      notes: record.notes,
      has_audio: (record as any).has_audio,
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await cryService.deleteRecord(id);
      if (res.success) {
        message.success(t('cryRecords.deleteSuccess'));
        fetchRecords();
      } else {
        message.error(res.message || t('cryRecords.deleteFailed'));
      }
    } catch (err) {
      message.error(t('cryRecords.deleteFailed'));
    }
  };

  const handleSubmit = async (values: any) => {
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
        message.success(t('cryRecords.updateSuccess'));
      } else {
        await cryService.createRecord(payload);
        message.success(t('cryRecords.createSuccess'));
      }
      setModalOpen(false);
      fetchRecords();
    } catch (error) {
      message.error(editingRecord ? t('cryRecords.updateFailed') : t('cryRecords.createFailed'));
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
        message.error(res.message || t('cryRecords.analyzeError'));
      }
    } catch (error) {
      message.error(t('cryRecords.analyzeFailed'));
    } finally {
      setAnalyzeLoading(false);
    }
  };

  const getDuration = (start: string, end: string) => {
    if (!start || !end) return '-';
    try {
      const startDate = dayjs(start);
      const endDate = dayjs(end);
      const minutes = endDate.diff(startDate, 'minute');
      if (minutes <= 0) return `0${t('sleepRecords.minutesUnit')}`;
      if (minutes < 60) return `${minutes}${t('sleepRecords.minutesUnit')}`;
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0 ? `${hours}${t('sleepRecords.hoursUnit')}${remainingMinutes}${t('sleepRecords.minutesUnit')}` : `${hours}${t('sleepRecords.hoursUnit')}`;
    } catch {
      return '-';
    }
  };

  const columns = [
    {
      title: t('cryRecords.startTime'),
      dataIndex: 'start_time',
      key: 'start_time',
      width: 150,
    },
    {
      title: t('cryRecords.endTime'),
      dataIndex: 'end_time',
      key: 'end_time',
      width: 150,
      render: (text: string) => text || '-',
    },
    {
      title: t('cryRecords.duration'),
      dataIndex: 'duration',
      key: 'duration',
      width: 100,
      render: (_: any, record: CryRecord) => getDuration(record.start_time, record.end_time || ''),
    },
    {
      title: t('cryRecords.reason'),
      dataIndex: 'reason',
      key: 'reason',
      width: 100,
      render: (reason: string) => (
        <Tag color={REASON_TAG_COLOR[reason] || 'default'}>
          {REASON_MAP[reason] || reason}
        </Tag>
      ),
    },
    {
      title: t('cryRecords.intensity'),
      dataIndex: 'intensity',
      key: 'intensity',
      width: 80,
      render: (intensity: number) => (
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
      title: t('cryRecords.soothingMethod'),
      dataIndex: 'soothing_method',
      key: 'soothing_method',
      width: 100,
      render: (text: string) => text || '-',
    },
    {
      title: t('cryRecords.audio'),
      dataIndex: 'has_audio',
      key: 'has_audio',
      width: 60,
      render: (has_audio: boolean) => (has_audio ? t('cryRecords.yes') : t('cryRecords.no')),
    },
    {
      title: t('cryRecords.notes'),
      dataIndex: 'notes',
      key: 'notes',
      width: 120,
      render: (text: string) => text || '-',
    },
    {
      title: t('cryRecords.edit'),
      key: 'action',
      width: 120,
      render: (_: any, record: CryRecord) => (
        <div className="flex gap-sm">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            {t('cryRecords.edit')}
          </Button>
          <Popconfirm
            title={t('cryRecords.deleteConfirm')}
            onConfirm={() => handleDelete(record.id)}
          >
            <Button type="text" danger icon={<DeleteOutlined />}>
              {t('cryRecords.delete')}
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
          message={t('cryRecords.ongoing')}
          description={`${t('cryRecords.ongoingStart')}：${ongoingCry.start_time}`}
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <Card
        title={t('cryRecords.title')}
        extra={
          <div className="flex gap-sm">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAdd}
            >
              {t('cryRecords.addRecord')}
            </Button>
            <Button
              icon={<ExclamationCircleOutlined />}
              onClick={handleAnalyze}
            >
              {t('cryRecords.analyze')}
            </Button>
          </div>
        }
      >
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={records}
            rowKey="id"
            scroll={{ x: 600 }}
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
        title={editingRecord ? t('cryRecords.editRecord') : t('cryRecords.addRecord')}
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
            label={t('cryRecords.startTime')}
            name="start_time"
            rules={[{ required: true, message: t('cryRecords.selectStartTime') }]}
          >
            <DatePicker
              showTime
              format="YYYY-MM-DD HH:mm"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item label={t('cryRecords.endTime')} name="end_time">
            <DatePicker
              showTime
              format="YYYY-MM-DD HH:mm"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            label={t('cryRecords.reason')}
            name="reason"
            rules={[{ required: true, message: t('cryRecords.selectReason') }]}
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
            label={t('cryRecords.intensity')}
            name="intensity"
            rules={[{ required: true, message: t('cryRecords.selectIntensity') }]}
          >
            <Select style={{ width: '100%' }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Select.Option key={i} value={i.toString()}>
                  {i} {t('cryRecords.star')} {i === 1 ? t('cryRecords.mild') : i === 5 ? t('cryRecords.severe') : ''}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label={t('cryRecords.soothingMethod')} name="soothing_method">
            <Input placeholder={t('cryRecords.soothingPlaceholder')} />
          </Form.Item>

          <Form.Item label={t('cryRecords.saveAudio')} name="has_audio" valuePropName="checked">
            <Input.Checkbox />
          </Form.Item>

          <Form.Item label={t('cryRecords.notes')} name="notes">
            <TextArea rows={3} placeholder={t('cryRecords.notesPlaceholder')} />
          </Form.Item>

          <Form.Item className="flex justify-end gap-sm">
            <Button onClick={() => setModalOpen(false)}>{t('cryRecords.cancel')}</Button>
            <Button type="primary" htmlType="submit">
              {editingRecord ? t('cryRecords.update') : t('cryRecords.save')}
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={t('cryRecords.analysisTitle')}
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
                  <h4 className="mb-3">{t('cryRecords.possibleReasons')}</h4>
                  <div className="space-y-3">
                    {analyzeResult.suggested_reasons.map((item: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-light rounded-lg"
                      >
                        <div className="flex items-center gap-md">
                          <span className="text-lg font-medium">
                            {REASON_MAP[item.reason] || item.reason}
                          </span>
                          <Tag color={REASON_TAG_COLOR[item.reason] || 'default'}>
                            {t('cryRecords.confidence')} {Math.round(item.confidence * 100)}%
                          </Tag>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-3 bg-info-light rounded-lg">
                    <h5 className="font-medium mb-1">{t('cryRecords.analysisBasis')}</h5>
                    <p className="text-sm text-secondary">{analyzeResult.analysis_basis}</p>
                  </div>
                  <div className="mt-3 p-3 bg-warning-light rounded-lg">
                    <p className="text-sm text-secondary">{analyzeResult.note}</p>
                  </div>
                </>
              ) : (
                <p className="text-center text-muted py-8">{t('cryRecords.emptyText')}</p>
              )}
            </div>
          ) : (
            <p className="text-center text-muted py-8">{t('cryRecords.loading')}</p>
          )}
        </Spin>
      </Modal>
    </div>
  );
};

export default CryRecords;

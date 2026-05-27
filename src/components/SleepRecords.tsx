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
  Space,
  Switch,
  Row,
  Col,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { sleepService } from '../services';
import './SleepRecords.css';

interface SleepRecord {
  id: string;
  start_time: string;
  end_time?: string;
  sleep_type: string;
  is_ongoing: boolean;
  notes?: string;
}

const SleepRecords = () => {
  const { t } = useTranslation();
  const [records, setRecords] = useState<SleepRecord[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingRecord, setEditingRecord] = useState<SleepRecord | null>(null);
  const [form] = Form.useForm();
  const [ongoingSleep, setOngoingSleep] = useState<SleepRecord | null>(null);
  const [pagination, setPagination] = useState<{ current: number; pageSize: number }>({ current: 1, pageSize: 10 });

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const res = await sleepService.listRecords();
      if (res.success) {
        setRecords(res.records || []);
        setTotal(res.total || (res.records || []).length);
      } else {
        message.error(res.message || t('sleepRecords.fetchError'));
      }
    } catch (error) {
      message.error(t('sleepRecords.fetchFailed'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  const fetchOngoingSleep = useCallback(async () => {
    try {
      const res = await sleepService.getOngoing();
      if (res.success && res.record) {
        setOngoingSleep(res.record);
      } else {
        setOngoingSleep(null);
      }
    } catch (error) {
      setOngoingSleep(null);
    }
  }, []);

  useEffect(() => {
    fetchRecords();
    fetchOngoingSleep();
  }, [fetchRecords, fetchOngoingSleep]);

  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    setModalOpen(true);
  };

  const handleEdit = (record: SleepRecord) => {
    setEditingRecord(record);
    form.setFieldsValue({
      start_time: record.start_time ? dayjs(record.start_time) : null,
      end_time: record.end_time ? dayjs(record.end_time) : null,
      sleep_type: record.sleep_type,
      is_ongoing: record.is_ongoing,
      notes: record.notes,
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await sleepService.deleteRecord(id);
      if (res.success) {
        message.success(t('sleepRecords.deleteSuccess'));
        fetchRecords();
      } else {
        message.error(res.message || t('sleepRecords.deleteFailed'));
      }
    } catch (err) {
      message.error(t('sleepRecords.deleteFailed'));
    }
  };

  const handleSubmit = async (values: any) => {
    const payload = {
      start_time: values.start_time?.format('YYYY-MM-DD HH:mm'),
      end_time: values.end_time?.format('YYYY-MM-DD HH:mm'),
      sleep_type: values.sleep_type,
      is_ongoing: values.is_ongoing,
      notes: values.notes,
    };

    try {
      if (editingRecord) {
        await sleepService.updateRecord(editingRecord.id, payload);
        message.success(t('sleepRecords.updateSuccess'));
      } else {
        await sleepService.createRecord(payload);
        message.success(t('sleepRecords.createSuccess'));
      }
      setModalOpen(false);
      fetchRecords();
      fetchOngoingSleep();
    } catch (error) {
      message.error(editingRecord ? t('sleepRecords.updateFailed') : t('sleepRecords.createFailed'));
    }
  };

  const handleOngoingToggle = async (record: SleepRecord) => {
    try {
      const now = dayjs().format('YYYY-MM-DD HH:mm');
      const payload = record.is_ongoing
        ? { is_ongoing: false, end_time: now }
        : { is_ongoing: true, end_time: null };
      await sleepService.updateRecord(record.id, payload);
      message.success(record.is_ongoing ? t('sleepRecords.sleepEnded') : t('sleepRecords.sleepStarted'));
      fetchRecords();
      fetchOngoingSleep();
    } catch (error) {
      message.error(t('sleepRecords.operationFailed'));
    }
  };

  const getDuration = (start: string, end?: string) => {
    if (!start) return '-';
    if (!end) return t('sleepRecords.ongoingDuration');
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
      title: t('sleepRecords.startTime'),
      dataIndex: 'start_time',
      key: 'start_time',
      width: 150,
    },
    {
      title: t('sleepRecords.endTime'),
      dataIndex: 'end_time',
      key: 'end_time',
      width: 150,
      render: (text: string) => text || '-',
    },
    {
      title: t('sleepRecords.duration'),
      dataIndex: 'duration',
      key: 'duration',
      width: 120,
      render: (_: any, record: SleepRecord) => getDuration(record.start_time, record.end_time),
    },
    {
      title: t('sleepRecords.sleepType'),
      dataIndex: 'sleep_type',
      key: 'sleep_type',
      width: 100,
      render: (type: string) => (
        <Tag color={type === 'night' ? 'purple' : 'blue'}>
          {type === 'night' ? t('sleepRecords.night') : t('sleepRecords.nap')}
        </Tag>
      ),
    },
    {
      title: t('sleepRecords.status'),
      dataIndex: 'is_ongoing',
      key: 'is_ongoing',
      width: 100,
      render: (isOngoing: boolean) => (
        <Tag color={isOngoing ? 'green' : 'default'}>
          {isOngoing ? t('sleepRecords.ongoing') : t('sleepRecords.ended')}
        </Tag>
      ),
    },
    {
      title: t('sleepRecords.notes'),
      dataIndex: 'notes',
      key: 'notes',
      width: 150,
      render: (text: string) => text || '-',
    },
    {
      title: t('sleepRecords.edit'),
      key: 'action',
      width: 180,
      render: (_: any, record: SleepRecord) => (
        <Space>
          <Button
            type={record.is_ongoing ? 'primary' : 'default'}
            icon={record.is_ongoing ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
            onClick={() => handleOngoingToggle(record)}
            size="small"
          >
            {record.is_ongoing ? t('sleepRecords.endBtn') : t('sleepRecords.startBtn')}
          </Button>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            {t('sleepRecords.edit')}
          </Button>
          <Popconfirm
            title={t('sleepRecords.deleteConfirm')}
            onConfirm={() => handleDelete(record.id)}
          >
            <Button type="text" danger icon={<DeleteOutlined />}>
              {t('sleepRecords.delete')}
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleTableChange = (pag: any) => {
    setPagination({ current: pag.current, pageSize: pag.pageSize });
  };

  return (
    <div>
      <Card
        title={t('sleepRecords.title')}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            {t('sleepRecords.addRecord')}
          </Button>
        }
      >
        {ongoingSleep && (
          <div className="sleep-ongoing-banner">
            <div className="sleep-ongoing-content">
              <div>
                <p className="sleep-ongoing-title">{t('sleepRecords.babySleeping')}</p>
                <p className="sleep-ongoing-time">
                  {t('sleepRecords.startTime')}：{ongoingSleep.start_time}
                </p>
              </div>
              <Button
                type="primary"
                danger
                onClick={() => handleOngoingToggle(ongoingSleep)}
              >
                {t('sleepRecords.stopSleep')}
              </Button>
            </div>
          </div>
        )}

        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={records}
            rowKey="id"
            pagination={{
              total,
              pageSize: pagination.pageSize,
              current: pagination.current,
              showSizeChanger: true,
              showQuickJumper: true,
            }}
            variant="bordered"
            onChange={handleTableChange}
            scroll={{ x: 600 }}
            rowClassName={(record: SleepRecord) => (record.is_ongoing ? 'sleep-row-ongoing' : '')}
          />
        </Spin>
      </Card>

      <Modal
        title={editingRecord ? t('sleepRecords.editRecord') : t('sleepRecords.addRecord')}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t('sleepRecords.startTime')}
                name="start_time"
                rules={[{ required: true, message: t('sleepRecords.selectStartTime') }]}
              >
                <DatePicker
                  showTime
                  format="YYYY-MM-DD HH:mm"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label={t('sleepRecords.endTime')} name="end_time">
                <DatePicker
                  showTime
                  format="YYYY-MM-DD HH:mm"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t('sleepRecords.sleepType')}
                name="sleep_type"
                rules={[{ required: true, message: t('sleepRecords.selectType') }]}
              >
                <Select style={{ width: '100%' }}>
                  <Select.Option value="night">{t('sleepRecords.night')}</Select.Option>
                  <Select.Option value="nap">{t('sleepRecords.nap')}</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label={t('sleepRecords.isOngoing')} name="is_ongoing" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label={t('sleepRecords.notes')} name="notes">
            <Input.TextArea rows={3} placeholder={t('sleepRecords.notesPlaceholder')} />
          </Form.Item>

          <Form.Item className="sleep-form-actions">
            <Button onClick={() => setModalOpen(false)}>{t('sleepRecords.cancel')}</Button>
            <Button type="primary" htmlType="submit">
              {editingRecord ? t('sleepRecords.update') : t('sleepRecords.save')}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SleepRecords;

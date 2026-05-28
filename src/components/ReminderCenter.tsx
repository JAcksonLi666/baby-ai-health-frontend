import React, { useState, useEffect, useCallback } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  Tag,
  Popconfirm,
  message,
  Spin,
  Card,
  Space,
  Row,
  Col,
  Statistic,
  Badge,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  BellOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  MedicineBoxOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { reminderService } from '../services';

interface ReminderRecord {
  id: string;
  title: string;
  reminder_type: string;
  reminder_date: string;
  reminder_time?: string;
  repeat_type: string;
  status: string;
  notes?: string;
}

const ReminderCenter = () => {
  const { t } = useTranslation();

  const REMINDER_TYPE_MAP: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    vaccine: { label: t('reminderCenter.vaccine'), color: 'blue', icon: <MedicineBoxOutlined /> },
    checkup: { label: t('reminderCenter.checkup'), color: 'green', icon: <CheckCircleOutlined /> },
    feeding: { label: t('reminderCenter.feeding'), color: 'orange', icon: <ClockCircleOutlined /> },
    medicine: { label: t('reminderCenter.medicine'), color: 'red', icon: <ExclamationCircleOutlined /> },
    other: { label: t('reminderCenter.other'), color: 'default', icon: <BellOutlined /> },
  };

  const STATUS_MAP: Record<string, { label: string; color: string }> = {
    pending: { label: t('reminderCenter.pending'), color: 'warning' },
    completed: { label: t('reminderCenter.completed'), color: 'success' },
    overdue: { label: t('reminderCenter.overdue'), color: 'error' },
    cancelled: { label: t('reminderCenter.cancelled'), color: 'default' },
  };

  const REPEAT_MAP: Record<string, string> = {
    none: t('reminderCenter.none'),
    daily: t('reminderCenter.daily'),
    weekly: t('reminderCenter.weekly'),
    monthly: t('reminderCenter.monthly'),
  };

  const [records, setRecords] = useState<ReminderRecord[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingRecord, setEditingRecord] = useState<ReminderRecord | null>(null);
  const [form] = Form.useForm();

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const res = await reminderService.listRecords();
      if (res.success) {
        setRecords(res.records || []);
        setTotal(res.total || (res.records || []).length);
      } else {
        message.error(res.message || t('reminderCenter.fetchError'));
      }
    } catch (error) {
      message.error(t('reminderCenter.fetchFailed'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    form.setFieldValue('reminder_date', dayjs());
    form.setFieldValue('status', 'pending');
    setModalOpen(true);
  };

  const handleEdit = (record: ReminderRecord) => {
    setEditingRecord(record);
    form.setFieldsValue({
      title: record.title,
      reminder_type: record.reminder_type,
      reminder_date: record.reminder_date ? dayjs(record.reminder_date) : null,
      reminder_time: record.reminder_time,
      repeat_type: record.repeat_type,
      notes: record.notes,
      status: record.status,
    });
    setModalOpen(true);
  };

  const handleComplete = async (record: ReminderRecord) => {
    try {
      const res = await reminderService.updateRecord(record.id, { status: 'completed' });
      if (res.success || res.id) {
        message.success(t('reminderCenter.markCompleted'));
        fetchRecords();
      }
    } catch (err) {
      message.error(t('reminderCenter.operationFailed'));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await reminderService.deleteRecord(id);
      if (res.success) {
        message.success(t('reminderCenter.deleteSuccess'));
        fetchRecords();
      }
    } catch (err) {
      message.error(t('reminderCenter.deleteFailed'));
    }
  };

  const handleSubmit = async (values: any) => {
    const payload = {
      title: values.title,
      reminder_type: values.reminder_type,
      reminder_date: values.reminder_date?.format('YYYY-MM-DD'),
      reminder_time: values.reminder_time,
      repeat_type: values.repeat_type,
      notes: values.notes,
      status: values.status || 'pending',
    };

    try {
      if (editingRecord) {
        await reminderService.updateRecord(editingRecord.id, payload);
        message.success(t('reminderCenter.updateSuccess'));
      } else {
        await reminderService.createRecord(payload);
        message.success(t('reminderCenter.createSuccess'));
      }
      setModalOpen(false);
      fetchRecords();
    } catch (error) {
      message.error(editingRecord ? t('reminderCenter.updateFailed') : t('reminderCenter.createFailed'));
    }
  };

  const columns = [
    {
      title: t('reminderCenter.content'),
      dataIndex: 'title',
      key: 'title',
      width: 200,
    },
    {
      title: t('reminderCenter.reminderType'),
      dataIndex: 'reminder_type',
      key: 'reminder_type',
      width: 100,
      render: (type: string) => {
        const config = REMINDER_TYPE_MAP[type] || { label: type, color: 'default' };
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: t('reminderCenter.reminderDate'),
      dataIndex: 'reminder_date',
      key: 'reminder_date',
      width: 120,
    },
    {
      title: t('reminderCenter.reminderTime'),
      dataIndex: 'reminder_time',
      key: 'reminder_time',
      width: 100,
      render: (text: string) => text || '-',
    },
    {
      title: t('reminderCenter.repeatType'),
      dataIndex: 'repeat_type',
      key: 'repeat_type',
      width: 80,
      render: (text: string) => {
        return REPEAT_MAP[text] || text || '-';
      },
    },
    {
      title: t('reminderCenter.status'),
      dataIndex: 'status',
      key: 'status',
      width: 90,
      render: (status: string) => {
        const config = STATUS_MAP[status] || { label: status, color: 'default' };
        return <Badge status={config.color as any} text={config.label} />;
      },
    },
    {
      title: t('reminderCenter.edit'),
      key: 'action',
      width: 200,
      render: (_: any, record: ReminderRecord) => (
        <Space>
          {record.status === 'pending' && (
            <Button
              type="text"
              icon={<CheckCircleOutlined />}
              onClick={() => handleComplete(record)}
              style={{ color: '#52c41a' }}
            >
              {t('reminderCenter.complete')}
            </Button>
          )}
          <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            {t('reminderCenter.edit')}
          </Button>
          <Popconfirm title={t('reminderCenter.deleteConfirm')} onConfirm={() => handleDelete(record.id)}>
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const pendingCount = records.filter(r => r.status === 'pending').length;
  const overdueCount = records.filter(r => r.status === 'overdue').length;
  const completedCount = records.filter(r => r.status === 'completed').length;

  return (
    <div>
      <Card
        title={
          <Space>
            <BellOutlined />
            <span>{t('reminderCenter.title')}</span>
          </Space>
        }
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            {t('reminderCenter.addReminder')}
          </Button>
        }
      >
        <Row gutter={16} className="mb-4">
          <Col xs={24} sm={12} md={8}>
            <Statistic
              title={t('reminderCenter.pending')}
              value={pendingCount}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Statistic
              title={t('reminderCenter.overdue')}
              value={overdueCount}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Statistic
              title={t('reminderCenter.completed')}
              value={completedCount}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Col>
        </Row>

        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={records}
            rowKey="id"
            scroll={{ x: 700 }}
            pagination={{ pageSize: 10, showSizeChanger: true }}
          />
        </Spin>
      </Card>

      <Modal
        title={editingRecord ? t('reminderCenter.editReminder') : t('reminderCenter.addReminder')}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={500}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label={t('reminderCenter.content')}
            name="title"
            rules={[{ required: true, message: t('reminderCenter.selectContent') }]}
          >
            <Input placeholder={t('reminderCenter.contentPlaceholder')} />
          </Form.Item>

          <Form.Item
            label={t('reminderCenter.reminderType')}
            name="reminder_type"
            rules={[{ required: true, message: t('reminderCenter.selectType') }]}
          >
            <Select>
              <Select.Option value="vaccine">{t('reminderCenter.vaccine')}</Select.Option>
              <Select.Option value="checkup">{t('reminderCenter.checkup')}</Select.Option>
              <Select.Option value="feeding">{t('reminderCenter.feeding')}</Select.Option>
              <Select.Option value="medicine">{t('reminderCenter.medicine')}</Select.Option>
              <Select.Option value="other">{t('reminderCenter.other')}</Select.Option>
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t('reminderCenter.reminderDate')}
                name="reminder_date"
                rules={[{ required: true, message: t('reminderCenter.selectDate') }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label={t('reminderCenter.reminderTime')} name="reminder_time">
                <Input placeholder={t('reminderCenter.timePlaceholder')} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label={t('reminderCenter.repeatType')} name="repeat_type">
            <Select>
              <Select.Option value="none">{t('reminderCenter.none')}</Select.Option>
              <Select.Option value="daily">{t('reminderCenter.daily')}</Select.Option>
              <Select.Option value="weekly">{t('reminderCenter.weekly')}</Select.Option>
              <Select.Option value="monthly">{t('reminderCenter.monthly')}</Select.Option>
            </Select>
          </Form.Item>

          {editingRecord && (
            <Form.Item label={t('reminderCenter.status')} name="status">
              <Select>
                <Select.Option value="pending">{t('reminderCenter.pending')}</Select.Option>
                <Select.Option value="completed">{t('reminderCenter.completed')}</Select.Option>
                <Select.Option value="overdue">{t('reminderCenter.overdue')}</Select.Option>
                <Select.Option value="cancelled">{t('reminderCenter.cancelled')}</Select.Option>
              </Select>
            </Form.Item>
          )}

          <Form.Item label={t('reminderCenter.notes')} name="notes">
            <Input.TextArea rows={3} placeholder={t('reminderCenter.notesPlaceholder')} />
          </Form.Item>

          <Form.Item className="flex justify-end gap-sm">
            <Button onClick={() => setModalOpen(false)}>{t('reminderCenter.cancel')}</Button>
            <Button type="primary" htmlType="submit">
              {editingRecord ? t('reminderCenter.update') : t('reminderCenter.save')}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ReminderCenter;

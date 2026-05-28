import { useState, useEffect, useCallback } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  DatePicker,
  Tag,
  Popconfirm,
  message,
  Spin,
  Card,
  Space,
  Row,
  Col,
  Statistic,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { growthService } from '../services';

interface GrowthRecord {
  id: string;
  record_date: string;
  weight_kg?: number;
  height_cm?: number;
  head_circumference_cm?: number;
  temperature_c?: number;
  notes?: string;
}

const GrowthRecords = () => {
  const { t } = useTranslation();
  const [records, setRecords] = useState<GrowthRecord[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingRecord, setEditingRecord] = useState<GrowthRecord | null>(null);
  const [form] = Form.useForm();

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const res = await growthService.listRecords();
      if (res.success) {
        setRecords(res.records || []);
        setTotal(res.total || (res.records || []).length);
      } else {
        message.error(res.message || t('growthRecords.fetchError'));
      }
    } catch (error) {
      message.error(t('growthRecords.fetchFailed'));
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
    form.setFieldValue('record_date', dayjs());
    setModalOpen(true);
  };

  const handleEdit = (record: GrowthRecord) => {
    setEditingRecord(record);
    form.setFieldsValue({
      record_date: record.record_date ? dayjs(record.record_date) : null,
      weight_kg: record.weight_kg,
      height_cm: record.height_cm,
      head_circumference_cm: record.head_circumference_cm,
      temperature_c: record.temperature_c,
      notes: record.notes,
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await growthService.deleteRecord(id);
      if (res.success) {
        message.success(t('growthRecords.deleteSuccess'));
        fetchRecords();
      } else {
        message.error(res.message || t('growthRecords.deleteFailed'));
      }
    } catch (err) {
      message.error(t('growthRecords.deleteFailed'));
    }
  };

  const handleSubmit = async (values: any) => {
    const payload = {
      record_date: values.record_date?.format('YYYY-MM-DD'),
      weight_kg: values.weight_kg,
      height_cm: values.height_cm,
      head_circumference_cm: values.head_circumference_cm,
      temperature_c: values.temperature_c,
      notes: values.notes,
    };

    try {
      if (editingRecord) {
        await growthService.updateRecord(editingRecord.id, payload);
        message.success(t('growthRecords.updateSuccess'));
      } else {
        await growthService.createRecord(payload);
        message.success(t('growthRecords.createSuccess'));
      }
      setModalOpen(false);
      fetchRecords();
    } catch (error) {
      message.error(editingRecord ? t('growthRecords.updateFailed') : t('growthRecords.createFailed'));
    }
  };

  const columns = [
    {
      title: t('growthRecords.date'),
      dataIndex: 'record_date',
      key: 'record_date',
      width: 120,
    },
    {
      title: t('growthRecords.weight'),
      dataIndex: 'weight_kg',
      key: 'weight_kg',
      width: 100,
      render: (value: number) => value ? `${value} kg` : '-',
    },
    {
      title: t('growthRecords.height'),
      dataIndex: 'height_cm',
      key: 'height_cm',
      width: 100,
      render: (value: number) => value ? `${value} cm` : '-',
    },
    {
      title: t('growthRecords.headCircumference'),
      dataIndex: 'head_circumference_cm',
      key: 'head_circumference_cm',
      width: 100,
      render: (value: number) => value ? `${value} cm` : '-',
    },
    {
      title: t('growthRecords.temperature'),
      dataIndex: 'temperature_c',
      key: 'temperature_c',
      width: 100,
      render: (value: number) => {
        if (!value) return '-';
        const isHigh = value >= 37.5;
        return (
          <Tag color={isHigh ? 'red' : 'green'}>
            {value}°C
          </Tag>
        );
      },
    },
    {
      title: t('growthRecords.notes'),
      dataIndex: 'notes',
      key: 'notes',
      width: 150,
      render: (text: string) => text || '-',
    },
    {
      title: t('growthRecords.edit'),
      key: 'action',
      width: 180,
      render: (_: any, record: GrowthRecord) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            {t('growthRecords.edit')}
          </Button>
          <Popconfirm
            title={t('growthRecords.deleteConfirm')}
            onConfirm={() => handleDelete(record.id)}
          >
            <Button type="text" danger icon={<DeleteOutlined />}>
              {t('growthRecords.delete')}
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // 获取最新记录
  const latestRecord = records.length > 0 ? records[0] : null;

  return (
    <div>
      <Card
        title={t('growthRecords.title')}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            {t('growthRecords.addRecord')}
          </Button>
        }
      >
        {latestRecord && (
          <Row gutter={16} className="mb-4">
            <Col xs={12} sm={12} md={6}>
              <Statistic
                title={t('growthRecords.latestWeight')}
                value={latestRecord.weight_kg ? `${latestRecord.weight_kg} kg` : '-'}
                prefix={<CheckCircleOutlined />}
              />
            </Col>
            <Col xs={12} sm={12} md={6}>
              <Statistic
                title={t('growthRecords.latestHeight')}
                value={latestRecord.height_cm ? `${latestRecord.height_cm} cm` : '-'}
                prefix={<CheckCircleOutlined />}
              />
            </Col>
            <Col xs={12} sm={12} md={6}>
              <Statistic
                title={t('growthRecords.latestHead')}
                value={latestRecord.head_circumference_cm ? `${latestRecord.head_circumference_cm} cm` : '-'}
                prefix={<CheckCircleOutlined />}
              />
            </Col>
            <Col xs={12} sm={12} md={6}>
              <Statistic
                title={t('growthRecords.recordDate')}
                value={latestRecord.record_date || '-'}
                prefix={<CalendarOutlined />}
              />
            </Col>
          </Row>
        )}

        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={records}
            rowKey="id"
            scroll={{ x: 700 }}
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
        title={editingRecord ? t('growthRecords.editRecord') : t('growthRecords.addRecord')}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            label={t('growthRecords.recordDate')}
            name="record_date"
            rules={[{ required: true, message: t('growthRecords.selectDate') }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item label={`${t('growthRecords.weight')}(kg)`} name="weight_kg">
                <Input type="number" step="0.1" min={0} max={150} placeholder={t('growthRecords.weightPlaceholder')} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label={`${t('growthRecords.height')}(cm)`} name="height_cm">
                <Input type="number" step="0.1" min={0} max={250} placeholder={t('growthRecords.heightPlaceholder')} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item label={`${t('growthRecords.headCircumference')}(cm)`} name="head_circumference_cm">
                <Input type="number" step="0.1" min={0} max={70} placeholder={t('growthRecords.headPlaceholder')} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label={`${t('growthRecords.temperature')}(°C)`} name="temperature_c">
                <Input type="number" step="0.1" min={35} max={42} placeholder={t('growthRecords.tempPlaceholder')} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label={t('growthRecords.notes')} name="notes">
            <Input.TextArea rows={3} placeholder={t('growthRecords.notesPlaceholder')} />
          </Form.Item>

          <Form.Item className="flex justify-end gap-sm">
            <Button onClick={() => setModalOpen(false)}>{t('growthRecords.cancel')}</Button>
            <Button type="primary" htmlType="submit">
              {editingRecord ? t('growthRecords.update') : t('growthRecords.save')}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default GrowthRecords;

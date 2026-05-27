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
  Statistic,
  Row,
  Col,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { feedingService } from '../services';

const FeedingRecords = () => {
  const { t } = useTranslation();

  const FEEDING_TYPE_MAP: Record<string, { label: string; color: string }> = {
    breast: { label: t('feedingRecords.breast'), color: 'blue' },
    formula: { label: t('feedingRecords.formula'), color: 'cyan' },
    solid: { label: t('feedingRecords.solid'), color: 'orange' },
    water: { label: t('feedingRecords.water'), color: 'green' },
  };

  interface FeedingRecord {
    id: string;
    time: string;
    feeding_type: string;
    duration_minutes?: number;
    amount_ml?: number;
    breast_side?: string;
    solid_food?: string;
    water_amount_ml?: number;
    notes?: string;
  }

  const [records, setRecords] = useState<FeedingRecord[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingRecord, setEditingRecord] = useState<FeedingRecord | null>(null);
  const [form] = Form.useForm();

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const res = await feedingService.listRecords();
      if (res.success) {
        setRecords(res.records || []);
        setTotal(res.total || (res.records || []).length);
      } else {
        message.error(res.message || t('feedingRecords.fetchError'));
      }
    } catch (error) {
      message.error(t('feedingRecords.fetchFailed'));
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
    setModalOpen(true);
  };

  const handleEdit = (record: FeedingRecord) => {
    setEditingRecord(record);
    form.setFieldsValue({
      time: record.time ? dayjs(record.time) : null,
      feeding_type: record.feeding_type,
      duration_minutes: record.duration_minutes,
      amount_ml: record.amount_ml,
      breast_side: record.breast_side,
      solid_food: record.solid_food,
      water_amount_ml: record.water_amount_ml,
      notes: record.notes,
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await feedingService.deleteRecord(id);
      if (res.success) {
        message.success(t('feedingRecords.deleteSuccess'));
        fetchRecords();
      } else {
        message.error(res.message || t('feedingRecords.deleteFailed'));
      }
    } catch (err) {
      message.error(t('feedingRecords.deleteFailed'));
    }
  };

  const handleSubmit = async (values: any) => {
    const payload = {
      time: values.time?.format('YYYY-MM-DD HH:mm'),
      feeding_type: values.feeding_type,
      duration_minutes: values.duration_minutes,
      amount_ml: values.amount_ml,
      breast_side: values.breast_side,
      solid_food: values.solid_food,
      water_amount_ml: values.water_amount_ml,
      notes: values.notes,
    };

    try {
      if (editingRecord) {
        await feedingService.updateRecord(editingRecord.id, payload);
        message.success(t('feedingRecords.updateSuccess'));
      } else {
        await feedingService.createRecord(payload);
        message.success(t('feedingRecords.createSuccess'));
      }
      setModalOpen(false);
      fetchRecords();
    } catch (error) {
      message.error(editingRecord ? t('feedingRecords.updateFailed') : t('feedingRecords.createFailed'));
    }
  };

  const columns = [
    {
      title: t('feedingRecords.time'),
      dataIndex: 'time',
      key: 'time',
      width: 150,
    },
    {
      title: t('feedingRecords.feedingType'),
      dataIndex: 'feeding_type',
      key: 'feeding_type',
      width: 100,
      render: (type: string) => {
        const config = FEEDING_TYPE_MAP[type] || { label: type, color: 'default' };
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: t('feedingRecords.duration'),
      key: 'details',
      width: 200,
      render: (_: any, record: FeedingRecord) => {
        const details: string[] = [];
        if (record.duration_minutes) {
          details.push(`${record.duration_minutes}${t('sleepRecords.minutesUnit')}`);
        }
        if (record.amount_ml) {
          details.push(`${record.amount_ml}ml`);
        }
        if (record.breast_side) {
          details.push(`${t('feedingRecords.sideLabel')}: ${record.breast_side === 'left' ? t('feedingRecords.left') : record.breast_side === 'right' ? t('feedingRecords.right') : t('feedingRecords.both')}`);
        }
        if (record.solid_food) {
          details.push(`${t('feedingRecords.solid')}: ${record.solid_food}`);
        }
        if (record.water_amount_ml) {
          details.push(`${t('feedingRecords.water')}: ${record.water_amount_ml}ml`);
        }
        return details.length > 0 ? details.join(', ') : '-';
      },
    },
    {
      title: t('feedingRecords.notes'),
      dataIndex: 'notes',
      key: 'notes',
      width: 150,
      render: (text: string) => text || '-',
    },
    {
      title: t('feedingRecords.edit'),
      key: 'action',
      width: 180,
      render: (_: any, record: FeedingRecord) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            {t('feedingRecords.edit')}
          </Button>
          <Popconfirm
            title={t('feedingRecords.deleteConfirm')}
            onConfirm={() => handleDelete(record.id)}
          >
            <Button type="text" danger icon={<DeleteOutlined />}>
              {t('feedingRecords.delete')}
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // 统计
  const stats = {
    total: records.length,
    breast: records.filter(r => r.feeding_type === 'breast').length,
    formula: records.filter(r => r.feeding_type === 'formula').length,
    solid: records.filter(r => r.feeding_type === 'solid').length,
    water: records.filter(r => r.feeding_type === 'water').length,
  };

  return (
    <div>
      <Card
        title={t('feedingRecords.title')}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            {t('feedingRecords.addRecord')}
          </Button>
        }
      >
        <Row gutter={16} className="mb-4">
          <Col xs={12} sm={12} md={6}>
            <Statistic title={t('feedingRecords.totalRecords')} value={stats.total} prefix={<CalendarOutlined />} />
          </Col>
          <Col xs={12} sm={12} md={6}>
            <Statistic title={t('feedingRecords.breast')} value={stats.breast} valueStyle={{ color: '#1890ff' }} />
          </Col>
          <Col xs={12} sm={12} md={6}>
            <Statistic title={t('feedingRecords.formula')} value={stats.formula} valueStyle={{ color: '#13c2c2' }} />
          </Col>
          <Col xs={12} sm={12} md={6}>
            <Statistic title={t('feedingRecords.solid')} value={stats.solid} valueStyle={{ color: '#fa8c16' }} />
          </Col>
        </Row>

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
        title={editingRecord ? t('feedingRecords.editRecord') : t('feedingRecords.addRecord')}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={500}
        styles={{ body: { maxHeight: '70vh', overflowY: 'auto' } }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            label={t('feedingRecords.time')}
            name="time"
            rules={[{ required: true, message: t('feedingRecords.selectTime') }]}
          >
            <DatePicker
              showTime
              format="YYYY-MM-DD HH:mm"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            label={t('feedingRecords.feedingType')}
            name="feeding_type"
            rules={[{ required: true, message: t('feedingRecords.selectType') }]}
          >
            <Select style={{ width: '100%' }}>
              <Select.Option value="breast">{t('feedingRecords.breast')}</Select.Option>
              <Select.Option value="formula">{t('feedingRecords.formula')}</Select.Option>
              <Select.Option value="solid">{t('feedingRecords.solid')}</Select.Option>
              <Select.Option value="water">{t('feedingRecords.water')}</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item noStyle shouldUpdate={(prev, curr) => prev.feeding_type !== curr.feeding_type}>
            {({ getFieldValue }) => {
              const type = getFieldValue('feeding_type');
              return (
                <>
                  {(type === 'breast') && (
                    <Form.Item label={t('feedingRecords.breastSide')} name="breast_side">
                      <Select style={{ width: '100%' }}>
                        <Select.Option value="left">{t('feedingRecords.left')}</Select.Option>
                        <Select.Option value="right">{t('feedingRecords.right')}</Select.Option>
                        <Select.Option value="both">{t('feedingRecords.both')}</Select.Option>
                      </Select>
                    </Form.Item>
                  )}

                  {(type === 'breast') && (
                    <Form.Item label={t('feedingRecords.durationLabel')} name="duration_minutes">
                      <Input type="number" min={0} placeholder={t('feedingRecords.durationPlaceholder')} />
                    </Form.Item>
                  )}

                  {(type === 'formula') && (
                    <Form.Item label={t('feedingRecords.amountLabel')} name="amount_ml">
                      <Input type="number" min={0} placeholder={t('feedingRecords.amountPlaceholder')} />
                    </Form.Item>
                  )}

                  {(type === 'solid') && (
                    <Form.Item label={t('feedingRecords.solidFood')} name="solid_food">
                      <Input placeholder={t('feedingRecords.solidPlaceholder')} />
                    </Form.Item>
                  )}

                  {(type === 'water') && (
                    <Form.Item label={t('feedingRecords.waterAmount')} name="water_amount_ml">
                      <Input type="number" min={0} placeholder={t('feedingRecords.waterPlaceholder')} />
                    </Form.Item>
                  )}
                </>
              );
            }}
          </Form.Item>

          <Form.Item label={t('feedingRecords.notes')} name="notes">
            <Input.TextArea rows={3} placeholder={t('feedingRecords.notesPlaceholder')} />
          </Form.Item>

          <Form.Item className="flex justify-end gap-sm">
            <Button onClick={() => setModalOpen(false)}>{t('feedingRecords.cancel')}</Button>
            <Button type="primary" htmlType="submit">
              {editingRecord ? t('feedingRecords.update') : t('feedingRecords.save')}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default FeedingRecords;

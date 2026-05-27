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
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CameraOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { diaperService } from '../services';

const DiaperRecords = () => {
  const { t } = useTranslation();

  const COLOR_MAP: Record<string, string> = {
    yellow: t('diaperRecords.colorYellow') || '黄色',
    green: t('diaperRecords.colorGreen') || '绿色',
    brown: t('diaperRecords.colorBrown') || '棕色',
    black: t('diaperRecords.colorBlack') || '黑色',
    red: t('diaperRecords.colorRed') || '红色',
    white: t('diaperRecords.colorWhite') || '白色',
  };

  const COLOR_TAG_COLOR: Record<string, string> = {
    yellow: 'gold',
    green: 'green',
    brown: 'brown',
    black: 'black',
    red: 'red',
    white: 'default',
  };

  interface DiaperRecord {
    id: string;
    time: string;
    type: string;
    pee: boolean;
    poop: boolean;
    color?: string;
    notes?: string;
  }

  const [records, setRecords] = useState<DiaperRecord[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingRecord, setEditingRecord] = useState<DiaperRecord | null>(null);
  const [form] = Form.useForm();
  const [dateRange, setDateRange] = useState<dayjs.Dayjs[]>([]);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const res = await diaperService.listRecords();
      if (res.success) {
        let filtered = res.records || [];
        if (dateRange && dateRange[0] && dateRange[1]) {
          filtered = filtered.filter((record: DiaperRecord) => {
            const recordDate = record.time?.split(' ')[0];
            return (
              recordDate >= dateRange[0].format('YYYY-MM-DD') &&
              recordDate <= dateRange[1].format('YYYY-MM-DD')
            );
          });
        }
        setRecords(filtered);
        setTotal(filtered.length);
      } else {
        message.error(res.message || t('diaperRecords.fetchError'));
      }
    } catch (error) {
      message.error(t('diaperRecords.fetchFailed'));
    } finally {
      setLoading(false);
    }
  }, [dateRange, t]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    setModalOpen(true);
  };

  const handleEdit = (record: DiaperRecord) => {
    setEditingRecord(record);
    form.setFieldsValue({
      time: record.time ? dayjs(record.time) : null,
      type: record.type,
      pee: record.pee,
      poop: record.poop,
      color: record.color,
      notes: record.notes,
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await diaperService.deleteRecord(id);
      if (res.success) {
        message.success(t('diaperRecords.deleteSuccess'));
        fetchRecords();
      } else {
        message.error(res.message || t('diaperRecords.deleteFailed'));
      }
    } catch (err) {
      message.error(t('diaperRecords.deleteFailed'));
    }
  };

  const handleSubmit = async (values: any) => {
    const payload = {
      time: values.time?.format('YYYY-MM-DD HH:mm'),
      type: values.type,
      pee: values.pee,
      poop: values.poop,
      color: values.color,
      notes: values.notes,
    };

    try {
      if (editingRecord) {
        await diaperService.updateRecord(editingRecord.id, payload);
        message.success(t('diaperRecords.updateSuccess'));
      } else {
        await diaperService.createRecord(payload);
        message.success(t('diaperRecords.createSuccess'));
      }
      setModalOpen(false);
      fetchRecords();
    } catch (error) {
      message.error(editingRecord ? t('diaperRecords.updateFailed') : t('diaperRecords.createFailed'));
    }
  };

  const columns = [
    {
      title: t('diaperRecords.time'),
      dataIndex: 'time',
      key: 'time',
      width: 150,
    },
    {
      title: t('diaperRecords.type'),
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: string) => (
        <Tag color={type === 'pee' ? 'blue' : type === 'poop' ? 'green' : 'purple'}>
          {type === 'pee' ? t('diaperRecords.pee') : type === 'poop' ? t('diaperRecords.poop') : t('diaperRecords.both')}
        </Tag>
      ),
    },
    {
      title: t('diaperRecords.pee'),
      dataIndex: 'pee',
      key: 'pee',
      width: 60,
      render: (pee: boolean) => (pee ? t('cryRecords.yes') : t('cryRecords.no')),
    },
    {
      title: t('diaperRecords.poop'),
      dataIndex: 'poop',
      key: 'poop',
      width: 60,
      render: (poop: boolean) => (poop ? t('cryRecords.yes') : t('cryRecords.no')),
    },
    {
      title: t('diaperRecords.color'),
      dataIndex: 'color',
      key: 'color',
      width: 80,
      render: (color: string) => (
        <Tag color={COLOR_TAG_COLOR[color] || 'default'}>
          {COLOR_MAP[color] || color}
        </Tag>
      ),
    },
    {
      title: t('diaperRecords.notes'),
      dataIndex: 'notes',
      key: 'notes',
      width: 150,
      render: (text: string) => text || '-',
    },
    {
      title: t('diaperRecords.edit'),
      key: 'action',
      width: 120,
      render: (_: any, record: DiaperRecord) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            {t('diaperRecords.edit')}
          </Button>
          <Popconfirm
            title={t('diaperRecords.deleteConfirm')}
            onConfirm={() => handleDelete(record.id)}
          >
            <Button type="text" danger icon={<DeleteOutlined />}>
              {t('diaperRecords.delete')}
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card
        title={t('diaperRecords.title')}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            {t('diaperRecords.addRecord')}
          </Button>
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
        title={editingRecord ? t('diaperRecords.editRecord') : t('diaperRecords.addRecord')}
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
            label={t('diaperRecords.time')}
            name="time"
            rules={[{ required: true, message: t('diaperRecords.selectTime') }]}
          >
            <DatePicker
              showTime
              format="YYYY-MM-DD HH:mm"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            label={t('diaperRecords.type')}
            name="type"
            rules={[{ required: true, message: t('diaperRecords.selectType') }]}
          >
            <Select style={{ width: '100%' }}>
              <Select.Option value="pee">{t('diaperRecords.pee')}</Select.Option>
              <Select.Option value="poop">{t('diaperRecords.poop')}</Select.Option>
              <Select.Option value="both">{t('diaperRecords.both')}</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label={t('diaperRecords.pee')} name="pee" valuePropName="checked">
            <Input.Checkbox />
          </Form.Item>

          <Form.Item label={t('diaperRecords.poop')} name="poop" valuePropName="checked">
            <Input.Checkbox />
          </Form.Item>

          <Form.Item label={t('diaperRecords.color')} name="color">
            <Select style={{ width: '100%' }}>
              {Object.entries(COLOR_MAP).map(([key, value]) => (
                <Select.Option key={key} value={key}>
                  {value}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label={t('diaperRecords.notes')} name="notes">
            <Input.TextArea rows={3} placeholder={t('diaperRecords.notesPlaceholder')} />
          </Form.Item>

          <Form.Item className="flex justify-end gap-sm">
            <Button onClick={() => setModalOpen(false)}>{t('diaperRecords.cancel')}</Button>
            <Button type="primary" htmlType="submit">
              {editingRecord ? t('diaperRecords.update') : t('diaperRecords.save')}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DiaperRecords;

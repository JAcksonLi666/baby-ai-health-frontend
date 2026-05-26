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
import { reminderService } from '../services';

const REMINDER_TYPE_MAP = {
  vaccine: { label: '疫苗接种', color: 'blue', icon: <MedicineBoxOutlined /> },
  checkup: { label: '体检', color: 'green', icon: <CheckCircleOutlined /> },
  feeding: { label: '喂养提醒', color: 'orange', icon: <ClockCircleOutlined /> },
  medicine: { label: '用药提醒', color: 'red', icon: <ExclamationCircleOutlined /> },
  other: { label: '其他', color: 'default', icon: <BellOutlined /> },
};

const STATUS_MAP = {
  pending: { label: '待处理', color: 'warning' },
  completed: { label: '已完成', color: 'success' },
  overdue: { label: '已过期', color: 'error' },
  cancelled: { label: '已取消', color: 'default' },
};

const ReminderCenter = () => {
  const [records, setRecords] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const res = await reminderService.listRecords();
      if (res.success) {
        setRecords(res.records || []);
        setTotal(res.total || (res.records || []).length);
      } else {
        message.error(res.message || '获取记录失败');
      }
    } catch (error) {
      message.error('获取提醒记录失败');
    } finally {
      setLoading(false);
    }
  }, []);

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

  const handleEdit = (record) => {
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

  const handleComplete = async (record) => {
    try {
      const res = await reminderService.updateRecord(record.id, { status: 'completed' });
      if (res.success || res.id) {
        message.success('已标记完成');
        fetchRecords();
      }
    } catch (err) {
      message.error('操作失败');
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await reminderService.deleteRecord(id);
      if (res.success) {
        message.success('删除成功');
        fetchRecords();
      }
    } catch (err) {
      message.error('删除失败');
    }
  };

  const handleSubmit = async (values) => {
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
        message.success('更新成功');
      } else {
        await reminderService.createRecord(payload);
        message.success('创建成功');
      }
      setModalOpen(false);
      fetchRecords();
    } catch (error) {
      message.error(editingRecord ? '更新失败' : '创建失败');
    }
  };

  const columns = [
    {
      title: '提醒内容',
      dataIndex: 'title',
      key: 'title',
      width: 200,
    },
    {
      title: '类型',
      dataIndex: 'reminder_type',
      key: 'reminder_type',
      width: 100,
      render: (type) => {
        const config = REMINDER_TYPE_MAP[type] || { label: type, color: 'default' };
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: '提醒日期',
      dataIndex: 'reminder_date',
      key: 'reminder_date',
      width: 120,
    },
    {
      title: '提醒时间',
      dataIndex: 'reminder_time',
      key: 'reminder_time',
      width: 100,
      render: (text) => text || '-',
    },
    {
      title: '重复',
      dataIndex: 'repeat_type',
      key: 'repeat_type',
      width: 80,
      render: (text) => {
        const map = { none: '不重复', daily: '每天', weekly: '每周', monthly: '每月' };
        return map[text] || text || '-';
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 90,
      render: (status) => {
        const config = STATUS_MAP[status] || { label: status, color: 'default' };
        return <Badge status={config.color} text={config.label} />;
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space>
          {record.status === 'pending' && (
            <Button
              type="text"
              icon={<CheckCircleOutlined />}
              onClick={() => handleComplete(record)}
              style={{ color: '#52c41a' }}
            >
              完成
            </Button>
          )}
          <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm title="确定删除？" onConfirm={() => handleDelete(record.id)}>
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
            <span>提醒中心</span>
          </Space>
        }
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            添加提醒
          </Button>
        }
      >
        <Row gutter={16} className="mb-4">
          <Col xs={24} sm={12} md={8}>
            <Statistic
              title="待处理"
              value={pendingCount}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Statistic
              title="已过期"
              value={overdueCount}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Statistic
              title="已完成"
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
        title={editingRecord ? '编辑提醒' : '添加提醒'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={500}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="提醒内容"
            name="title"
            rules={[{ required: true, message: '请输入提醒内容' }]}
          >
            <Input placeholder="例如：乙肝疫苗第二针" />
          </Form.Item>

          <Form.Item
            label="提醒类型"
            name="reminder_type"
            rules={[{ required: true, message: '请选择类型' }]}
          >
            <Select>
              <Select.Option value="vaccine">疫苗接种</Select.Option>
              <Select.Option value="checkup">体检</Select.Option>
              <Select.Option value="feeding">喂养提醒</Select.Option>
              <Select.Option value="medicine">用药提醒</Select.Option>
              <Select.Option value="other">其他</Select.Option>
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="提醒日期"
                name="reminder_date"
                rules={[{ required: true, message: '请选择日期' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="提醒时间" name="reminder_time">
                <Input placeholder="例如：09:00" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="重复" name="repeat_type">
            <Select>
              <Select.Option value="none">不重复</Select.Option>
              <Select.Option value="daily">每天</Select.Option>
              <Select.Option value="weekly">每周</Select.Option>
              <Select.Option value="monthly">每月</Select.Option>
            </Select>
          </Form.Item>

          {editingRecord && (
            <Form.Item label="状态" name="status">
              <Select>
                <Select.Option value="pending">待处理</Select.Option>
                <Select.Option value="completed">已完成</Select.Option>
                <Select.Option value="overdue">已过期</Select.Option>
                <Select.Option value="cancelled">已取消</Select.Option>
              </Select>
            </Form.Item>
          )}

          <Form.Item label="备注" name="notes">
            <Input.TextArea rows={3} placeholder="其他备注信息" />
          </Form.Item>

          <Form.Item className="flex justify-end gap-sm">
            <Button onClick={() => setModalOpen(false)}>取消</Button>
            <Button type="primary" htmlType="submit">
              {editingRecord ? '更新' : '保存'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ReminderCenter;

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
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { sleepService } from '../services/apiService';
import './SleepRecords.css';

const SleepRecords = () => {
  const [records, setRecords] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();
  const [ongoingSleep, setOngoingSleep] = useState(null);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const res = await sleepService.listRecords();
      if (res.success) {
        setRecords(res.records || []);
        setTotal(res.total || (res.records || []).length);
      } else {
        message.error(res.message || '获取记录失败');
      }
    } catch (error) {
      message.error('获取睡眠记录失败');
    } finally {
      setLoading(false);
    }
  }, []);

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

  const handleEdit = (record) => {
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

  const handleDelete = async (id) => {
    try {
      const res = await sleepService.deleteRecord(id);
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
      sleep_type: values.sleep_type,
      is_ongoing: values.is_ongoing,
      notes: values.notes,
    };

    try {
      if (editingRecord) {
        await sleepService.updateRecord(editingRecord.id, payload);
        message.success('更新成功');
      } else {
        await sleepService.createRecord(payload);
        message.success('记录成功');
      }
      setModalOpen(false);
      fetchRecords();
      fetchOngoingSleep();
    } catch (error) {
      message.error(editingRecord ? '更新失败' : '记录失败');
    }
  };

  const handleOngoingToggle = async (record) => {
    try {
      const now = dayjs().format('YYYY-MM-DD HH:mm');
      const payload = record.is_ongoing
        ? { is_ongoing: false, end_time: now }
        : { is_ongoing: true, end_time: null };
      await sleepService.updateRecord(record.id, payload);
      message.success(record.is_ongoing ? '睡眠已结束' : '睡眠已开始');
      fetchRecords();
      fetchOngoingSleep();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const getDuration = (start, end) => {
    if (!start) return '-';
    if (!end) return '进行中';
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
      width: 120,
      render: (_, record) => getDuration(record.start_time, record.end_time),
    },
    {
      title: '类型',
      dataIndex: 'sleep_type',
      key: 'sleep_type',
      width: 100,
      render: (type) => (
        <Tag color={type === 'night' ? 'purple' : 'blue'}>
          {type === 'night' ? '夜间睡眠' : '小睡'}
        </Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'is_ongoing',
      key: 'is_ongoing',
      width: 100,
      render: (isOngoing) => (
        <Tag color={isOngoing ? 'green' : 'default'}>
          {isOngoing ? '进行中' : '已结束'}
        </Tag>
      ),
    },
    {
      title: '备注',
      dataIndex: 'notes',
      key: 'notes',
      width: 150,
      render: (text) => text || '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_, record) => (
        <Space>
          <Button
            type={record.is_ongoing ? 'primary' : 'default'}
            icon={record.is_ongoing ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
            onClick={() => handleOngoingToggle(record)}
            size="small"
          >
            {record.is_ongoing ? '结束' : '开始'}
          </Button>
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
        </Space>
      ),
    },
  ];

  const handleTableChange = (pag) => {
    setPagination({ current: pag.current, pageSize: pag.pageSize });
  };

  return (
    <div>
      <Card
        title="睡眠记录"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            添加记录
          </Button>
        }
      >
        {ongoingSleep && (
          <div className="mb-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-yellow-800">宝宝正在睡觉</p>
                <p className="text-sm text-yellow-600">
                  开始时间：{ongoingSleep.start_time}
                </p>
              </div>
              <Button
                type="primary"
                danger
                onClick={() => handleOngoingToggle(ongoingSleep)}
              >
                结束睡眠
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
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
            }}
            variant="bordered"
            onChange={handleTableChange}
            rowClassName={(record) => (record.is_ongoing ? 'sleep-row-ongoing' : '')}
          />
        </Spin>
      </Card>

      <Modal
        title={editingRecord ? '编辑睡眠记录' : '添加睡眠记录'}
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
            label="类型"
            name="sleep_type"
            rules={[{ required: true, message: '请选择类型' }]}
          >
            <Select style={{ width: '100%' }}>
              <Select.Option value="night">夜间睡眠</Select.Option>
              <Select.Option value="nap">小睡</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="是否进行中" name="is_ongoing" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Form.Item label="备注" name="notes">
            <Input.TextArea rows={3} placeholder="其他备注信息" />
          </Form.Item>

          <Form.Item className="flex justify-end gap-2">
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

export default SleepRecords;

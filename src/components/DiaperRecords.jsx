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
import { diaperService } from '../services';

const COLOR_MAP = {
  yellow: '黄色',
  green: '绿色',
  brown: '棕色',
  black: '黑色',
  red: '红色',
  white: '白色',
};

const COLOR_TAG_COLOR = {
  yellow: 'gold',
  green: 'green',
  brown: 'brown',
  black: 'black',
  red: 'red',
  white: 'default',
};

const DiaperRecords = () => {
  const [records, setRecords] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();
  const [dateRange, setDateRange] = useState([]);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const res = await diaperService.listRecords();
      if (res.success) {
        let filtered = res.records || [];
        if (dateRange && dateRange[0] && dateRange[1]) {
          filtered = filtered.filter((record) => {
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
        message.error(res.message || '获取记录失败');
      }
    } catch (error) {
      message.error('获取排泄记录失败');
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    setModalOpen(true);
  };

  const handleEdit = (record) => {
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

  const handleDelete = async (id) => {
    try {
      const res = await diaperService.deleteRecord(id);
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
        message.success('更新成功');
      } else {
        await diaperService.createRecord(payload);
        message.success('记录成功');
      }
      setModalOpen(false);
      fetchRecords();
    } catch (error) {
      message.error(editingRecord ? '更新失败' : '记录失败');
    }
  };

  const columns = [
    {
      title: '时间',
      dataIndex: 'time',
      key: 'time',
      width: 150,
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type) => (
        <Tag color={type === 'pee' ? 'blue' : type === 'poop' ? 'green' : 'purple'}>
          {type === 'pee' ? '小便' : type === 'poop' ? '大便' : '两者都有'}
        </Tag>
      ),
    },
    {
      title: '小便',
      dataIndex: 'pee',
      key: 'pee',
      width: 60,
      render: (pee) => (pee ? '是' : '否'),
    },
    {
      title: '大便',
      dataIndex: 'poop',
      key: 'poop',
      width: 60,
      render: (poop) => (poop ? '是' : '否'),
    },
    {
      title: '颜色',
      dataIndex: 'color',
      key: 'color',
      width: 80,
      render: (color) => (
        <Tag color={COLOR_TAG_COLOR[color] || 'default'}>
          {COLOR_MAP[color] || color}
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
      width: 120,
      render: (_, record) => (
        <Space>
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

  return (
    <div>
      <Card
        title="排泄记录"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            添加记录
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
        title={editingRecord ? '编辑排泄记录' : '添加排泄记录'}
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
            label="时间"
            name="time"
            rules={[{ required: true, message: '请选择时间' }]}
          >
            <DatePicker
              showTime
              format="YYYY-MM-DD HH:mm"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            label="类型"
            name="type"
            rules={[{ required: true, message: '请选择类型' }]}
          >
            <Select style={{ width: '100%' }}>
              <Select.Option value="pee">小便</Select.Option>
              <Select.Option value="poop">大便</Select.Option>
              <Select.Option value="both">两者都有</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="小便" name="pee" valuePropName="checked">
            <Input.Checkbox />
          </Form.Item>

          <Form.Item label="大便" name="poop" valuePropName="checked">
            <Input.Checkbox />
          </Form.Item>

          <Form.Item label="颜色" name="color">
            <Select style={{ width: '100%' }}>
              {Object.entries(COLOR_MAP).map(([key, value]) => (
                <Select.Option key={key} value={key}>
                  {value}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

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

export default DiaperRecords;

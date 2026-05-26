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
import { feedingService } from '../services';

const FEEDING_TYPE_MAP = {
  breast: { label: '母乳', color: 'blue' },
  formula: { label: '配方奶', color: 'cyan' },
  solid: { label: '辅食', color: 'orange' },
  water: { label: '喝水', color: 'green' },
};

const FeedingRecords = () => {
  const [records, setRecords] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const res = await feedingService.listRecords();
      if (res.success) {
        setRecords(res.records || []);
        setTotal(res.total || (res.records || []).length);
      } else {
        message.error(res.message || '获取记录失败');
      }
    } catch (error) {
      message.error('获取喂养记录失败');
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
    setModalOpen(true);
  };

  const handleEdit = (record) => {
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

  const handleDelete = async (id) => {
    try {
      const res = await feedingService.deleteRecord(id);
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
        message.success('更新成功');
      } else {
        await feedingService.createRecord(payload);
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
      dataIndex: 'feeding_type',
      key: 'feeding_type',
      width: 100,
      render: (type) => {
        const config = FEEDING_TYPE_MAP[type] || { label: type, color: 'default' };
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: '详情',
      key: 'details',
      width: 200,
      render: (_, record) => {
        const details = [];
        if (record.duration_minutes) {
          details.push(`${record.duration_minutes}分钟`);
        }
        if (record.amount_ml) {
          details.push(`${record.amount_ml}ml`);
        }
        if (record.breast_side) {
          details.push(`侧边: ${record.breast_side === 'left' ? '左侧' : record.breast_side === 'right' ? '右侧' : '双侧'}`);
        }
        if (record.solid_food) {
          details.push(`辅食: ${record.solid_food}`);
        }
        if (record.water_amount_ml) {
          details.push(`水: ${record.water_amount_ml}ml`);
        }
        return details.length > 0 ? details.join(', ') : '-';
      },
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
        title="喂养记录"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            添加记录
          </Button>
        }
      >
        <Row gutter={16} className="mb-4">
          <Col span={6}>
            <Statistic title="总记录" value={stats.total} prefix={<CalendarOutlined />} />
          </Col>
          <Col span={6}>
            <Statistic title="母乳" value={stats.breast} valueStyle={{ color: '#1890ff' }} />
          </Col>
          <Col span={6}>
            <Statistic title="配方奶" value={stats.formula} valueStyle={{ color: '#13c2c2' }} />
          </Col>
          <Col span={6}>
            <Statistic title="辅食" value={stats.solid} valueStyle={{ color: '#fa8c16' }} />
          </Col>
        </Row>

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
        title={editingRecord ? '编辑喂养记录' : '添加喂养记录'}
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
            label="喂养类型"
            name="feeding_type"
            rules={[{ required: true, message: '请选择类型' }]}
          >
            <Select style={{ width: '100%' }}>
              <Select.Option value="breast">母乳</Select.Option>
              <Select.Option value="formula">配方奶</Select.Option>
              <Select.Option value="solid">辅食</Select.Option>
              <Select.Option value="water">喝水</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item noStyle shouldUpdate={(prev, curr) => prev.feeding_type !== curr.feeding_type}>
            {({ getFieldValue }) => {
              const type = getFieldValue('feeding_type');
              return (
                <>
                  {(type === 'breast') && (
                    <Form.Item label="喂奶侧边" name="breast_side">
                      <Select style={{ width: '100%' }}>
                        <Select.Option value="left">左侧</Select.Option>
                        <Select.Option value="right">右侧</Select.Option>
                        <Select.Option value="both">双侧</Select.Option>
                      </Select>
                    </Form.Item>
                  )}

                  {(type === 'breast') && (
                    <Form.Item label="喂奶时长(分钟)" name="duration_minutes">
                      <Input type="number" min={0} placeholder="请输入时长" />
                    </Form.Item>
                  )}

                  {(type === 'formula') && (
                    <Form.Item label="奶量(ml)" name="amount_ml">
                      <Input type="number" min={0} placeholder="请输入奶量" />
                    </Form.Item>
                  )}

                  {(type === 'solid') && (
                    <Form.Item label="辅食名称" name="solid_food">
                      <Input placeholder="请输入辅食名称" />
                    </Form.Item>
                  )}

                  {(type === 'water') && (
                    <Form.Item label="喝水量(ml)" name="water_amount_ml">
                      <Input type="number" min={0} placeholder="请输入喝水量" />
                    </Form.Item>
                  )}
                </>
              );
            }}
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

export default FeedingRecords;

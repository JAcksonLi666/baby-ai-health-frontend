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
import { growthService } from '../services';

const GrowthRecords = () => {
  const [records, setRecords] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const res = await growthService.listRecords();
      if (res.success) {
        setRecords(res.records || []);
        setTotal(res.total || (res.records || []).length);
      } else {
        message.error(res.message || '获取记录失败');
      }
    } catch (error) {
      message.error('获取生长发育记录失败');
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
    form.setFieldValue('record_date', dayjs());
    setModalOpen(true);
  };

  const handleEdit = (record) => {
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

  const handleDelete = async (id) => {
    try {
      const res = await growthService.deleteRecord(id);
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
        message.success('更新成功');
      } else {
        await growthService.createRecord(payload);
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
      title: '日期',
      dataIndex: 'record_date',
      key: 'record_date',
      width: 120,
    },
    {
      title: '体重',
      dataIndex: 'weight_kg',
      key: 'weight_kg',
      width: 100,
      render: (value) => value ? `${value} kg` : '-',
    },
    {
      title: '身高',
      dataIndex: 'height_cm',
      key: 'height_cm',
      width: 100,
      render: (value) => value ? `${value} cm` : '-',
    },
    {
      title: '头围',
      dataIndex: 'head_circumference_cm',
      key: 'head_circumference_cm',
      width: 100,
      render: (value) => value ? `${value} cm` : '-',
    },
    {
      title: '体温',
      dataIndex: 'temperature_c',
      key: 'temperature_c',
      width: 100,
      render: (value) => {
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

  // 获取最新记录
  const latestRecord = records.length > 0 ? records[0] : null;

  return (
    <div>
      <Card
        title="生长发育记录"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            添加记录
          </Button>
        }
      >
        {latestRecord && (
          <Row gutter={16} className="mb-4">
            <Col span={6}>
              <Statistic
                title="最新体重"
                value={latestRecord.weight_kg ? `${latestRecord.weight_kg} kg` : '-'}
                prefix={<CheckCircleOutlined />}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="最新身高"
                value={latestRecord.height_cm ? `${latestRecord.height_cm} cm` : '-'}
                prefix={<CheckCircleOutlined />}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="最新头围"
                value={latestRecord.head_circumference_cm ? `${latestRecord.head_circumference_cm} cm` : '-'}
                prefix={<CheckCircleOutlined />}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="记录日期"
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
        title={editingRecord ? '编辑生长发育记录' : '添加生长发育记录'}
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
            label="记录日期"
            name="record_date"
            rules={[{ required: true, message: '请选择日期' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="体重(kg)" name="weight_kg">
                <Input type="number" step="0.1" min={0} max={150} placeholder="请输入体重" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="身高(cm)" name="height_cm">
                <Input type="number" step="0.1" min={0} max={250} placeholder="请输入身高" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="头围(cm)" name="head_circumference_cm">
                <Input type="number" step="0.1" min={0} max={70} placeholder="请输入头围" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="体温(°C)" name="temperature_c">
                <Input type="number" step="0.1" min={35} max={42} placeholder="请输入体温" />
              </Form.Item>
            </Col>
          </Row>

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

export default GrowthRecords;

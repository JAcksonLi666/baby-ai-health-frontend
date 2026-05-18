import React, { useState, useEffect } from 'react';
import {
  Table, DatePicker, Select, Button, Card, message, Modal, Tag,
  Statistic, Row, Col, Input, Spin, Alert, Empty
} from 'antd';
import {
  EyeOutlined, EditOutlined, SaveOutlined, CloseOutlined, DeleteOutlined, SearchOutlined, SyncOutlined, FilterOutlined
} from '@ant-design/icons';
import moment from 'moment';
import { recordService } from '../services/apiService';
import './RecordManagement.css';

const { Option } = Select;

const TYPE_MAP = {
  'blood_test': { label: '血液检测', color: 'red' },
  'urine_test': { label: '尿液检测', color: 'blue' },
  'general': { label: '常规记录', color: 'gray' }
};

function RecordManagement() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [filters, setFilters] = useState({
    record_type: '',
    start_date: '',
    end_date: '',
    keyword: ''
  });
  const [recordTypes, setRecordTypes] = useState([]);

  useEffect(() => {
    loadRecords();
    loadRecordTypes();
  }, []);

  const loadRecords = async () => {
    setLoading(true);
    try {
      const result = await recordService.getRecords();
      if (result.success) {
        setRecords(result.records);
      }
    } catch (error) {
      console.error('加载记录失败:', error);
      message.error('加载记录失败');
    } finally {
      setLoading(false);
    }
  };

  const loadRecordTypes = async () => {
    try {
      const result = await recordService.getRecordTypes();
      if (result.success) {
        setRecordTypes(result.types);
      }
    } catch (error) {
      console.error('获取记录类型失败:', error);
    }
  };

  const handleFilter = async () => {
    setLoading(true);
    try {
      const filterParams = {};
      if (filters.record_type) filterParams.record_type = filters.record_type;
      if (filters.start_date) filterParams.start_date = filters.start_date.format('YYYY-MM-DD');
      if (filters.end_date) filterParams.end_date = filters.end_date.format('YYYY-MM-DD');
      if (filters.keyword) filterParams.keyword = filters.keyword;
      
      const result = await recordService.filterRecords(filterParams);
      if (result.success) {
        setRecords(result.records);
      }
    } catch (error) {
      console.error('筛选记录失败:', error);
      message.error('筛选失败');
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = () => {
    setFilters({
      record_type: '',
      start_date: null,
      end_date: null,
      keyword: ''
    });
    loadRecords();
  };

  const handleViewDetail = (record) => {
    setSelectedRecord(record);
    setShowModal(true);
  };

  const handleEdit = (record) => {
    setEditingRecord({
      ...record,
      editDate: record.metadata?.record_date ? moment(record.metadata.record_date) : moment(),
      editType: record.metadata?.type || 'general'
    });
  };

  const handleSaveEdit = async () => {
    if (!editingRecord) return;
    
    try {
      const result = await recordService.updateRecord(
        editingRecord.id,
        editingRecord.editDate.format('YYYY-MM-DD'),
        editingRecord.editType
      );
      if (result.success) {
        message.success('更新成功');
        setEditingRecord(null);
        loadRecords();
        loadRecordTypes();
      }
    } catch (error) {
      console.error('更新失败:', error);
      message.error('更新失败');
    }
  };

  const handleDelete = async (recordId) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这条记录吗？',
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          const result = await recordService.deleteRecord(recordId);
          if (result.success) {
            message.success('删除成功');
            loadRecords();
            loadRecordTypes();
          }
        } catch (error) {
          console.error('删除失败:', error);
          message.error('删除失败');
        }
      }
    });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '未知';
    return moment(dateStr).format('YYYY-MM-DD');
  };

  const getTypeInfo = (type) => {
    return TYPE_MAP[type] || { label: type, color: 'gray' };
  };

  const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const columns = [
    {
      title: '记录ID',
      dataIndex: 'id',
      key: 'id',
      render: (text) => <span className="record-id">{text.substring(0, 12)}...</span>,
      width: 120
    },
    {
      title: '日期',
      dataIndex: 'metadata',
      key: 'date',
      render: (meta) => formatDate(meta?.record_date),
      width: 120
    },
    {
      title: '类型',
      dataIndex: 'metadata',
      key: 'type',
      render: (meta) => {
        const typeInfo = getTypeInfo(meta?.type);
        return <Tag color={typeInfo.color}>{typeInfo.label}</Tag>;
      },
      width: 120
    },
    {
      title: '内容摘要',
      dataIndex: 'text',
      key: 'text',
      render: (text) => <span className="record-text">{truncateText(text)}</span>
    },
    {
      title: '操作',
      key: 'actions',
      width: 260,
      render: (_, record) => (
        <div className="actions">
          <Button
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleViewDetail(record)}
          >
            查看
          </Button>
          {!editingRecord || editingRecord.id !== record.id ? (
            <Button
              icon={<EditOutlined />}
              size="small"
              onClick={() => handleEdit(record)}
            >
              编辑
            </Button>
          ) : (
            <>
              <Button
                icon={<SaveOutlined />}
                type="primary"
                size="small"
                onClick={handleSaveEdit}
              >
                保存
              </Button>
              <Button
                icon={<CloseOutlined />}
                size="small"
                onClick={() => setEditingRecord(null)}
              >
                取消
              </Button>
            </>
          )}
          <Button
            icon={<DeleteOutlined />}
            danger
            size="small"
            onClick={() => handleDelete(record.id)}
          >
            删除
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="record-management">
      {/* 统计卡片 */}
      <Row gutter={16} className="stats-row">
        <Col span={6}>
          <Card className="stat-card">
            <Statistic
              title="总记录数"
              value={records.length}
              prefix={<FilterOutlined />}
            />
          </Card>
        </Col>
        {recordTypes.map((type) => (
          <Col key={type.type} span={6}>
            <Card className="stat-card">
              <Statistic
                title={type.name}
                value={type.count}
                prefix={<FilterOutlined />}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* 筛选区域 */}
      <Card className="filter-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <FilterOutlined style={{ fontSize: 18 }} />
          <span style={{ fontWeight: 600 }}>筛选条件</span>
        </div>
        <Row gutter={16}>
          <Col span={5}>
            <Select
              value={filters.record_type}
              onChange={(value) => setFilters({ ...filters, record_type: value })}
              placeholder="全部类型"
              className="filter-select"
            >
              <Option value="">全部类型</Option>
              <Option value="blood_test">血液检测</Option>
              <Option value="urine_test">尿液检测</Option>
              <Option value="general">常规记录</Option>
            </Select>
          </Col>
          <Col span={5}>
            <DatePicker
              value={filters.start_date}
              onChange={(date) => setFilters({ ...filters, start_date: date })}
              placeholder="开始日期"
              className="filter-date"
            />
          </Col>
          <Col span={5}>
            <DatePicker
              value={filters.end_date}
              onChange={(date) => setFilters({ ...filters, end_date: date })}
              placeholder="结束日期"
              className="filter-date"
            />
          </Col>
          <Col span={5}>
            <Input
              placeholder="搜索关键词..."
              value={filters.keyword}
              onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
              onPressEnter={handleFilter}
              prefix={<SearchOutlined />}
              className="filter-input"
            />
          </Col>
          <Col span={4}>
            <div className="filter-actions">
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={handleFilter}
                style={{ marginRight: 8 }}
              >
                筛选
              </Button>
              <Button
                icon={<SyncOutlined />}
                onClick={handleResetFilters}
              >
                重置
              </Button>
            </div>
          </Col>
        </Row>
      </Card>

      {/* 编辑表单 */}
      {editingRecord && (
        <Card className="edit-card" title="编辑记录">
          <Row gutter={16}>
            <Col span={12}>
              <DatePicker
                value={editingRecord.editDate}
                onChange={(date) => setEditingRecord({ ...editingRecord, editDate: date })}
                placeholder="选择日期"
                style={{ width: '100%' }}
              />
            </Col>
            <Col span={12}>
              <Select
                value={editingRecord.editType}
                onChange={(value) => setEditingRecord({ ...editingRecord, editType: value })}
                placeholder="选择类型"
                style={{ width: '100%' }}
              >
                <Option value="blood_test">血液检测</Option>
                <Option value="urine_test">尿液检测</Option>
                <Option value="general">常规记录</Option>
              </Select>
            </Col>
          </Row>
        </Card>
      )}

      {/* 记录列表 */}
      <Card className="record-card" title="档案列表">
        {loading ? (
          <div className="loading-container">
            <Spin size="large" tip="加载中..." />
          </div>
        ) : records.length === 0 ? (
          <Empty description="暂无记录" />
        ) : (
          <Table
            dataSource={records}
            columns={columns}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            bordered={false}
            className="record-table"
          />
        )}
      </Card>

      {/* 详情弹窗 */}
      <Modal
        title="记录详情"
        visible={showModal}
        onCancel={() => setShowModal(false)}
        footer={null}
        width={700}
      >
        {selectedRecord && (
          <div className="modal-content">
            <div className="detail-section">
              <h4>基本信息</h4>
              <div className="detail-row">
                <span className="detail-label">记录ID:</span>
                <span>{selectedRecord.id}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">日期:</span>
                <span>{formatDate(selectedRecord.metadata?.record_date)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">类型:</span>
                {(() => {
                  const typeInfo = getTypeInfo(selectedRecord.metadata?.type);
                  return <Tag color={typeInfo.color}>{typeInfo.label}</Tag>;
                })()}
              </div>
              <div className="detail-row">
                <span className="detail-label">文件名:</span>
                <span>{selectedRecord.metadata?.original_filename || '未知'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">上传时间:</span>
                <span>{selectedRecord.metadata?.upload_time ? moment(selectedRecord.metadata.upload_time).format('YYYY-MM-DD HH:mm:ss') : '未知'}</span>
              </div>
            </div>
            <div className="detail-section">
              <h4>识别内容</h4>
              <pre className="content-pre">{selectedRecord.text}</pre>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default RecordManagement;

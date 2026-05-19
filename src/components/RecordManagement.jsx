import React, { useState, useEffect } from 'react';
import {
  Table, DatePicker, Select, Button, Card, message, Modal, Tag,
  Statistic, Row, Col, Input, Spin, Alert, Empty
} from 'antd';
import {
  EyeOutlined, EditOutlined, SaveOutlined, CloseOutlined, DeleteOutlined, SearchOutlined, SyncOutlined, FilterOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import { recordService } from '../services/apiService';
import './RecordManagement.css';

const { Option } = Select;

function RecordManagement() {
  const { t } = useTranslation();
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
      message.error(t('records.error.load'));
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
      message.error(t('records.error.filter'));
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
        message.success(t('records.success.update'));
        setEditingRecord(null);
        loadRecords();
        loadRecordTypes();
      }
    } catch (error) {
      console.error('更新失败:', error);
      message.error(t('records.error.update'));
    }
  };

  const handleDelete = async (recordId) => {
    Modal.confirm({
      title: t('records.confirmDelete'),
      content: t('records.deleteConfirm'),
      okText: t('records.delete'),
      okType: 'danger',
      cancelText: t('common.cancel'),
      onOk: async () => {
        try {
          const result = await recordService.deleteRecord(recordId);
          if (result.success) {
            message.success(t('records.success.delete'));
            loadRecords();
            loadRecordTypes();
          }
        } catch (error) {
          console.error('删除失败:', error);
          message.error(t('records.error.delete'));
        }
      }
    });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return t('records.unknown');
    return moment(dateStr).format('YYYY-MM-DD');
  };

  const getTypeInfo = (type) => {
    const typeMap = {
      'blood_test': { label: t('records.bloodTest'), color: 'red' },
      'urine_test': { label: t('records.urineTest'), color: 'blue' },
      'general': { label: t('records.general'), color: 'gray' },
      'other': { label: t('records.other'), color: 'purple' }
    };
    return typeMap[type] || { label: type, color: 'gray' };
  };

  const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const columns = [
    {
      title: t('records.recordId'),
      dataIndex: 'id',
      key: 'id',
      render: (text) => <span className="record-id">{text.substring(0, 12)}...</span>,
      width: 120
    },
    {
      title: t('records.date'),
      dataIndex: 'metadata',
      key: 'date',
      render: (meta) => formatDate(meta?.record_date),
      width: 120
    },
    {
      title: t('records.type'),
      dataIndex: 'metadata',
      key: 'type',
      render: (meta) => {
        const typeInfo = getTypeInfo(meta?.type);
        return <Tag color={typeInfo.color}>{typeInfo.label}</Tag>;
      },
      width: 120
    },
    {
      title: t('records.content'),
      dataIndex: 'text',
      key: 'text',
      render: (text) => <span className="record-text">{truncateText(text)}</span>
    },
    {
      title: t('records.actions'),
      key: 'actions',
      width: 110,
      fixed: 'right',
      render: (_, record) => (
        <div className="actions">
          <Button
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleViewDetail(record)}
          />
          {!editingRecord || editingRecord.id !== record.id ? (
            <Button
              icon={<EditOutlined />}
              size="small"
              onClick={() => handleEdit(record)}
            />
          ) : (
            <>
              <Button
                icon={<SaveOutlined />}
                type="primary"
                size="small"
                onClick={handleSaveEdit}
              />
              <Button
                icon={<CloseOutlined />}
                size="small"
                onClick={() => setEditingRecord(null)}
              />
            </>
          )}
          <Button
            icon={<DeleteOutlined />}
            danger
            size="small"
            onClick={() => handleDelete(record.id)}
          />
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
          <span style={{ fontWeight: 600 }}>{t('records.filter')}</span>
        </div>
        <Row gutter={16}>
          <Col span={5}>
            <Select
              value={filters.record_type}
              onChange={(value) => setFilters({ ...filters, record_type: value })}
              placeholder={t('records.allTypes')}
              className="filter-select"
            >
              <Option value="">{t('records.allTypes')}</Option>
              <Option value="blood_test">{t('records.bloodTest')}</Option>
              <Option value="urine_test">{t('records.urineTest')}</Option>
              <Option value="general">{t('records.general')}</Option>
            </Select>
          </Col>
          <Col span={5}>
            <DatePicker
              value={filters.start_date}
              onChange={(date) => setFilters({ ...filters, start_date: date })}
              placeholder={t('records.startDate')}
              className="filter-date"
            />
          </Col>
          <Col span={5}>
            <DatePicker
              value={filters.end_date}
              onChange={(date) => setFilters({ ...filters, end_date: date })}
              placeholder={t('records.endDate')}
              className="filter-date"
            />
          </Col>
          <Col span={5}>
            <Input
              placeholder={t('records.keyword')}
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
                {t('records.search')}
              </Button>
              <Button
                icon={<SyncOutlined />}
                onClick={handleResetFilters}
              >
                {t('records.reset')}
              </Button>
            </div>
          </Col>
        </Row>
      </Card>

      {/* 编辑表单 */}
      {editingRecord && (
        <Card className="edit-card" title={t('records.editRecord')}>
          <Row gutter={16}>
            <Col span={12}>
              <DatePicker
                value={editingRecord.editDate}
                onChange={(date) => setEditingRecord({ ...editingRecord, editDate: date })}
                placeholder={t('records.selectDate')}
                style={{ width: '100%' }}
              />
            </Col>
            <Col span={12}>
              <Select
                value={editingRecord.editType}
                onChange={(value) => setEditingRecord({ ...editingRecord, editType: value })}
                placeholder={t('records.selectType')}
                style={{ width: '100%' }}
              >
                <Option value="blood_test">{t('records.bloodTest')}</Option>
                <Option value="urine_test">{t('records.urineTest')}</Option>
                <Option value="general">{t('records.general')}</Option>
              </Select>
            </Col>
          </Row>
        </Card>
      )}

      {/* 记录列表 */}
      <Card className="record-card" title={t('records.recordList')}>
        {loading ? (
          <div className="loading-container">
            <Spin size="large" tip={t('records.loading')} />
          </div>
        ) : records.length === 0 ? (
          <Empty description={t('records.noRecords')} />
        ) : (
          <Table
            dataSource={records}
            columns={columns}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            variant="outlined"
            className="record-table"
            scroll={{ x: 1200 }}
          />
        )}
      </Card>

      {/* 详情弹窗 */}
      <Modal
        title={t('records.detail')}
        open={showModal}
        onCancel={() => setShowModal(false)}
        footer={null}
        width={800}
      >
        {selectedRecord && (
          <div className="modal-content">
            <div className="detail-section">
              <h4>{t('records.basicInfo')}</h4>
              <div className="detail-row">
                <span className="detail-label">{t('records.recordId')}:</span>
                <span>{selectedRecord.id}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">{t('records.date')}:</span>
                <span>{formatDate(selectedRecord.metadata?.record_date)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">{t('records.type')}:</span>
                {(() => {
                  const typeInfo = getTypeInfo(selectedRecord.metadata?.type);
                  return <Tag color={typeInfo.color}>{typeInfo.label}</Tag>;
                })()}
              </div>
              <div className="detail-row">
                <span className="detail-label">{t('records.filename')}:</span>
                <span>{selectedRecord.metadata?.original_filename || t('records.unknown')}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">{t('records.uploadTime')}:</span>
                <span>{selectedRecord.metadata?.upload_time ? moment(selectedRecord.metadata.upload_time).format('YYYY-MM-DD HH:mm:ss') : t('records.unknown')}</span>
              </div>
            </div>
            <div className="detail-section">
              <h4>{t('upload.recognizedContent')}</h4>
              <pre className="content-pre">{selectedRecord.text}</pre>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default RecordManagement;

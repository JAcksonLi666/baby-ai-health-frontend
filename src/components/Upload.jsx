import React, { useState } from 'react';
import { Upload, DatePicker, Select, Button, Card, message, Spin, Alert, Tag, Divider } from 'antd';
import { UploadOutlined, EyeOutlined, CheckCircleOutlined, AlertOutlined } from '@ant-design/icons';
import moment from 'moment';
import { uploadService } from '../services/apiService';
import './Upload.css';

const { Option } = Select;

const UploadComponent = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [recordDate, setRecordDate] = useState(moment());
  const [recordType, setRecordType] = useState('general');
  const [uploading, setUploading] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [detectedDate, setDetectedDate] = useState(null);
  const [extractedText, setExtractedText] = useState('');

  const handleFileChange = (info) => {
    const file = info.file.originFileObj || info.file;
    
    if (file) {
      setSelectedFile(file);
      setError(null);
      setResult(null);
      setExtractedText('');
      setDetectedDate(null);

      if (file.type && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setPreview(null);
      }
    }
  };

  const handlePreview = async () => {
    if (!selectedFile) {
      message.error('请选择文件');
      return;
    }

    setPreviewing(true);
    setError(null);

    try {
      const response = await uploadService.previewFile(selectedFile);

      if (response.success) {
        setExtractedText(response.extracted_text);
        const dateToUse = response.detected_date 
          ? moment(response.detected_date) 
          : moment();
        setDetectedDate(response.detected_date);
        setRecordDate(dateToUse);
        message.success('识别成功');
      } else {
        setError(response.message || '识别失败');
      }
    } catch (err) {
      setError(err.detail || '识别失败，请重试');
    } finally {
      setPreviewing(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      message.error('请选择文件');
      return;
    }

    if (!recordDate) {
      message.error('请选择记录日期');
      return;
    }

    setUploading(true);
    setError(null);
    setResult(null);

    try {
      const response = await uploadService.uploadFile(
        selectedFile,
        recordDate.format('YYYY-MM-DD'),
        recordType
      );

      setResult(response);
      setSelectedFile(null);
      setPreview(null);
      setExtractedText('');
      setDetectedDate(null);
      message.success('上传成功');
    } catch (err) {
      message.error(err.detail || '上传失败，请重试');
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    setExtractedText('');
    setDetectedDate(null);
    setRecordDate(moment());
    setRecordType('general');
  };

  const uploadProps = {
    beforeUpload: () => false,
    onChange: handleFileChange,
    accept: '.jpg,.jpeg,.png,.pdf',
    showUploadList: false,
  };

  return (
    <div className="upload-container">
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <UploadOutlined style={{ fontSize: 24 }} />
            <span>上传化验单</span>
          </div>
        }
        bordered={false}
        className="upload-card"
      >
        <p className="upload-description">
          上传宝宝的化验单图片或 PDF，系统将自动识别并提取健康指标
        </p>

        <div className="form-section">
          <Select
            value={recordType}
            onChange={(value) => setRecordType(value)}
            placeholder="选择记录类型"
            className="form-select"
          >
            <Option value="general">一般记录</Option>
            <Option value="blood_test">血液检测</Option>
            <Option value="urine_test">尿液检测</Option>
            <Option value="other">其他检测</Option>
          </Select>
        </div>

        <div className="form-section">
          <Upload {...uploadProps}>
            <Button icon={<UploadOutlined />} size="large" block>
              {selectedFile ? `已选择: ${selectedFile.name}` : '点击选择文件'}
            </Button>
          </Upload>
        </div>

        {preview && (
          <div className="preview-container">
            <img src={preview} alt="预览" className="preview-image" />
          </div>
        )}

        {selectedFile && !extractedText && !result && (
          <div className="button-group">
            <Button
              type="primary"
              icon={<EyeOutlined />}
              onClick={handlePreview}
              loading={previewing}
              block
              size="large"
            >
              {previewing ? '识别中...' : '开始识别'}
            </Button>
            <Button onClick={handleReset} block size="large">
              取消
            </Button>
          </div>
        )}

        {extractedText && !result && (
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <EyeOutlined style={{ fontSize: 18 }} />
                <span>识别结果</span>
              </div>
            }
            className="recognition-card"
          >
            <div className="date-section">
              <div style={{ marginBottom: 8 }}>
                <span style={{ fontWeight: 600 }}>记录日期</span>
                {detectedDate && (
                  <Tag color="green" style={{ marginLeft: 8 }}>
                    从化验单识别: {detectedDate}
                  </Tag>
                )}
                {!detectedDate && (
                  <Tag color="gold" style={{ marginLeft: 8 }}>
                    未识别到日期，使用今日日期
                  </Tag>
                )}
              </div>
              <DatePicker
                value={recordDate}
                onChange={(date) => setRecordDate(date)}
                className="date-picker"
                style={{ width: '100%' }}
                placeholder="选择日期"
              />
              <div className="date-display" style={{ marginTop: 12 }}>
                <span className="date-label">当前选择:</span>
                <span className="date-value">
                  {recordDate.isSame(moment(), 'day') ? '今天' : recordDate.format('YYYY年MM月DD日')}
                </span>
              </div>
            </div>

            <Divider style={{ margin: '16px 0' }} />

            <div className="extracted-text-container">
              <div style={{ fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="ocr-section-line"></div>
                <span>识别内容</span>
                <div className="ocr-section-line"></div>
              </div>
              <div className="ocr-content-wrapper">
                <pre className="ocr-text">{extractedText}</pre>
              </div>
            </div>

            <div className="button-group">
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={handleUpload}
                loading={uploading}
                disabled={!recordDate}
                block
                size="large"
              >
                {uploading ? '上传中...' : '确认上传'}
              </Button>
              <Button onClick={handleReset} block size="large">
                重新选择
              </Button>
            </div>
          </Card>
        )}

        {result && (
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircleOutlined style={{ fontSize: 18, color: '#52c41a' }} />
                <span>上传成功</span>
              </div>
            }
            className="result-card"
          >
            <Alert
              message={result.message}
              type="success"
              showIcon
            />
            {result.record_date && (
              <div style={{ marginTop: 12 }}>
                <Tag color="blue">记录日期: {result.record_date}</Tag>
              </div>
            )}
            <Divider style={{ margin: '16px 0' }} />
            <div className="extracted-text-container">
              <div style={{ fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="ocr-section-line"></div>
                <span>识别内容</span>
                <div className="ocr-section-line"></div>
              </div>
              <div className="ocr-content-wrapper">
                <pre className="ocr-text">{result.extracted_text}</pre>
              </div>
            </div>
            <Button onClick={handleReset} block size="large" style={{ marginTop: 16 }}>
              继续上传
            </Button>
          </Card>
        )}

        {error && (
          <Alert
            message={<AlertOutlined style={{ marginRight: 8 }} />}
            description={error}
            type="error"
            showIcon
          />
        )}

        {previewing && (
          <div className="loading-container">
            <Spin size="large" tip="正在识别..." />
          </div>
        )}
      </Card>
    </div>
  );
};

export default UploadComponent;

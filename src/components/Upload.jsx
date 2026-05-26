import React, { useState } from 'react';
import { Upload, DatePicker, Select, Button, Card, message, Spin, Alert, Tag, Divider } from 'antd';
import { UploadOutlined, EyeOutlined, CheckCircleOutlined, AlertOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { uploadService } from '../services';
import './Upload.css';

const { Option } = Select;

const UploadComponent = () => {
  const { t } = useTranslation();
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [recordDate, setRecordDate] = useState(dayjs());
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
      message.error(t('upload.selectFile'));
      return;
    }

    setPreviewing(true);
    setError(null);

    try {
      const response = await uploadService.previewFile(selectedFile);

      if (response.success) {
        setExtractedText(response.extracted_text);
        const dateToUse = response.detected_date 
          ? dayjs(response.detected_date) 
          : dayjs();
        setDetectedDate(response.detected_date);
        setRecordDate(dateToUse);
        message.success(t('upload.startRecognition'));
      } else {
        setError(response.message || t('upload.error'));
      }
    } catch (err) {
      setError(err.detail || t('upload.error'));
    } finally {
      setPreviewing(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      message.error(t('upload.selectFile'));
      return;
    }

    if (!recordDate) {
      message.error(t('upload.recordDate'));
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
      message.success(t('upload.uploadSuccess'));
    } catch (err) {
      message.error(err.detail || t('upload.error'));
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
    setRecordDate(dayjs());
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
            <span>{t('upload.title')}</span>
          </div>
        }
        variant="outlined"
        className="upload-card"
      >
        <p className="upload-description">
          {t('upload.description')}
        </p>

        <div className="form-section">
          <Select
            value={recordType}
            onChange={(value) => setRecordType(value)}
            placeholder={t('upload.selectType')}
            className="form-select"
          >
            <Option value="general">{t('records.general')}</Option>
            <Option value="blood_test">{t('records.bloodTest')}</Option>
            <Option value="urine_test">{t('records.urineTest')}</Option>
            <Option value="other">{t('records.other')}</Option>
          </Select>
        </div>

        <div className="form-section">
          <Upload {...uploadProps}>
            <Button icon={<UploadOutlined />} size="large" block>
              {selectedFile ? `${t('upload.selectedFile')} ${selectedFile.name}` : t('upload.selectFile')}
            </Button>
          </Upload>
        </div>

        {preview && (
          <div className="preview-container">
            <img src={preview} alt={t('upload.preview')} className="preview-image" />
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
              {previewing ? t('upload.recognizing') : t('upload.startRecognition')}
            </Button>
            <Button onClick={handleReset} block size="large">
              {t('upload.cancel')}
            </Button>
          </div>
        )}

        {extractedText && !result && (
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <EyeOutlined style={{ fontSize: 18 }} />
                <span>{t('upload.recognized')}</span>
              </div>
            }
            className="recognition-card"
          >
            <div className="date-section">
              <div style={{ marginBottom: 8 }}>
                <span style={{ fontWeight: 600 }}>{t('upload.recordDate')}</span>
                {detectedDate && (
                  <Tag color="green" style={{ marginLeft: 8 }}>
                    {t('upload.detectedDate')} {detectedDate}
                  </Tag>
                )}
                {!detectedDate && (
                  <Tag color="gold" style={{ marginLeft: 8 }}>
                    {t('upload.defaultDate')}
                  </Tag>
                )}
              </div>
              <DatePicker
                value={recordDate}
                onChange={(date) => setRecordDate(date)}
                className="date-picker"
                style={{ width: '100%' }}
                placeholder={t('upload.selectDate')}
              />
              <div className="date-display" style={{ marginTop: 12 }}>
                <span className="date-label">{t('upload.currentSelection')}</span>
                <span className="date-value">
                  {recordDate.isSame(dayjs(), 'day') ? t('upload.today') : recordDate.format('YYYY年MM月DD日')}
                </span>
              </div>
            </div>

            <Divider style={{ margin: '16px 0' }} />

            <div className="extracted-text-container">
              <div style={{ fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="ocr-section-line"></div>
                <span>{t('upload.recognizedContent')}</span>
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
                {uploading ? t('upload.uploading') : t('upload.confirmUpload')}
              </Button>
              <Button onClick={handleReset} block size="large">
                {t('upload.reSelect')}
              </Button>
            </div>
          </Card>
        )}

        {result && (
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircleOutlined style={{ fontSize: 18, color: '#52c41a' }} />
                <span>{t('upload.uploadSuccess')}</span>
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
                <Tag color="blue">{t('upload.recordDate')}: {result.record_date}</Tag>
              </div>
            )}
            <Divider style={{ margin: '16px 0' }} />
            <div className="extracted-text-container">
              <div style={{ fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="ocr-section-line"></div>
                <span>{t('upload.recognizedContent')}</span>
                <div className="ocr-section-line"></div>
              </div>
              <div className="ocr-content-wrapper">
                <pre className="ocr-text">{result.extracted_text}</pre>
              </div>
            </div>
            <Button onClick={handleReset} block size="large" style={{ marginTop: 16 }}>
              {t('upload.continue')}
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
            <Spin size="large" tip={t('upload.recognizing')} />
          </div>
        )}
      </Card>
    </div>
  );
};

export default UploadComponent;

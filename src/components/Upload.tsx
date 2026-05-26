import React, { useState } from 'react';
import { Upload, DatePicker, Select, Button, Card, message, Spin, Alert, Tag, Divider } from 'antd';
import { UploadOutlined, EyeOutlined, CheckCircleOutlined, AlertOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { uploadService } from '../services';
import './Upload.css';

const { Option } = Select;

interface UploadResult {
  success: boolean;
  message?: string;
  record_date?: string;
  extracted_text?: string;
}

const UploadComponent = () => {
  const { t } = useTranslation();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [recordDate, setRecordDate] = useState<dayjs.Dayjs>(dayjs());
  const [recordType, setRecordType] = useState<string>('general');
  const [uploading, setUploading] = useState<boolean>(false);
  const [previewing, setPreviewing] = useState<boolean>(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [detectedDate, setDetectedDate] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');

  const handleFileChange = (info: any) => {
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
          setPreview(reader.result as string);
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
    } catch (err: any) {
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
    } catch (err: any) {
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
          <div className="upload-card-title">
            <UploadOutlined className="upload-card-title-icon" />
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
            onChange={(value: string) => setRecordType(value)}
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
              <div className="upload-card-title">
                <EyeOutlined className="upload-card-title-icon-sm" />
                <span>{t('upload.recognized')}</span>
              </div>
            }
            className="recognition-card"
          >
            <div className="date-section">
              <div className="date-label-row">
                <span className="date-label-bold">{t('upload.recordDate')}</span>
                {detectedDate && (
                  <Tag color="green" className="date-tag">{t('upload.detectedDate')} {detectedDate}</Tag>
                )}
                {!detectedDate && (
                  <Tag color="gold" className="date-tag">{t('upload.defaultDate')}</Tag>
                )}
              </div>
              <DatePicker
                value={recordDate}
                onChange={(date: dayjs.Dayjs | null) => setRecordDate(date!)}
                className="date-picker"
                style={{ width: '100%' }}
                placeholder={t('upload.selectDate')}
              />
              <div className="date-display">
                <span className="date-label">{t('upload.currentSelection')}</span>
                <span className="date-value">
                  {recordDate.isSame(dayjs(), 'day') ? t('upload.today') : recordDate.format('YYYY年MM月DD日')}
                </span>
              </div>
            </div>

            <Divider className="upload-divider" />

            <div className="extracted-text-container">
              <div className="ocr-section-title">
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
              <div className="upload-card-title">
                <CheckCircleOutlined className="upload-card-title-icon-success" />
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
              <div className="result-date-tag">
                <Tag color="blue">{t('upload.recordDate')}: {result.record_date}</Tag>
              </div>
            )}
            <Divider className="upload-divider" />
            <div className="extracted-text-container">
              <div className="ocr-section-title">
                <div className="ocr-section-line"></div>
                <span>{t('upload.recognizedContent')}</span>
                <div className="ocr-section-line"></div>
              </div>
              <div className="ocr-content-wrapper">
                <pre className="ocr-text">{result.extracted_text}</pre>
              </div>
            </div>
            <Button onClick={handleReset} block size="large" className="continue-button">
              {t('upload.continue')}
            </Button>
          </Card>
        )}

        {error && (
          <Alert
            message={<AlertOutlined className="error-alert-icon" />}
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

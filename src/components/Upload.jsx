import React, { useState } from 'react';
import { uploadService } from '../services/apiService';
import './Upload.css';

const Upload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [recordDate, setRecordDate] = useState(new Date().toISOString().split('T')[0]);
  const [recordType, setRecordType] = useState('general');
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
      setResult(null);

      if (file.type.startsWith('image/')) {
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

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('请选择文件');
      return;
    }

    if (!recordDate) {
      setError('请选择记录日期');
      return;
    }

    setUploading(true);
    setError(null);
    setResult(null);

    try {
      const response = await uploadService.uploadFile(
        selectedFile,
        recordDate,
        recordType
      );

      setResult(response);
      setSelectedFile(null);
      setPreview(null);
    } catch (err) {
      setError(err.detail || '上传失败，请重试');
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="upload-container">
      <h2>📤 上传化验单</h2>
      <p className="upload-description">
        上传宝宝的化验单图片或 PDF，系统将自动识别并提取健康指标
      </p>

      <div className="upload-form">
        <div className="form-group">
          <label htmlFor="record-date">记录日期</label>
          <input
            type="date"
            id="record-date"
            value={recordDate}
            onChange={(e) => setRecordDate(e.target.value)}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="record-type">记录类型</label>
          <select
            id="record-type"
            value={recordType}
            onChange={(e) => setRecordType(e.target.value)}
            className="form-select"
          >
            <option value="general">一般记录</option>
            <option value="blood_test">血液检测</option>
            <option value="urine_test">尿液检测</option>
            <option value="other">其他检测</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="file-upload" className="file-label">
            <span className="file-icon">📁</span>
            <span className="file-text">
              {selectedFile ? selectedFile.name : '点击选择文件'}
            </span>
            <span className="file-hint">支持 JPG, PNG, PDF 格式</span>
          </label>
          <input
            type="file"
            id="file-upload"
            accept=".jpg,.jpeg,.png,.pdf"
            onChange={handleFileSelect}
            className="file-input"
          />
        </div>

        {preview && (
          <div className="preview-container">
            <img src={preview} alt="预览" className="preview-image" />
          </div>
        )}

        {error && (
          <div className="error-message">
            ❌ {error}
          </div>
        )}

        {result && (
          <div className="result-container">
            <div className="success-message">
              ✅ {result.message}
            </div>
            <div className="extracted-text">
              <h4>识别结果：</h4>
              <pre>{result.extracted_text}</pre>
            </div>
            <button onClick={handleReset} className="btn btn-secondary">
              继续上传
            </button>
          </div>
        )}

        {!result && (
          <div className="button-group">
            <button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className="btn btn-primary"
            >
              {uploading ? '上传中...' : '上传并识别'}
            </button>
            {selectedFile && (
              <button onClick={handleReset} className="btn btn-secondary">
                取消
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Upload;

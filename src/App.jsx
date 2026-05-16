import React, { useState, useEffect } from 'react';
import Upload from './components/Upload';
import Chat from './components/Chat';
import { modelService } from './services/apiService';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('upload');
  const [systemStatus, setSystemStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSystemHealth();
  }, []);

  const checkSystemHealth = async () => {
    try {
      const status = await modelService.healthCheck();
      setSystemStatus(status);
    } catch (error) {
      console.error('健康检查失败:', error);
      setSystemStatus({
        status: 'error',
        message: '无法连接到后端服务'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>👶 宝宝健康档案 AI 助手</h1>
          <div className="status-badge">
            {loading ? (
              <span className="status-checking">检查中...</span>
            ) : systemStatus?.status === 'healthy' ? (
              <>
                <span className="status-dot online"></span>
                <span>系统正常</span>
                <span className="record-count">
                  档案数量: {systemStatus.services.chroma_db.total_records}
                </span>
              </>
            ) : (
              <>
                <span className="status-dot error"></span>
                <span>服务异常</span>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="disclaimer">
        ⚠️ <strong>免责声明：</strong>本系统提供的健康建议仅供参考，不能替代执业医师的诊断和治疗。
        如有健康疑虑，请及时咨询专业医生。
      </div>

      <nav className="tab-navigation">
        <button
          className={`tab-button ${activeTab === 'upload' ? 'active' : ''}`}
          onClick={() => setActiveTab('upload')}
        >
          📤 上传化验单
        </button>
        <button
          className={`tab-button ${activeTab === 'chat' ? 'active' : ''}`}
          onClick={() => setActiveTab('chat')}
        >
          💬 智能问答
        </button>
      </nav>

      <main className="app-content">
        {activeTab === 'upload' && <Upload />}
        {activeTab === 'chat' && <Chat />}
      </main>

      <footer className="app-footer">
        <p>宝宝健康档案 AI 系统 v1.0 | 本地部署 · 隐私保护</p>
        <div className="tech-stack">
          <span>React</span>
          <span>FastAPI</span>
          <span>PaddleOCR</span>
          <span>ChromaDB</span>
          <span>Ollama</span>
        </div>
      </footer>
    </div>
  );
}

export default App;

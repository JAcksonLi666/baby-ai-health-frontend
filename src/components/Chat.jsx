import React, { useState } from 'react';
import { chatService } from '../services/apiService';
import './Chat.css';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [useCloud, setUseCloud] = useState(false);
  const [error, setError] = useState(null);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);
    setError(null);

    try {
      const response = await chatService.askQuestion(inputMessage, useCloud);

      if (response.success) {
        const assistantMessage = {
          id: Date.now() + 1,
          role: 'assistant',
          content: response.answer,
          timestamp: new Date().toISOString(),
          sources: response.sources,
          modelUsed: response.model_used,
          cloudUsed: response.cloud_used,
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        setError('AI 回答失败，请稍后重试');
      }
    } catch (err) {
      setError(err.detail || '发送消息失败');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    setError(null);
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>💬 智能问答</h2>
        <div className="chat-options">
          <label className="cloud-toggle">
            <input
              type="checkbox"
              checked={useCloud}
              onChange={(e) => setUseCloud(e.target.checked)}
            />
            <span>使用云端模型</span>
          </label>
          <button onClick={handleClearChat} className="clear-btn">
            清空对话
          </button>
        </div>
      </div>

      <div className="chat-messages">
        {messages.length === 0 && !loading && (
          <div className="welcome-message">
            <div className="welcome-icon">👶</div>
            <h3>欢迎使用宝宝健康档案问答助手</h3>
            <p>
              您可以询问关于宝宝健康指标、发育情况等问题。
              <br />
              系统会根据您上传的历史档案提供个性化建议。
            </p>
            <div className="example-questions">
              <p>例如：</p>
              <ul>
                <li>宝宝的血红蛋白指标正常吗？</li>
                <li>最近几个月的体重变化趋势如何？</li>
                <li>白细胞偏高可能是什么原因？</li>
              </ul>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`message ${message.role === 'user' ? 'user-message' : 'assistant-message'}`}
          >
            <div className="message-avatar">
              {message.role === 'user' ? '👤' : '🤖'}
            </div>
            <div className="message-content">
              <div className="message-text">{message.content}</div>
              {message.role === 'assistant' && message.sources && message.sources.length > 0 && (
                <div className="message-sources">
                  <h4>📚 参考档案：</h4>
                  <ul>
                    {message.sources.map((source, index) => (
                      <li key={index}>
                        {source.date} - {source.type} (相关度: {(source.similarity * 100).toFixed(1)}%)
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {message.role === 'assistant' && (
                <div className="message-meta">
                  <span className="model-badge">
                    模型: {message.modelUsed}
                    {message.cloudUsed && ' ☁️'}
                  </span>
                  <span className="timestamp">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="message assistant-message">
            <div className="message-avatar">🤖</div>
            <div className="message-content">
              <div className="message-text loading">
                <span className="loading-dot">.</span>
                <span className="loading-dot">.</span>
                <span className="loading-dot">.</span>
                AI 正在思考中...
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="error-message">
            ❌ {error}
          </div>
        )}
      </div>

      <div className="chat-input-container">
        <textarea
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="输入您的问题..."
          className="chat-input"
          disabled={loading}
          rows={3}
        />
        <button
          onClick={handleSendMessage}
          disabled={!inputMessage.trim() || loading}
          className="send-btn"
        >
          {loading ? '发送中...' : '发送'}
        </button>
      </div>
    </div>
  );
};

export default Chat;

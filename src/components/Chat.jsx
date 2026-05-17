import React, { useState, useEffect } from 'react';
import { chatService, modelService } from '../services/apiService';
import './Chat.css';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [useCloud, setUseCloud] = useState(false);
  const [useStream, setUseStream] = useState(true);
  const [error, setError] = useState(null);
  const [availableModels, setAvailableModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState('auto');
  const [autoModelDesc, setAutoModelDesc] = useState('');
  const [modelsLoading, setModelsLoading] = useState(true);

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      const result = await modelService.getAvailableModels();
      if (result.success) {
        setAvailableModels(['auto', ...result.models]);
        setAutoModelDesc(result.auto_model || '');
      }
    } catch (err) {
      console.error('获取模型列表失败:', err);
    } finally {
      setModelsLoading(false);
    }
  };

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

    if (useStream) {
      handleStreamMessage(userMessage.id);
    } else {
      handleNormalMessage();
    }
  };

  const handleQuickQuestion = (question) => {
    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: question,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);
    setError(null);

    if (useStream) {
      handleStreamMessageDirect(question, userMessage.id);
    } else {
      handleNormalMessageDirect(question);
    }
  };

  const handleStreamMessageDirect = async (question, userMessageId) => {
    const assistantMessageId = Date.now() + 1;
    let fullResponse = '';

    const assistantMessage = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      sources: [],
      modelUsed: selectedModel === 'auto' ? autoModelDesc : selectedModel,
      cloudUsed: useCloud,
      isStreaming: true,
    };

    setMessages((prev) => [...prev, assistantMessage]);

    try {
      const eventSource = chatService.askQuestionStream(question, useCloud, 3, selectedModel);

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.error) {
            setError(data.error);
            eventSource.close();
            setLoading(false);
            return;
          }

          if (data.done) {
            eventSource.close();
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMessageId
                  ? { ...msg, isStreaming: false, followUpQuestions: generateFollowUpQuestions(question) }
                  : msg
              )
            );
            setLoading(false);
            return;
          }

          if (data.token) {
            fullResponse += data.token;
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMessageId
                  ? { ...msg, content: fullResponse }
                  : msg
              )
            );
          }
        } catch (parseError) {
          console.error('解析 SSE 数据失败:', parseError);
        }
      };

      eventSource.onerror = (err) => {
        console.error('SSE 连接错误:', err);
        eventSource.close();
        setError('连接中断，请稍后重试');
        setLoading(false);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? { ...msg, isStreaming: false }
              : msg
          )
        );
      };
    } catch (err) {
      setError(err.detail || '发送消息失败');
      setLoading(false);
    }
  };

  const handleNormalMessageDirect = async (question) => {
    try {
      const response = await chatService.askQuestion(question, useCloud, 3, selectedModel);

      if (response.success) {
        const assistantMessage = {
          id: Date.now() + 1,
          role: 'assistant',
          content: response.answer,
          timestamp: new Date().toISOString(),
          sources: response.sources,
          modelUsed: response.model_used,
          cloudUsed: response.cloud_used,
          isStreaming: false,
          followUpQuestions: generateFollowUpQuestions(question),
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

  const handleStreamMessage = async (userMessageId) => {
    const assistantMessageId = Date.now() + 1;
    let fullResponse = '';

    const assistantMessage = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      sources: [],
      modelUsed: selectedModel === 'auto' ? autoModelDesc : selectedModel,
      cloudUsed: useCloud,
      isStreaming: true,
    };

    setMessages((prev) => [...prev, assistantMessage]);

    try {
      const eventSource = chatService.askQuestionStream(inputMessage, useCloud, 3, selectedModel);

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.error) {
            setError(data.error);
            eventSource.close();
            setLoading(false);
            return;
          }

          if (data.done) {
            eventSource.close();
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMessageId
                  ? { ...msg, isStreaming: false, followUpQuestions: generateFollowUpQuestions(inputMessage) }
                  : msg
              )
            );
            setLoading(false);
            return;
          }

          if (data.token) {
            fullResponse += data.token;
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMessageId
                  ? { ...msg, content: fullResponse }
                  : msg
              )
            );
          }
        } catch (parseError) {
          console.error('解析 SSE 数据失败:', parseError);
        }
      };

      eventSource.onerror = (err) => {
        console.error('SSE 连接错误:', err);
        eventSource.close();
        setError('连接中断，请稍后重试');
        setLoading(false);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? { ...msg, isStreaming: false }
              : msg
          )
        );
      };
    } catch (err) {
      setError(err.detail || '发送消息失败');
      setLoading(false);
    }
  };

  const handleNormalMessage = async () => {
    try {
      const response = await chatService.askQuestion(inputMessage, useCloud, 3, selectedModel);

      if (response.success) {
        const assistantMessage = {
          id: Date.now() + 1,
          role: 'assistant',
          content: response.answer,
          timestamp: new Date().toISOString(),
          sources: response.sources,
          modelUsed: response.model_used,
          cloudUsed: response.cloud_used,
          isStreaming: false,
          followUpQuestions: generateFollowUpQuestions(inputMessage),
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

  const handleFeedback = (messageId, feedback) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId
          ? { ...msg, feedback: feedback }
          : msg
      )
    );
    
    console.log('反馈记录:', { messageId, feedback, timestamp: new Date().toISOString() });
  };

  const generateFollowUpQuestions = (question) => {
    const followUpMap = {
      '宝宝的血红蛋白指标正常吗？': [
        '正常的血红蛋白范围是多少？',
        '血红蛋白偏低怎么办？',
        '如何通过饮食改善血红蛋白水平？'
      ],
      '最近几个月的体重变化趋势如何？': [
        '宝宝的体重增长是否正常？',
        '如何帮助宝宝健康增重？',
        '体重增长过快怎么办？'
      ],
      '白细胞偏高可能是什么原因？': [
        '白细胞正常范围是多少？',
        '白细胞偏高需要治疗吗？',
        '如何预防白细胞异常？'
      ],
    };
    
    return followUpMap[question] || [
      '这个问题还有其他方面需要了解吗？',
      '您还有其他相关问题吗？',
      '需要我解释更多细节吗？'
    ];
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>💬 智能问答</h2>
        <div className="chat-options">
          <label className="model-selector">
            <span>模型:</span>
            {modelsLoading ? (
              <span>加载中...</span>
            ) : (
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                disabled={loading}
              >
                {availableModels.map((model) => (
                  <option key={model} value={model}>
                    {model === 'auto' ? `Auto (${autoModelDesc || '加载中...'})` : model}
                  </option>
                ))}
              </select>
            )}
          </label>
          <label className="cloud-toggle">
            <input
              type="checkbox"
              checked={useCloud}
              onChange={(e) => setUseCloud(e.target.checked)}
            />
            <span>云端</span>
          </label>
          <label className="stream-toggle">
            <input
              type="checkbox"
              checked={useStream}
              onChange={(e) => setUseStream(e.target.checked)}
            />
            <span>流式</span>
          </label>
          <button onClick={handleClearChat} className="clear-btn">
            清空
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
              <p>快速提问：</p>
              <ul>
                <li onClick={() => handleQuickQuestion('宝宝的血红蛋白指标正常吗？')}>宝宝的血红蛋白指标正常吗？</li>
                <li onClick={() => handleQuickQuestion('最近几个月的体重变化趋势如何？')}>最近几个月的体重变化趋势如何？</li>
                <li onClick={() => handleQuickQuestion('白细胞偏高可能是什么原因？')}>白细胞偏高可能是什么原因？</li>
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
              {message.role === 'assistant' && message.isStreaming && !message.content ? (
                <div className="message-text loading">
                  <span className="loading-dot">.</span>
                  <span className="loading-dot">.</span>
                  <span className="loading-dot">.</span>
                  AI 正在思考中...
                </div>
              ) : (
                <div className="message-text">{message.content}</div>
              )}
              {message.role === 'assistant' && message.sources && message.sources.length > 0 && !message.isStreaming && (
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
              {message.role === 'assistant' && !message.isStreaming && (
                <>
                  {message.followUpQuestions && message.followUpQuestions.length > 0 && (
                    <div className="follow-up-questions">
                      <h4>💡 拓展问答：</h4>
                      <div className="follow-up-list">
                        {message.followUpQuestions.map((question, index) => (
                          <button
                            key={index}
                            className="follow-up-btn"
                            onClick={() => handleQuickQuestion(question)}
                          >
                            {question}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="feedback-section">
                    <span className="feedback-label">本次回答是否有帮助？</span>
                    <div className="feedback-buttons">
                      <button
                        className={`feedback-btn helpful-btn ${message.feedback === 'helpful' ? 'active' : ''}`}
                        onClick={() => handleFeedback(message.id, 'helpful')}
                        disabled={message.feedback !== undefined}
                      >
                        👍 有用
                      </button>
                      <button
                        className={`feedback-btn unhelpful-btn ${message.feedback === 'unhelpful' ? 'active' : ''}`}
                        onClick={() => handleFeedback(message.id, 'unhelpful')}
                        disabled={message.feedback !== undefined}
                      >
                        👎 无用
                      </button>
                    </div>
                    {message.feedback && (
                      <span className="feedback-thanks">感谢您的反馈！</span>
                    )}
                  </div>
                </>
              )}
              {message.role === 'assistant' && (
                <div className="message-meta">
                  <span className="model-badge">
                    模型: {message.modelUsed}
                    {message.cloudUsed && ' ☁️'}
                    {message.isStreaming && ' 🔄'}
                  </span>
                  <span className="timestamp">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}

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
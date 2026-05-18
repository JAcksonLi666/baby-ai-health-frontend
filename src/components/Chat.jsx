import React, { useState, useEffect, useRef } from 'react';
import {
  Card, Input, Button, Select, Switch, message, Spin,
  Avatar, Tag, Divider
} from 'antd';
import {
  SendOutlined, SyncOutlined, RobotOutlined, UserOutlined, LikeOutlined, DislikeOutlined, MessageOutlined
} from '@ant-design/icons';
import moment from 'moment';
import { chatService, modelService } from '../services/apiService';
import './Chat.css';

const { TextArea } = Input;

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
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchModels();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
      timestamp: moment().toISOString(),
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
      timestamp: moment().toISOString(),
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
      timestamp: moment().toISOString(),
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
          timestamp: moment().toISOString(),
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
      timestamp: moment().toISOString(),
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
          timestamp: moment().toISOString(),
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
    message.info('聊天已清空');
  };

  const handleFeedback = (messageId, feedback) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId
          ? { ...msg, feedback: feedback }
          : msg
      )
    );
    
    if (feedback === 'helpful') {
      message.success('感谢您的反馈！');
    } else {
      message.info('感谢您的反馈，我们会继续改进');
    }
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
    <Card className="chat-card" bordered={false}>
      {/* 头部 */}
      <div className="chat-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <MessageOutlined style={{ fontSize: 24 }} />
          <h2>智能问答</h2>
        </div>
        <div className="chat-options">
          <Select
            value={selectedModel}
            onChange={(value) => setSelectedModel(value)}
            disabled={loading || modelsLoading}
            placeholder="选择模型"
            style={{ width: 200 }}
          >
            {availableModels.map((model) => (
              <Select.Option key={model} value={model}>
                {model === 'auto' ? `Auto (${autoModelDesc || '加载中...'})` : model}
              </Select.Option>
            ))}
          </Select>
          <Switch
            checked={useCloud}
            onChange={(checked) => setUseCloud(checked)}
            checkedChildren="云端"
            unCheckedChildren="本地"
          />
          <Switch
            checked={useStream}
            onChange={(checked) => setUseStream(checked)}
            checkedChildren="流式"
            unCheckedChildren="普通"
          />
          <Button
            icon={<SyncOutlined />}
            onClick={handleClearChat}
            disabled={loading}
          >
            清空
          </Button>
        </div>
      </div>

      {/* 消息区域 */}
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
              <p style={{ fontWeight: 600 }}>快速提问：</p>
              <div className="quick-questions">
                <Button
                  onClick={() => handleQuickQuestion('宝宝的血红蛋白指标正常吗？')}
                  className="quick-question-btn"
                >
                  宝宝的血红蛋白指标正常吗？
                </Button>
                <Button
                  onClick={() => handleQuickQuestion('最近几个月的体重变化趋势如何？')}
                  className="quick-question-btn"
                >
                  最近几个月的体重变化趋势如何？
                </Button>
                <Button
                  onClick={() => handleQuickQuestion('白细胞偏高可能是什么原因？')}
                  className="quick-question-btn"
                >
                  白细胞偏高可能是什么原因？
                </Button>
              </div>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`message ${message.role === 'user' ? 'user-message' : 'assistant-message'}`}
          >
            <Avatar
              icon={message.role === 'user' ? <UserOutlined /> : <RobotOutlined />}
              className="message-avatar"
            />
            <div className="message-content">
              {message.role === 'assistant' && message.isStreaming && !message.content ? (
                <div className="message-text loading">
                  <Spin size="small" />
                  AI 正在思考中...
                </div>
              ) : (
                <div className="message-text">{message.content}</div>
              )}
              {message.role === 'assistant' && message.sources && message.sources.length > 0 && !message.isStreaming && (
                <div className="message-sources">
                  <div style={{ fontWeight: 600, marginBottom: 8 }}>📚 参考档案：</div>
                  <div className="sources-list">
                    {message.sources.map((source, index) => (
                      <Tag key={index} color="blue">
                        {source.date} - {source.type} (相关度: {(source.similarity * 100).toFixed(1)}%)
                      </Tag>
                    ))}
                  </div>
                </div>
              )}
              {message.role === 'assistant' && !message.isStreaming && (
                <>
                  {message.followUpQuestions && message.followUpQuestions.length > 0 && (
                    <div className="follow-up-questions">
                      <div style={{ fontWeight: 600, marginBottom: 8 }}>💡 拓展问答：</div>
                      <div className="follow-up-list">
                        {message.followUpQuestions.map((question, index) => (
                          <Button
                            key={index}
                            className="follow-up-btn"
                            onClick={() => handleQuickQuestion(question)}
                          >
                            {question}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="feedback-section">
                    <span className="feedback-label">本次回答是否有帮助？</span>
                    <div className="feedback-buttons">
                      <Button
                        icon={<LikeOutlined />}
                        className={`feedback-btn ${message.feedback === 'helpful' ? 'helpful' : ''}`}
                        onClick={() => handleFeedback(message.id, 'helpful')}
                        disabled={message.feedback !== undefined}
                        size="small"
                      >
                        有用
                      </Button>
                      <Button
                        icon={<DislikeOutlined />}
                        className={`feedback-btn ${message.feedback === 'unhelpful' ? 'unhelpful' : ''}`}
                        onClick={() => handleFeedback(message.id, 'unhelpful')}
                        disabled={message.feedback !== undefined}
                        size="small"
                      >
                        无用
                      </Button>
                    </div>
                  </div>
                </>
              )}
              {message.role === 'assistant' && (
                <div className="message-meta">
                  <Tag color="gray" size="small">
                    模型: {message.modelUsed}
                    {message.cloudUsed && ' ☁️'}
                    {message.isStreaming && ' 🔄'}
                  </Tag>
                  <span className="timestamp">
                    {moment(message.timestamp).format('HH:mm:ss')}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 输入区域 */}
      <div className="chat-input-container">
        <TextArea
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="输入您的问题..."
          disabled={loading}
          rows={3}
          className="chat-input"
        />
        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={handleSendMessage}
          disabled={!inputMessage.trim() || loading}
          className="send-btn"
        >
          {loading ? '发送中...' : '发送'}
        </Button>
      </div>
    </Card>
  );
};

export default Chat;

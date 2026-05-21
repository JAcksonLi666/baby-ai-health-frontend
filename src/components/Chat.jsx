import React, { useState, useEffect, useRef } from 'react';
import {
  Card, Input, Button, Select, Switch, message, Spin,
  Avatar, Tag, Divider
} from 'antd';
import {
  SendOutlined, SyncOutlined, RobotOutlined, UserOutlined, LikeOutlined, DislikeOutlined, MessageOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { chatService, modelService } from '../services/apiService';
import './Chat.css';

const { TextArea } = Input;

const Chat = () => {
  const { t } = useTranslation();
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
      timestamp: dayjs().toISOString(),
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
      timestamp: dayjs().toISOString(),
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
      timestamp: dayjs().toISOString(),
      sources: [],
      modelUsed: selectedModel === 'auto' ? autoModelDesc : selectedModel,
      cloudUsed: useCloud,
      isStreaming: true,
    };

    setMessages((prev) => [...prev, assistantMessage]);

    console.log('===== AI 流式响应详情 =====');
    console.log('请求参数 - useCloud:', useCloud);
    console.log('请求参数 - selectedModel:', selectedModel);
    console.log('请求参数 - question:', question);
    console.log('预期响应来源:', useCloud ? '🟢 远程大模型 (蚂蚁百灵)' : '🔵 本地模型 (Ollama)');
    console.log('========================');

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
        setError(t('chat.connectionError'));
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
      setError(err.detail || t('chat.sendError'));
      setLoading(false);
    }
  };

  const handleNormalMessageDirect = async (question) => {
    try {
      const response = await chatService.askQuestion(question, useCloud, 3, selectedModel);

      console.log('===== AI 响应详情 =====');
      console.log('是否使用云端大模型:', response.cloud_used);
      console.log('使用的模型:', response.model_used);
      console.log('请求参数 - useCloud:', useCloud);
      console.log('请求参数 - selectedModel:', selectedModel);
      console.log('请求参数 - question:', question);
      console.log('响应成功:', response.success);
      console.log('响应来源:', response.cloud_used ? '🟢 远程大模型 (蚂蚁百灵)' : '🔵 本地模型 (Ollama)');
      if (response.sources && response.sources.length > 0) {
        console.log('参考来源数量:', response.sources.length);
        console.log('参考来源:', response.sources);
      }
      console.log('========================');

      if (response.success) {
        const assistantMessage = {
          id: Date.now() + 1,
          role: 'assistant',
          content: response.answer,
          timestamp: dayjs().toISOString(),
          sources: response.sources,
          modelUsed: response.model_used,
          cloudUsed: response.cloud_used,
          isStreaming: false,
          followUpQuestions: generateFollowUpQuestions(question),
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        setError(t('chat.aiError'));
      }
    } catch (err) {
      setError(err.detail || t('chat.sendError'));
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
      timestamp: dayjs().toISOString(),
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
        setError(t('chat.connectionError'));
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
      setError(err.detail || t('chat.sendError'));
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
          timestamp: dayjs().toISOString(),
          sources: response.sources,
          modelUsed: response.model_used,
          cloudUsed: response.cloud_used,
          isStreaming: false,
          followUpQuestions: generateFollowUpQuestions(inputMessage),
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        setError(t('chat.aiError'));
      }
    } catch (err) {
      setError(err.detail || t('chat.sendError'));
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
    message.info(t('chat.clear'));
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
      message.success(t('chat.feedbackHelpful'));
    } else {
      message.info(t('chat.feedbackUnhelpful'));
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
      'Is my baby\'s hemoglobin level normal?': [
        'What is the normal hemoglobin range?',
        'What to do if hemoglobin is low?',
        'How to improve hemoglobin through diet?'
      ],
      'What is the weight change trend in recent months?': [
        'Is my baby\'s weight gain normal?',
        'How to help my baby gain weight healthily?',
        'What to do if weight gain is too fast?'
      ],
      'What might cause high white blood cell count?': [
        'What is the normal white blood cell range?',
        'Does high white blood cell count need treatment?',
        'How to prevent abnormal white blood cell count?'
      ],
    };
    
    return followUpMap[question] || [
      t('chat.followUp1'),
      t('chat.followUp2'),
      t('chat.followUp3')
    ];
  };

  return (
    <Card className="chat-card" variant="outlined">
      {/* 头部 */}
      <div className="chat-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <MessageOutlined style={{ fontSize: 24 }} />
          <h2>{t('chat.title')}</h2>
        </div>
        <div className="chat-options">
          <Select
            value={selectedModel}
            onChange={(value) => setSelectedModel(value)}
            disabled={loading || modelsLoading}
            placeholder={t('chat.selectModel')}
            style={{ width: 200 }}
          >
            {availableModels.map((model) => (
              <Select.Option key={model} value={model}>
                {model === 'auto' ? `Auto (${autoModelDesc || t('chat.loading')})` : model}
              </Select.Option>
            ))}
          </Select>
          <Switch
            checked={useCloud}
            onChange={(checked) => setUseCloud(checked)}
            checkedChildren={t('chat.cloud')}
            unCheckedChildren={t('chat.local')}
          />
          <Switch
            checked={useStream}
            onChange={(checked) => setUseStream(checked)}
            checkedChildren={t('chat.stream')}
            unCheckedChildren={t('chat.normal')}
          />
          <Button
            icon={<SyncOutlined />}
            onClick={handleClearChat}
            disabled={loading}
          >
            {t('chat.clear')}
          </Button>
        </div>
      </div>

      {/* 消息区域 */}
      <div className="chat-messages">
        {messages.length === 0 && !loading && (
          <div className="welcome-message">
            <div className="welcome-icon">👶</div>
            <h3>{t('chat.welcome')}</h3>
            <p>{t('chat.welcomeDescription')}</p>
            <div className="example-questions">
              <p style={{ fontWeight: 600 }}>{t('chat.quickQuestions')}</p>
              <div className="quick-questions">
                <Button
                  onClick={() => handleQuickQuestion(t('chat.quickQ1'))}
                  className="quick-question-btn"
                >
                  {t('chat.quickQ1')}
                </Button>
                <Button
                  onClick={() => handleQuickQuestion(t('chat.quickQ2'))}
                  className="quick-question-btn"
                >
                  {t('chat.quickQ2')}
                </Button>
                <Button
                  onClick={() => handleQuickQuestion(t('chat.quickQ3'))}
                  className="quick-question-btn"
                >
                  {t('chat.quickQ3')}
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
                  {t('chat.thinking')}
                </div>
              ) : (
                <div className="message-text">{message.content}</div>
              )}
              {message.role === 'assistant' && message.sources && message.sources.length > 0 && !message.isStreaming && (
                <div className="message-sources">
                  <div style={{ fontWeight: 600, marginBottom: 8 }}>📚 {t('chat.sources')}：</div>
                  <div className="sources-list">
                    {message.sources.map((source, index) => (
                      <Tag key={index} color="blue">
                        {source.date} - {source.type} ({t('chat.relevance')}: {(source.similarity * 100).toFixed(1)}%)
                      </Tag>
                    ))}
                  </div>
                </div>
              )}
              {message.role === 'assistant' && !message.isStreaming && (
                <>
                  {message.followUpQuestions && message.followUpQuestions.length > 0 && (
                    <div className="follow-up-questions">
                      <div style={{ fontWeight: 600, marginBottom: 8 }}>💡 {t('chat.followUp')}：</div>
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
                    <span className="feedback-label">{t('chat.feedback')}</span>
                    <div className="feedback-buttons">
                      <Button
                        icon={<LikeOutlined />}
                        className={`feedback-btn ${message.feedback === 'helpful' ? 'helpful' : ''}`}
                        onClick={() => handleFeedback(message.id, 'helpful')}
                        disabled={message.feedback !== undefined}
                        size="small"
                      >
                        {t('chat.helpful')}
                      </Button>
                      <Button
                        icon={<DislikeOutlined />}
                        className={`feedback-btn ${message.feedback === 'unhelpful' ? 'unhelpful' : ''}`}
                        onClick={() => handleFeedback(message.id, 'unhelpful')}
                        disabled={message.feedback !== undefined}
                        size="small"
                      >
                        {t('chat.unhelpful')}
                      </Button>
                    </div>
                  </div>
                </>
              )}
              {message.timestamp && (
                <div className="message-meta">
                  {message.modelUsed && (
                    <span className="model-badge">
                      {t('chat.model')}: {message.modelUsed}
                    </span>
                  )}
                  <span className="timestamp">
                    {dayjs(message.timestamp).format('HH:mm:ss')}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* 输入区域 */}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="chat-input-container">
        <TextArea
          className="chat-input"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={t('chat.placeholder')}
          rows={3}
          disabled={loading}
        />
        <Button
          icon={<SendOutlined />}
          onClick={handleSendMessage}
          disabled={loading || !inputMessage.trim()}
          type="primary"
          size="large"
        >
          {loading ? t('chat.sending') : t('chat.send')}
        </Button>
      </div>
    </Card>
  );
};

export default Chat;

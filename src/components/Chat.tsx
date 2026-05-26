import React, { useState, useEffect, useRef } from 'react';
import {
  Card, Input, Button, Select, Switch, message, Spin,
  Avatar, Tag
} from 'antd';
import {
  SendOutlined, SyncOutlined, RobotOutlined, UserOutlined, LikeOutlined, DislikeOutlined, MessageOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { chatService, modelService } from '../services';
import './Chat.css';

const { TextArea } = Input;

interface MessageSource {
  date: string;
  type: string;
  similarity: number;
}

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  sources?: MessageSource[];
  modelUsed?: string;
  cloudUsed?: boolean;
  isStreaming?: boolean;
  followUpQuestions?: string[];
  feedback?: string;
}

const Chat = () => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [useCloud, setUseCloud] = useState<boolean>(false);
  const [useStream, setUseStream] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('auto');
  const [autoModelDesc, setAutoModelDesc] = useState<string>('');
  const [modelsLoading, setModelsLoading] = useState<boolean>(true);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

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

  const generateFollowUpQuestions = (question: string): string[] => {
    const followUpMap: Record<string, string[]> = {
      [t('chat.quickQ1')]: [
        t('chat.followUp1'),
        t('chat.followUp2'),
        t('chat.followUp3')
      ],
      [t('chat.quickQ2')]: [
        t('chat.followUp1'),
        t('chat.followUp2'),
        t('chat.followUp3')
      ],
      [t('chat.quickQ3')]: [
        t('chat.followUp1'),
        t('chat.followUp2'),
        t('chat.followUp3')
      ],
    };

    return followUpMap[question] || [
      t('chat.followUp1'),
      t('chat.followUp2'),
      t('chat.followUp3')
    ];
  };

  const handleStreamMessage = async (question: string, userMessageId: number) => {
    const assistantMessageId = Date.now() + 1;
    let fullResponse = '';

    const assistantMessage: Message = {
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
    } catch (err: any) {
      setError(err.detail || t('chat.sendError'));
      setLoading(false);
    }
  };

  const handleNormalMessage = async (question: string) => {
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
        const assistantMessage: Message = {
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
    } catch (err: any) {
      setError(err.detail || t('chat.sendError'));
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = (question: string) => {
    const userMessage: Message = {
      id: Date.now(),
      role: 'user',
      content: question,
      timestamp: dayjs().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);
    setError(null);

    if (useStream) {
      handleStreamMessage(question, userMessage.id);
    } else {
      handleNormalMessage(question);
    }
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    const question = inputMessage;
    setInputMessage('');
    sendMessage(question);
  };

  const handleQuickQuestion = (question: string) => {
    sendMessage(question);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
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

  const handleFeedback = (messageId: number, feedback: string) => {
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

  return (
    <Card className="chat-card" variant="outlined">
      <div className="chat-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <MessageOutlined style={{ fontSize: 24 }} />
          <h2>{t('chat.title')}</h2>
        </div>
        <div className="chat-options">
          <Select
            value={selectedModel}
            onChange={(value: string) => setSelectedModel(value)}
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
            onChange={(checked: boolean) => setUseCloud(checked)}
            checkedChildren={t('chat.cloud')}
            unCheckedChildren={t('chat.local')}
          />
          <Switch
            checked={useStream}
            onChange={(checked: boolean) => setUseStream(checked)}
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

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`message ${msg.role === 'user' ? 'user-message' : 'assistant-message'}`}
          >
            <Avatar
              icon={msg.role === 'user' ? <UserOutlined /> : <RobotOutlined />}
              className="message-avatar"
            />
            <div className="message-content">
              {msg.role === 'assistant' && msg.isStreaming && !msg.content ? (
                <div className="message-text loading">
                  <Spin size="small" />
                  {t('chat.thinking')}
                </div>
              ) : (
                <div className="message-text">{msg.content}</div>
              )}
              {msg.role === 'assistant' && msg.sources && msg.sources.length > 0 && !msg.isStreaming && (
                <div className="message-sources">
                  <div style={{ fontWeight: 600, marginBottom: 8 }}>📚 {t('chat.sources')}：</div>
                  <div className="sources-list">
                    {msg.sources.map((source, index) => (
                      <Tag key={index} color="blue">
                        {source.date} - {source.type} ({t('chat.relevance')}: {(source.similarity * 100).toFixed(1)}%)
                      </Tag>
                    ))}
                  </div>
                </div>
              )}
              {msg.role === 'assistant' && !msg.isStreaming && (
                <>
                  {msg.followUpQuestions && msg.followUpQuestions.length > 0 && (
                    <div className="follow-up-questions">
                      <div style={{ fontWeight: 600, marginBottom: 8 }}>💡 {t('chat.followUp')}：</div>
                      <div className="follow-up-list">
                        {msg.followUpQuestions.map((question, index) => (
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
                        className={`feedback-btn ${msg.feedback === 'helpful' ? 'helpful' : ''}`}
                        onClick={() => handleFeedback(msg.id, 'helpful')}
                        disabled={msg.feedback !== undefined}
                        size="small"
                      >
                        {t('chat.helpful')}
                      </Button>
                      <Button
                        icon={<DislikeOutlined />}
                        className={`feedback-btn ${msg.feedback === 'unhelpful' ? 'unhelpful' : ''}`}
                        onClick={() => handleFeedback(msg.id, 'unhelpful')}
                        disabled={msg.feedback !== undefined}
                        size="small"
                      >
                        {t('chat.unhelpful')}
                      </Button>
                    </div>
                  </div>
                </>
              )}
              {msg.timestamp && (
                <div className="message-meta">
                  {msg.modelUsed && (
                    <span className="model-badge">
                      {t('chat.model')}: {msg.modelUsed}
                    </span>
                  )}
                  <span className="timestamp">
                    {dayjs(msg.timestamp).format('HH:mm:ss')}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

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
          onKeyDown={handleKeyDown}
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

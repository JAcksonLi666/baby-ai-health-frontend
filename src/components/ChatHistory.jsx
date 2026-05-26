import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Card,
  List,
  Button,
  Popconfirm,
  Empty,
  Typography,
  Avatar,
  Space,
  Row,
  Col,
  message,
  Spin,
} from 'antd';
import {
  HistoryOutlined,
  PlusOutlined,
  DeleteOutlined,
  UserOutlined,
  RobotOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';
import { chatHistoryService } from '../services';

// Initialize dayjs plugins
dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

const { Title, Text } = Typography;

const ChatHistory = () => {
  const { t } = useTranslation();
  const [sessions, setSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);

  // Fetch all chat sessions
  const fetchSessions = useCallback(async () => {
    setSessionsLoading(true);
    try {
      const res = await chatHistoryService.listSessions();
      if (res.success) {
        setSessions(res.data?.sessions || res.sessions || []);
      } else {
        message.error(res.message || t('chatHistory.loadError'));
      }
    } catch {
      message.error(t('chatHistory.loadError'));
    } finally {
      setSessionsLoading(false);
    }
  }, [t]);

  // Fetch messages for a specific session
  const fetchMessages = useCallback(async (sessionId) => {
    if (!sessionId) return;
    setMessagesLoading(true);
    try {
      const res = await chatHistoryService.getSessionMessages(sessionId);
      if (res.success) {
        setMessages(res.data?.messages || res.messages || []);
      } else {
        message.error(res.message || t('chatHistory.loadMessagesError'));
      }
    } catch {
      message.error(t('chatHistory.loadMessagesError'));
    } finally {
      setMessagesLoading(false);
    }
  }, [t]);

  // Load sessions on mount
  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // Load messages when session selection changes
  useEffect(() => {
    if (selectedSessionId) {
      fetchMessages(selectedSessionId);
    } else {
      setMessages([]);
    }
  }, [selectedSessionId, fetchMessages]);

  // Create a new chat session
  const handleCreateSession = useCallback(async () => {
    try {
      const res = await chatHistoryService.createSession({
        title: `${t('chatHistory.title')} ${dayjs().format('MM-DD HH:mm')}`,
      });
      if (res.success) {
        message.success(t('chatHistory.createSuccess'));
        await fetchSessions();
        const newSession = res.data?.session || res.session;
        if (newSession?.id) {
          setSelectedSessionId(newSession.id);
        }
      } else {
        message.error(res.message || t('chatHistory.createError'));
      }
    } catch {
      message.error(t('chatHistory.createError'));
    }
  }, [fetchSessions, t]);

  // Delete a chat session
  const handleDeleteSession = useCallback(
    async (sessionId) => {
      try {
        const res = await chatHistoryService.deleteSession(sessionId);
        if (res.success) {
          message.success(t('chatHistory.deleteSuccess'));
          if (selectedSessionId === sessionId) {
            setSelectedSessionId(null);
            setMessages([]);
          }
          await fetchSessions();
        } else {
          message.error(res.message || t('chatHistory.deleteError'));
        }
      } catch {
        message.error(t('chatHistory.deleteError'));
      }
    },
    [selectedSessionId, fetchSessions, t]
  );

  // Get the selected session object
  const selectedSession = sessions.find((s) => s.id === selectedSessionId);

  return (
    <div>
      <Row gutter={16}>
        {/* Left panel: session list */}
        <Col xs={24} lg={8}>
          <Card
            title={
              <Space>
                <HistoryOutlined />
                <span>{t('chatHistory.title')}</span>
              </Space>
            }
            extra={
              <Button
                type="primary"
                size="small"
                icon={<PlusOutlined />}
                onClick={handleCreateSession}
              >
                {t('chatHistory.newChat')}
              </Button>
            }
          >
            <Spin spinning={sessionsLoading}>
              {sessions.length === 0 ? (
                <Empty
                  description={t('chatHistory.noSessions')}
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              ) : (
                <List
                  dataSource={sessions}
                  renderItem={(session) => (
                    <List.Item
                      key={session.id}
                      onClick={() => setSelectedSessionId(session.id)}
                      style={{
                        cursor: 'pointer',
                        padding: '8px 12px',
                        borderRadius: 8,
                        marginBottom: 4,
                        backgroundColor:
                          selectedSessionId === session.id
                            ? '#e6f4ff'
                            : 'transparent',
                        border:
                          selectedSessionId === session.id
                            ? '1px solid #91caff'
                            : '1px solid transparent',
                      }}
                      actions={[
                        <Popconfirm
                          key="delete"
                          title={t('chatHistory.deleteConfirm')}
                          description={t('chatHistory.deleteWarning')}
                          onConfirm={(e) => {
                            e?.stopPropagation();
                            handleDeleteSession(session.id);
                          }}
                          onCancel={(e) => e?.stopPropagation()}
                        >
                          <Button
                            type="text"
                            danger
                            size="small"
                            icon={<DeleteOutlined />}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </Popconfirm>,
                      ]}
                    >
                      <List.Item.Meta
                        avatar={
                          <Avatar
                            size="small"
                            icon={<HistoryOutlined />}
                            style={{
                              backgroundColor:
                                selectedSessionId === session.id
                                  ? '#1677ff'
                                  : '#d9d9d9',
                            }}
                          />
                        }
                        title={
                          <Text
                            ellipsis
                            style={{ maxWidth: 150 }}
                            strong={selectedSessionId === session.id}
                          >
                            {session.title || t('chatHistory.unnamed')}
                          </Text>
                        }
                        description={
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {session.updated_at
                              ? dayjs(session.updated_at).fromNow()
                              : session.created_at
                                ? dayjs(session.created_at).fromNow()
                                : ''}
                          </Text>
                        }
                      />
                    </List.Item>
                  )}
                />
              )}
            </Spin>
          </Card>
        </Col>

        {/* Right panel: message history */}
        <Col xs={24} lg={16}>
          <Card
            title={
              selectedSession
                ? selectedSession.title || t('chatHistory.unnamed')
                : t('chatHistory.selectHint')
            }
            extra={
              selectedSession && (
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {selectedSession.created_at
                    ? dayjs(selectedSession.created_at).format(
                        'YYYY-MM-DD HH:mm'
                      )
                    : ''}
                </Text>
              )
            }
          >
            <Spin spinning={messagesLoading}>
              {!selectedSession ? (
                <Empty
                  description={t('chatHistory.selectHint')}
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              ) : messages.length === 0 ? (
                <Empty
                  description={t('chatHistory.noMessages')}
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              ) : (
                <div
                  style={{
                    maxHeight: 600,
                    overflowY: 'auto',
                    padding: '8px 0',
                  }}
                >
                  {messages.map((msg, index) => {
                    const isUser = msg.role === 'user';
                    return (
                      <div
                        key={msg.id || `msg-${index}`}
                        style={{
                          display: 'flex',
                          justifyContent: isUser ? 'flex-end' : 'flex-start',
                          marginBottom: 16,
                        }}
                      >
                        {/* AI avatar on the left */}
                        {!isUser && (
                          <Avatar
                            icon={<RobotOutlined />}
                            style={{
                              backgroundColor: '#f0f0f0',
                              color: '#666',
                              marginRight: 8,
                              flexShrink: 0,
                            }}
                          />
                        )}

                        {/* Message bubble */}
                        <div
                          style={{
                            maxWidth: '70%',
                            padding: '10px 14px',
                            borderRadius: isUser ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                            backgroundColor: isUser ? '#1677ff' : '#f5f5f5',
                            color: isUser ? '#fff' : '#333',
                            wordBreak: 'break-word',
                          }}
                        >
                          <div style={{ whiteSpace: 'pre-wrap' }}>
                            {msg.content}
                          </div>
                          {msg.created_at && (
                            <div
                              style={{
                                fontSize: 11,
                                marginTop: 4,
                                textAlign: 'right',
                                opacity: 0.7,
                              }}
                            >
                              {dayjs(msg.created_at).format('HH:mm')}
                            </div>
                          )}
                        </div>

                        {/* User avatar on the right */}
                        {isUser && (
                          <Avatar
                            icon={<UserOutlined />}
                            style={{
                              backgroundColor: '#1677ff',
                              marginLeft: 8,
                              flexShrink: 0,
                            }}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </Spin>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ChatHistory;

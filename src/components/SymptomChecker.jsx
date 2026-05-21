import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  List,
  Checkbox,
  Tag,
  Button,
  InputNumber,
  Alert,
  Row,
  Col,
  Typography,
  Space,
  message,
  Spin,
  Collapse,
} from 'antd';
import {
  HeartOutlined,
  SearchOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { symptomService } from '../services/apiService';

const { Title, Text, Paragraph } = Typography;

// Default symptom categories with their specific symptoms
const DEFAULT_CATEGORIES = [
  {
    key: 'fever',
    name: '发热',
    symptoms: [
      { key: 'high_fever', label: '高热（>39°C）' },
      { key: 'low_fever', label: '低热（37.3-38°C）' },
      { key: 'persistent_fever', label: '持续发热超过3天' },
      { key: 'fever_with_rash', label: '发热伴皮疹' },
      { key: 'fever_with_seizure', label: '发热伴惊厥' },
    ],
  },
  {
    key: 'respiratory',
    name: '呼吸系统',
    symptoms: [
      { key: 'cough', label: '咳嗽' },
      { key: 'nasal_congestion', label: '鼻塞' },
      { key: 'runny_nose', label: '流鼻涕' },
      { key: 'wheezing', label: '喘息' },
      { key: 'difficulty_breathing', label: '呼吸困难' },
      { key: 'sneezing', label: '打喷嚏' },
    ],
  },
  {
    key: 'digestive',
    name: '消化系统',
    symptoms: [
      { key: 'vomiting', label: '呕吐' },
      { key: 'diarrhea', label: '腹泻' },
      { key: 'constipation', label: '便秘' },
      { key: 'abdominal_distension', label: '腹胀' },
      { key: 'poor_appetite', label: '食欲不振' },
      { key: 'blood_in_stool', label: '便血' },
    ],
  },
  {
    key: 'skin',
    name: '皮肤',
    symptoms: [
      { key: 'rash', label: '皮疹' },
      { key: 'eczema', label: '湿疹' },
      { key: 'dry_skin', label: '皮肤干燥' },
      { key: 'jaundice', label: '黄疸' },
      { key: 'diaper_rash', label: '尿布疹' },
      { key: 'excessive_sweating', label: '多汗' },
    ],
  },
  {
    key: 'sleep',
    name: '睡眠',
    symptoms: [
      { key: 'difficulty_falling_asleep', label: '入睡困难' },
      { key: 'frequent_waking', label: '频繁夜醒' },
      { key: 'night_terrors', label: '夜惊' },
      { key: 'excessive_sleepiness', label: '嗜睡' },
      { key: 'irregular_sleep', label: '睡眠不规律' },
    ],
  },
  {
    key: 'oral',
    name: '口腔',
    symptoms: [
      { key: 'thrush', label: '鹅口疮' },
      { key: 'teething_discomfort', label: '出牙不适' },
      { key: 'drooling', label: '流口水过多' },
      { key: 'mouth_ulcer', label: '口腔溃疡' },
      { key: 'bad_breath', label: '口臭' },
    ],
  },
  {
    key: 'eye',
    name: '眼部',
    symptoms: [
      { key: 'red_eye', label: '眼红' },
      { key: 'excessive_tearing', label: '流泪过多' },
      { key: 'eye_discharge', label: '眼部分泌物' },
      { key: 'eye_rubbing', label: '频繁揉眼' },
    ],
  },
  {
    key: 'ear',
    name: '耳部',
    symptoms: [
      { key: 'ear_pulling', label: '频繁抓耳' },
      { key: 'ear_discharge', label: '耳部分泌物' },
      { key: 'ear_infection', label: '耳部感染' },
      { key: 'hearing_concern', label: '听力异常' },
    ],
  },
];

// Severity level color mapping
const SEVERITY_CONFIG = {
  mild: { color: 'green', text: '轻微' },
  moderate: { color: 'orange', text: '中等' },
  severe: { color: 'red', text: '严重' },
};

const SymptomChecker = () => {
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [monthAge, setMonthAge] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  // Fetch symptom categories from API on mount
  const fetchCategories = useCallback(async () => {
    try {
      const res = await symptomService.getCategories();
      if (res.success && res.data?.categories) {
        setCategories(res.data.categories);
      }
    } catch {
      // Use default categories if API fails
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Toggle symptom selection
  const handleSymptomToggle = (symptomKey, checked) => {
    setSelectedSymptoms((prev) =>
      checked ? [...prev, symptomKey] : prev.filter((k) => k !== symptomKey)
    );
  };

  // Check if a symptom is selected
  const isSymptomSelected = (symptomKey) =>
    selectedSymptoms.includes(symptomKey);

  // Get selected symptom labels for display
  const getSelectedSymptomLabels = () => {
    const labels = [];
    categories.forEach((cat) => {
      cat.symptoms.forEach((sym) => {
        if (selectedSymptoms.includes(sym.key)) {
          labels.push({ category: cat.name, symptom: sym.label, key: sym.key });
        }
      });
    });
    return labels;
  };

  // Analyze selected symptoms
  const handleAnalyze = useCallback(async () => {
    if (selectedSymptoms.length === 0) {
      message.warning('请至少选择一个症状');
      return;
    }
    if (!monthAge) {
      message.warning('请输入宝宝月龄');
      return;
    }

    setLoading(true);
    try {
      const selectedLabels = getSelectedSymptomLabels();
      const payload = {
        symptoms: selectedLabels.map((s) => ({
          key: s.key,
          category: s.category,
          name: s.symptom,
        })),
        month_age: monthAge,
      };

      const res = await symptomService.analyze(payload);
      if (res.success) {
        setResults(res.data);
      } else {
        message.error(res.message || '分析失败');
      }
    } catch {
      message.error('症状分析失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, [selectedSymptoms, monthAge]);

  // Reset all selections and results
  const handleReset = () => {
    setSelectedSymptoms([]);
    setMonthAge(null);
    setResults(null);
  };

  return (
    <div>
      <Row gutter={16}>
        {/* Left panel: symptom selection */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <HeartOutlined />
                <span>症状自查</span>
              </Space>
            }
            extra={
              <Space>
                <Text type="secondary">
                  已选 {selectedSymptoms.length} 项
                </Text>
              </Space>
            }
          >
            {/* Month age input */}
            <div className="mb-4">
              <Space>
                <Text strong>宝宝月龄：</Text>
                <InputNumber
                  min={0}
                  max={72}
                  value={monthAge}
                  onChange={(val) => setMonthAge(val)}
                  placeholder="月龄"
                  addonAfter="个月"
                  style={{ width: 160 }}
                />
              </Space>
            </div>

            {/* Symptom categories as collapsible panels */}
            <Collapse
              ghost
              items={categories.map((cat) => ({
                key: cat.key,
                label: (
                  <Space>
                    <Text strong>{cat.name}</Text>
                    <Tag>
                      {cat.symptoms.filter((s) =>
                        selectedSymptoms.includes(s.key)
                      ).length || 0}
                    </Tag>
                  </Space>
                ),
                children: (
                  <Checkbox.Group
                    value={selectedSymptoms}
                    style={{ width: '100%' }}
                  >
                    <Row>
                      {cat.symptoms.map((sym) => (
                        <Col span={24} key={sym.key}>
                          <Checkbox
                            value={sym.key}
                            onChange={(e) =>
                              handleSymptomToggle(sym.key, e.target.checked)
                            }
                          >
                            {sym.label}
                          </Checkbox>
                        </Col>
                      ))}
                    </Row>
                  </Checkbox.Group>
                ),
              }))}
            />

            {/* Action buttons */}
            <div className="mt-4 flex justify-end gap-2">
              <Button onClick={handleReset}>重置</Button>
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={handleAnalyze}
                loading={loading}
                disabled={selectedSymptoms.length === 0}
              >
                分析症状
              </Button>
            </div>
          </Card>
        </Col>

        {/* Right panel: analysis results */}
        <Col xs={24} lg={12}>
          <Card
            title="分析结果"
            extra={
              results && (
                <Tag color="blue">
                  {results.matched_categories?.length || 0} 个分类匹配
                </Tag>
              )
            }
          >
            <Spin spinning={loading}>
              {!results && !loading && (
                <div className="text-center py-8">
                  <ExclamationCircleOutlined
                    style={{ fontSize: 48, color: '#d9d9d9' }}
                  />
                  <Paragraph type="secondary" className="mt-4">
                    请在左侧选择症状后点击"分析症状"按钮
                  </Paragraph>
                </div>
              )}

              {results && (
                <div>
                  {/* Matched categories */}
                  {results.matched_categories?.map((category, index) => (
                    <Card
                      key={index}
                      size="small"
                      className="mb-3"
                      title={
                        <Space>
                          <Text strong>{category.name}</Text>
                          {category.severity && (
                            <Tag
                              color={
                                SEVERITY_CONFIG[category.severity]?.color ||
                                'default'
                              }
                            >
                              {SEVERITY_CONFIG[category.severity]?.text ||
                                category.severity}
                            </Tag>
                          )}
                        </Space>
                      }
                    >
                      {/* Common causes */}
                      {category.common_causes?.length > 0 && (
                        <div className="mb-2">
                          <Text type="secondary">常见原因：</Text>
                          <div className="mt-1">
                            {category.common_causes.map((cause, i) => (
                              <Tag key={i} className="mb-1">
                                {cause}
                              </Tag>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Precautions */}
                      {category.precautions?.length > 0 && (
                        <div>
                          <Text type="secondary">注意事项：</Text>
                          <List
                            size="small"
                            dataSource={category.precautions}
                            renderItem={(item) => (
                              <List.Item style={{ padding: '4px 0' }}>
                                <Text>{item}</Text>
                              </List.Item>
                            )}
                          />
                        </div>
                      )}
                    </Card>
                  ))}

                  {/* General advice */}
                  {results.general_advice && (
                    <Alert
                      type="info"
                      showIcon
                      message="综合建议"
                      description={results.general_advice}
                      className="mt-3"
                    />
                  )}

                  {/* Disclaimer */}
                  <Alert
                    type="warning"
                    showIcon
                    message="免责声明"
                    description="本工具仅提供症状分类参考，不构成就医建议。如有疑虑，请及时就医咨询专业医生。"
                    className="mt-3"
                  />
                </div>
              )}
            </Spin>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SymptomChecker;

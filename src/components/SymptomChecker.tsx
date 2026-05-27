import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
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
import { symptomService } from '../services';

const { Title, Text, Paragraph } = Typography;

interface SymptomCategory {
  key: string;
  label: string;
  symptoms: string[];
}

interface AnalysisResult {
  success: boolean;
  categories: any[];
  related_knowledge: any[];
  overall_severity: string;
  general_precautions: string[];
  matched_categories?: any[];
  general_advice?: string;
  [key: string]: any;
}

const SymptomChecker = () => {
  const { t } = useTranslation();

  // Default symptom categories with their specific symptoms
  const DEFAULT_CATEGORIES = useMemo(
    () => [
      {
        key: 'fever',
        name: t('symptom.categories.fever'),
        symptoms: [
          { key: 'high_fever', label: t('symptom.symptoms.high_fever') },
          { key: 'low_fever', label: t('symptom.symptoms.low_fever') },
          { key: 'persistent_fever', label: t('symptom.symptoms.persistent_fever') },
          { key: 'fever_with_rash', label: t('symptom.symptoms.fever_with_rash') },
          { key: 'fever_with_seizure', label: t('symptom.symptoms.fever_with_seizure') },
        ],
      },
      {
        key: 'respiratory',
        name: t('symptom.categories.respiratory'),
        symptoms: [
          { key: 'cough', label: t('symptom.symptoms.cough') },
          { key: 'nasal_congestion', label: t('symptom.symptoms.nasal_congestion') },
          { key: 'runny_nose', label: t('symptom.symptoms.runny_nose') },
          { key: 'wheezing', label: t('symptom.symptoms.wheezing') },
          { key: 'difficulty_breathing', label: t('symptom.symptoms.difficulty_breathing') },
          { key: 'sneezing', label: t('symptom.symptoms.sneezing') },
        ],
      },
      {
        key: 'digestive',
        name: t('symptom.categories.digestive'),
        symptoms: [
          { key: 'vomiting', label: t('symptom.symptoms.vomiting') },
          { key: 'diarrhea', label: t('symptom.symptoms.diarrhea') },
          { key: 'constipation', label: t('symptom.symptoms.constipation') },
          { key: 'abdominal_distension', label: t('symptom.symptoms.abdominal_distension') },
          { key: 'poor_appetite', label: t('symptom.symptoms.poor_appetite') },
          { key: 'blood_in_stool', label: t('symptom.symptoms.blood_in_stool') },
        ],
      },
      {
        key: 'skin',
        name: t('symptom.categories.skin'),
        symptoms: [
          { key: 'rash', label: t('symptom.symptoms.rash') },
          { key: 'eczema', label: t('symptom.symptoms.eczema') },
          { key: 'dry_skin', label: t('symptom.symptoms.dry_skin') },
          { key: 'jaundice', label: t('symptom.symptoms.jaundice') },
          { key: 'diaper_rash', label: t('symptom.symptoms.diaper_rash') },
          { key: 'excessive_sweating', label: t('symptom.symptoms.excessive_sweating') },
        ],
      },
      {
        key: 'sleep',
        name: t('symptom.categories.sleep'),
        symptoms: [
          { key: 'difficulty_falling_asleep', label: t('symptom.symptoms.difficulty_falling_asleep') },
          { key: 'frequent_waking', label: t('symptom.symptoms.frequent_waking') },
          { key: 'night_terrors', label: t('symptom.symptoms.night_terrors') },
          { key: 'excessive_sleepiness', label: t('symptom.symptoms.excessive_sleepiness') },
          { key: 'irregular_sleep', label: t('symptom.symptoms.irregular_sleep') },
        ],
      },
      {
        key: 'oral',
        name: t('symptom.categories.oral'),
        symptoms: [
          { key: 'thrush', label: t('symptom.symptoms.thrush') },
          { key: 'teething_discomfort', label: t('symptom.symptoms.teething_discomfort') },
          { key: 'drooling', label: t('symptom.symptoms.drooling') },
          { key: 'mouth_ulcer', label: t('symptom.symptoms.mouth_ulcer') },
          { key: 'bad_breath', label: t('symptom.symptoms.bad_breath') },
        ],
      },
      {
        key: 'eye',
        name: t('symptom.categories.eye'),
        symptoms: [
          { key: 'red_eye', label: t('symptom.symptoms.red_eye') },
          { key: 'excessive_tearing', label: t('symptom.symptoms.excessive_tearing') },
          { key: 'eye_discharge', label: t('symptom.symptoms.eye_discharge') },
          { key: 'eye_rubbing', label: t('symptom.symptoms.eye_rubbing') },
        ],
      },
      {
        key: 'ear',
        name: t('symptom.categories.ear'),
        symptoms: [
          { key: 'ear_pulling', label: t('symptom.symptoms.ear_pulling') },
          { key: 'ear_discharge', label: t('symptom.symptoms.ear_discharge') },
          { key: 'ear_infection', label: t('symptom.symptoms.ear_infection') },
          { key: 'hearing_concern', label: t('symptom.symptoms.hearing_concern') },
        ],
      },
    ],
    [t]
  );

  // Severity level color mapping
  const SEVERITY_CONFIG = useMemo(
    () => ({
      mild: { color: 'green', text: t('symptom.severity.mild') },
      moderate: { color: 'orange', text: t('symptom.severity.moderate') },
      severe: { color: 'red', text: t('symptom.severity.severe') },
    }),
    [t]
  );

  const [categories, setCategories] = useState<any[]>(DEFAULT_CATEGORIES);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [monthAge, setMonthAge] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [results, setResults] = useState<AnalysisResult | null>(null);

  // Update categories when translation changes
  useEffect(() => {
    setCategories(DEFAULT_CATEGORIES);
  }, [DEFAULT_CATEGORIES]);

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
      message.warning(t('symptom.noSymptoms'));
      return;
    }
    if (!monthAge) {
      message.warning(t('symptom.noMonthAge'));
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
        message.error(res.message || t('symptom.analyzeError'));
      }
    } catch {
      message.error(t('symptom.analyzeError'));
    } finally {
      setLoading(false);
    }
  }, [selectedSymptoms, monthAge, t, getSelectedSymptomLabels]);

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
                <span>{t('symptom.title')}</span>
              </Space>
            }
            extra={
              <Space>
                <Text type="secondary">
                  {t('symptom.selectedCount', { count: selectedSymptoms.length })}
                </Text>
              </Space>
            }
          >
            {/* Month age input */}
            <div style={{ marginBottom: 16 }}>
              <Space>
                <Text strong>{t('symptom.monthAge')}：</Text>
                <InputNumber
                  min={0}
                  max={72}
                  value={monthAge}
                  onChange={(val) => setMonthAge(val)}
                  placeholder={t('symptom.monthAgePlaceholder')}
                  addonAfter={t('symptom.months')}
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
            <div style={{ marginTop: 16, textAlign: 'right' }}>
              <Space>
                <Button onClick={handleReset}>{t('symptom.reset')}</Button>
                <Button
                  type="primary"
                  icon={<SearchOutlined />}
                  onClick={handleAnalyze}
                  loading={loading}
                  disabled={selectedSymptoms.length === 0}
                >
                  {t('symptom.analyzeButton')}
                </Button>
              </Space>
            </div>
          </Card>
        </Col>

        {/* Right panel: analysis results */}
        <Col xs={24} lg={12}>
          <Card
            title={t('symptom.result')}
            extra={
              results && (
                <Tag color="blue">
                  {t('symptom.matchedCategories', { count: results.matched_categories?.length || 0 })}
                </Tag>
              )
            }
          >
            <Spin spinning={loading}>
              {!results && !loading && (
                <div style={{ textAlign: 'center', padding: '32px 0' }}>
                  <ExclamationCircleOutlined
                    style={{ fontSize: 48, color: '#d9d9d9' }}
                  />
                  <Paragraph type="secondary" style={{ marginTop: 16 }}>
                    {t('symptom.selectHint')}
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
                      style={{ marginBottom: 12 }}
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
                        <div style={{ marginBottom: 8 }}>
                          <Text type="secondary">{t('symptom.commonCauses')}</Text>
                          <div style={{ marginTop: 4 }}>
                            {category.common_causes.map((cause, i) => (
                              <Tag key={i} style={{ marginBottom: 4 }}>
                                {cause}
                              </Tag>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Precautions */}
                      {category.precautions?.length > 0 && (
                        <div>
                          <Text type="secondary">{t('symptom.precautions')}</Text>
                          <List
                            size="small"
                            dataSource={category.precautions}
                            renderItem={(item: any) => (
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
                      message={t('symptom.generalAdvice')}
                      description={results.general_advice}
                      style={{ marginTop: 12 }}
                    />
                  )}

                  {/* Disclaimer */}
                  <Alert
                    type="warning"
                    showIcon
                    message={t('symptom.disclaimer')}
                    description={t('symptom.disclaimerText')}
                    style={{ marginTop: 12 }}
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

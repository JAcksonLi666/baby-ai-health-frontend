import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

/**
 * 儿童生长发育图表组件
 * 支持年龄段：婴儿期(0-12月)、幼儿期(1-3岁)、学龄前期(3-6岁)、学龄期(6-12岁)
 * 数据来源：WHO 儿童生长标准 + 中国7岁以下儿童生长发育参照标准
 */

// WHO 婴儿期体重标准 (0-12月)
const WHO_INFANT_WEIGHT = {
  boys: {
    months: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    p3: [2.5, 3.4, 4.3, 5.0, 5.6, 6.0, 6.4, 6.7, 6.9, 7.1, 7.4, 7.6, 7.8],
    p50: [3.3, 4.5, 5.6, 6.4, 7.0, 7.5, 7.9, 8.3, 8.6, 8.9, 9.2, 9.4, 9.6],
    p97: [4.3, 5.7, 7.1, 8.0, 8.7, 9.3, 9.8, 10.3, 10.7, 11.0, 11.4, 11.7, 12.0],
  },
  girls: {
    months: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    p3: [2.4, 3.2, 4.0, 4.6, 5.1, 5.5, 5.8, 6.1, 6.3, 6.5, 6.7, 6.9, 7.1],
    p50: [3.2, 4.2, 5.1, 5.8, 6.4, 6.9, 7.3, 7.6, 7.9, 8.2, 8.5, 8.7, 8.9],
    p97: [4.2, 5.5, 6.6, 7.5, 8.2, 8.8, 9.3, 9.8, 10.2, 10.5, 10.9, 11.2, 11.5],
  },
};

// WHO 婴儿期身高标准 (0-12月)
const WHO_INFANT_HEIGHT = {
  boys: {
    months: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    p3: [46.3, 50.4, 53.2, 55.3, 57.0, 58.4, 59.7, 60.9, 62.0, 63.1, 64.1, 65.1, 66.1],
    p50: [49.9, 54.7, 58.4, 61.4, 63.9, 65.9, 67.6, 69.2, 70.6, 72.0, 73.3, 74.5, 75.7],
    p97: [53.4, 59.0, 63.6, 67.6, 70.7, 73.3, 75.7, 77.9, 79.9, 81.8, 83.6, 85.3, 87.0],
  },
  girls: {
    months: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    p3: [45.6, 49.5, 52.3, 54.4, 56.1, 57.5, 58.8, 60.0, 61.1, 62.2, 63.2, 64.2, 65.1],
    p50: [49.1, 53.7, 57.1, 59.8, 62.1, 64.0, 65.7, 67.3, 68.7, 70.1, 71.5, 72.8, 74.0],
    p97: [52.7, 58.0, 62.2, 65.9, 68.9, 71.5, 73.8, 76.0, 78.0, 79.9, 81.7, 83.4, 85.0],
  },
};

// WHO 幼儿期体重标准 (12-36月)
const WHO_TODDLER_WEIGHT = {
  boys: {
    months: [12, 15, 18, 21, 24, 27, 30, 33, 36],
    p3: [7.8, 8.6, 9.3, 9.9, 10.5, 11.0, 11.5, 11.9, 12.3],
    p50: [9.6, 10.5, 11.3, 12.0, 12.7, 13.3, 13.9, 14.4, 14.9],
    p97: [12.0, 13.0, 14.0, 14.9, 15.7, 16.5, 17.3, 18.1, 18.8],
  },
  girls: {
    months: [12, 15, 18, 21, 24, 27, 30, 33, 36],
    p3: [7.1, 7.9, 8.6, 9.2, 9.8, 10.3, 10.8, 11.3, 11.7],
    p50: [8.9, 9.8, 10.6, 11.3, 12.0, 12.6, 13.2, 13.7, 14.2],
    p97: [11.5, 12.5, 13.5, 14.4, 15.3, 16.1, 16.9, 17.7, 18.4],
  },
};

// WHO 幼儿期身高标准 (12-36月)
const WHO_TODDLER_HEIGHT = {
  boys: {
    months: [12, 15, 18, 21, 24, 27, 30, 33, 36],
    p3: [66.1, 69.2, 71.9, 74.3, 76.5, 78.5, 80.4, 82.2, 83.9],
    p50: [75.7, 78.9, 81.8, 84.4, 86.8, 89.0, 91.1, 93.1, 95.0],
    p97: [87.0, 90.6, 93.9, 96.9, 99.6, 102.1, 104.5, 106.7, 108.9],
  },
  girls: {
    months: [12, 15, 18, 21, 24, 27, 30, 33, 36],
    p3: [65.1, 68.1, 70.7, 73.1, 75.2, 77.2, 79.2, 81.1, 82.9],
    p50: [74.0, 77.2, 80.1, 82.7, 85.1, 87.3, 89.4, 91.4, 93.3],
    p97: [85.0, 88.5, 91.6, 94.5, 97.1, 99.6, 102.0, 104.3, 106.5],
  },
};

// 中国学龄前期体重标准 (3-6岁)
const CHINA_PRESCHOOL_WEIGHT = {
  boys: {
    months: [36, 48, 60, 72],
    p3: [11.4, 13.1, 14.7, 16.3],
    p50: [14.6, 16.7, 18.7, 20.7],
    p97: [18.3, 21.1, 24.0, 27.0],
  },
  girls: {
    months: [36, 48, 60, 72],
    p3: [11.0, 12.6, 14.2, 15.9],
    p50: [14.1, 16.0, 17.9, 19.9],
    p97: [17.9, 20.5, 23.2, 26.2],
  },
};

// 中国学龄前期身高标准 (3-6岁)
const CHINA_PRESCHOOL_HEIGHT = {
  boys: {
    months: [36, 48, 60, 72],
    p3: [89.3, 95.4, 101.2, 106.9],
    p50: [96.8, 104.1, 111.3, 117.7],
    p97: [104.4, 112.9, 121.5, 128.8],
  },
  girls: {
    months: [36, 48, 60, 72],
    p3: [88.2, 94.3, 100.5, 106.2],
    p50: [95.6, 103.1, 110.2, 116.6],
    p97: [103.1, 111.9, 120.0, 127.3],
  },
};

// 中国学龄期体重标准 (6-12岁)
const CHINA_SCHOOL_AGE_WEIGHT = {
  boys: {
    months: [72, 84, 96, 108, 120, 132, 144],
    p3: [16.3, 18.2, 20.3, 22.5, 25.0, 28.0, 31.5],
    p50: [20.7, 23.0, 25.6, 28.5, 31.9, 35.8, 40.5],
    p97: [27.0, 30.5, 34.5, 39.0, 44.5, 51.0, 58.5],
  },
  girls: {
    months: [72, 84, 96, 108, 120, 132, 144],
    p3: [15.9, 17.6, 19.5, 21.8, 24.4, 27.5, 31.2],
    p50: [19.9, 21.9, 24.3, 27.0, 30.3, 34.0, 38.5],
    p97: [26.2, 29.0, 32.5, 36.5, 41.5, 47.0, 53.5],
  },
};

// 中国学龄期身高标准 (6-12岁)
const CHINA_SCHOOL_AGE_HEIGHT = {
  boys: {
    months: [72, 84, 96, 108, 120, 132, 144],
    p3: [106.9, 111.8, 116.8, 121.8, 126.8, 131.8, 137.0],
    p50: [117.7, 124.0, 130.0, 135.4, 140.2, 145.3, 151.9],
    p97: [128.8, 136.2, 143.3, 149.0, 153.7, 158.7, 166.8],
  },
  girls: {
    months: [72, 84, 96, 108, 120, 132, 144],
    p3: [106.2, 111.0, 116.0, 121.0, 126.0, 131.5, 138.0],
    p50: [116.6, 122.5, 128.5, 134.1, 140.1, 146.6, 152.4],
    p97: [127.3, 134.0, 141.0, 147.2, 154.2, 161.7, 166.5],
  },
};

// BMI 标准 (24-144月)
const WHO_BMI = {
  boys: {
    months: [24, 36, 48, 60, 72, 84, 96, 108, 120, 132, 144],
    p3: [14.8, 14.4, 14.1, 13.9, 13.8, 13.7, 13.7, 13.8, 13.9, 14.1, 14.3],
    p50: [16.3, 15.8, 15.5, 15.4, 15.4, 15.5, 15.7, 16.0, 16.3, 16.7, 17.1],
    p85: [17.8, 17.3, 17.1, 17.2, 17.4, 17.8, 18.3, 18.9, 19.5, 20.2, 20.9],
    p97: [19.2, 18.8, 18.8, 19.2, 19.8, 20.6, 21.6, 22.7, 23.9, 25.1, 26.3],
  },
  girls: {
    months: [24, 36, 48, 60, 72, 84, 96, 108, 120, 132, 144],
    p3: [14.6, 14.2, 13.9, 13.7, 13.6, 13.5, 13.5, 13.6, 13.8, 14.0, 14.3],
    p50: [16.1, 15.6, 15.3, 15.2, 15.2, 15.3, 15.5, 15.8, 16.2, 16.7, 17.2],
    p85: [17.7, 17.2, 17.0, 17.0, 17.3, 17.7, 18.2, 18.8, 19.5, 20.3, 21.1],
    p97: [19.1, 18.7, 18.7, 19.0, 19.6, 20.4, 21.4, 22.6, 23.9, 25.2, 26.5],
  },
};

// 头围标准 (0-24月)
const WHO_HEAD_CIRCUMFERENCE = {
  boys: {
    months: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 15, 18, 21, 24],
    p3: [32.1, 34.5, 36.3, 37.7, 38.8, 39.7, 40.5, 41.2, 41.8, 42.3, 42.8, 43.2, 43.6, 44.5, 45.2, 45.8, 46.3],
    p50: [35.1, 37.3, 39.1, 40.5, 41.6, 42.6, 43.3, 44.0, 44.6, 45.1, 45.5, 45.9, 46.3, 47.2, 47.9, 48.4, 48.9],
    p97: [38.1, 40.1, 41.9, 43.3, 44.4, 45.4, 46.2, 46.9, 47.5, 48.0, 48.5, 48.9, 49.3, 50.2, 50.9, 51.4, 51.9],
  },
  girls: {
    months: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 15, 18, 21, 24],
    p3: [31.7, 34.0, 35.6, 37.0, 38.0, 38.9, 39.7, 40.4, 41.0, 41.5, 42.0, 42.4, 42.8, 43.7, 44.4, 45.0, 45.5],
    p50: [34.5, 36.5, 38.3, 39.7, 40.8, 41.7, 42.4, 43.1, 43.7, 44.2, 44.6, 45.0, 45.4, 46.3, 47.0, 47.5, 48.0],
    p97: [37.3, 39.1, 40.9, 42.3, 43.5, 44.4, 45.2, 45.9, 46.5, 47.0, 47.5, 47.9, 48.3, 49.2, 49.9, 50.4, 50.9],
  },
};

// 获取标准数据
const getStandardData = (ageGroup, metric, gender) => {
  const standards = {
    infant: {
      weight: WHO_INFANT_WEIGHT,
      height: WHO_INFANT_HEIGHT,
      head_circumference: WHO_HEAD_CIRCUMFERENCE,
    },
    toddler: {
      weight: WHO_TODDLER_WEIGHT,
      height: WHO_TODDLER_HEIGHT,
      head_circumference: WHO_HEAD_CIRCUMFERENCE,
    },
    preschool: {
      weight: CHINA_PRESCHOOL_WEIGHT,
      height: CHINA_PRESCHOOL_HEIGHT,
    },
    school_age: {
      weight: CHINA_SCHOOL_AGE_WEIGHT,
      height: CHINA_SCHOOL_AGE_HEIGHT,
    },
  };

  if (metric === 'bmi') {
    return WHO_BMI[gender];
  }

  const groupStandards = standards[ageGroup];
  if (!groupStandards || !groupStandards[metric]) {
    return null;
  }

  return groupStandards[metric][gender];
};

// 格式化图表数据
const formatChartData = (standardData) => {
  if (!standardData) return [];

  const { months, p3, p50, p97, p85 } = standardData;
  return months.map((month, idx) => ({
    month,
    age: month < 12 ? `${month}月` : `${Math.floor(month / 12)}岁${month % 12 > 0 ? month % 12 + '月' : ''}`,
    p3: p3[idx],
    p50: p50[idx],
    p97: p97[idx],
    p85: p85 ? p85[idx] : null,
  }));
};

// 计算百分位
const calculatePercentile = (value, standardData) => {
  if (!standardData || value === null || value === undefined) return null;

  const { p3, p50, p97 } = standardData;
  const medianP3 = p3[Math.floor(p3.length / 2)];
  const medianP50 = p50[Math.floor(p50.length / 2)];
  const medianP97 = p97[Math.floor(p97.length / 2)];

  if (value < medianP3) return 1;
  if (value > medianP97) return 99;
  if (value < medianP50) {
    return Math.round(3 + ((value - medianP3) / (medianP50 - medianP3)) * 47);
  }
  return Math.round(50 + ((value - medianP50) / (medianP97 - medianP50)) * 47);
};

const GrowthChart = ({
  childData = [],
  onDataPointClick,
  showPercentile = true,
}) => {
  const { t } = useTranslation();

  // 年龄段定义
  const AGE_GROUPS = {
    infant: { name: t('growthChart.infant'), minMonths: 0, maxMonths: 12, description: '0-12' + t('growthChart.ageMonths') },
    toddler: { name: t('growthChart.toddler'), minMonths: 12, maxMonths: 36, description: '1-3' + t('growthChart.ageYears') },
    preschool: { name: t('growthChart.preschool'), minMonths: 36, maxMonths: 72, description: '3-6' + t('growthChart.ageYears') },
    school_age: { name: t('growthChart.schoolAge'), minMonths: 72, maxMonths: 144, description: '6-12' + t('growthChart.ageYears') },
  };

  // 指标配置
  const METRICS = {
    weight: { name: t('growthChart.weight'), unit: t('growthChart.kg'), min: 0, max: 80 },
    height: { name: t('growthChart.height'), unit: t('growthChart.cm'), min: 0, max: 180 },
    bmi: { name: t('growthChart.bmi'), unit: t('growthChart.bmiUnit'), min: 10, max: 30 },
    head_circumference: { name: t('growthChart.headCircumference'), unit: t('growthChart.cm'), min: 30, max: 55 },
  };

  // 性别配置
  const GENDERS = {
    boys: { name: t('growthChart.boys'), color: '#3b82f6' },
    girls: { name: t('growthChart.girls'), color: '#ec4899' },
  };

  // 评估百分位
  const evaluatePercentile = (percentile) => {
    if (percentile < 3) return { text: t('growthChart.percentileLow'), color: '#ef4444' };
    if (percentile < 25) return { text: t('growthChart.percentileBelowAverage'), color: '#f97316' };
    if (percentile < 75) return { text: t('growthChart.percentileNormal'), color: '#22c55e' };
    if (percentile < 97) return { text: t('growthChart.percentileAboveAverage'), color: '#3b82f6' };
    return { text: t('growthChart.percentileHigh'), color: '#8b5cf6' };
  };

  const [selectedAgeGroup, setSelectedAgeGroup] = useState('infant');
  const [selectedMetric, setSelectedMetric] = useState('weight');
  const [selectedGender, setSelectedGender] = useState('boys');

  const availableMetrics = useMemo(() => {
    const metrics = ['weight', 'height'];
    if (selectedAgeGroup === 'infant' || selectedAgeGroup === 'toddler') {
      metrics.push('head_circumference');
    }
    if (selectedAgeGroup !== 'infant') {
      metrics.push('bmi');
    }
    return metrics;
  }, [selectedAgeGroup]);

  useEffect(() => {
    if (!availableMetrics.includes(selectedMetric)) {
      setSelectedMetric('weight');
    }
  }, [selectedAgeGroup, availableMetrics, selectedMetric]);

  const standardData = useMemo(() => {
    return getStandardData(selectedAgeGroup, selectedMetric, selectedGender);
  }, [selectedAgeGroup, selectedMetric, selectedGender]);

  const chartData = useMemo(() => {
    return formatChartData(standardData);
  }, [standardData]);

  const childChartData = useMemo(() => {
    if (!childData || childData.length === 0) return [];

    const ageGroup = AGE_GROUPS[selectedAgeGroup];
    return childData
      .filter((d) => d.month >= ageGroup.minMonths && d.month < ageGroup.maxMonths)
      .map((d) => ({
        month: d.month,
        age: d.month < 12 ? `${d.month}月` : `${Math.floor(d.month / 12)}岁${d.month % 12 > 0 ? d.month % 12 + '月' : ''}`,
        value: d.value,
        percentile: calculatePercentile(d.value, standardData),
      }));
  }, [childData, selectedAgeGroup, standardData]);

  const latestPercentile = useMemo(() => {
    if (childChartData.length === 0) return null;
    const latest = childChartData[childChartData.length - 1];
    return latest.percentile;
  }, [childChartData]);

  const evaluation = latestPercentile !== null ? evaluatePercentile(latestPercentile) : null;

  const metricConfig = METRICS[selectedMetric];
  const genderConfig = GENDERS[selectedGender];

  return (
    <div className="growth-chart-container" style={{ padding: '20px', background: '#fff', borderRadius: '8px' }}>
      {/* 控制面板 */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        {/* 年龄段选择 */}
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#374151' }}>
            {t('growthChart.ageGroup')}
          </label>
          <select
            value={selectedAgeGroup}
            onChange={(e) => setSelectedAgeGroup(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #d1d5db',
              fontSize: '14px',
              minWidth: '120px',
            }}
          >
            {Object.entries(AGE_GROUPS).map(([key, group]) => (
              <option key={key} value={key}>
                {group.name} ({group.description})
              </option>
            ))}
          </select>
        </div>

        {/* 性别选择 */}
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#374151' }}>
            {t('growthChart.gender')}
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {Object.entries(GENDERS).map(([key, gender]) => (
              <button
                key={key}
                onClick={() => setSelectedGender(key)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  background: selectedGender === key ? gender.color : '#fff',
                  color: selectedGender === key ? '#fff' : '#374151',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                {gender.name}
              </button>
            ))}
          </div>
        </div>

        {/* 指标选择 */}
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#374151' }}>
            {t('growthChart.metric')}
          </label>
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #d1d5db',
              fontSize: '14px',
              minWidth: '120px',
            }}
          >
            {availableMetrics.map((metric) => (
              <option key={metric} value={metric}>
                {METRICS[metric].name} ({METRICS[metric].unit})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 百分位评估 */}
      {showPercentile && evaluation && (
        <div
          style={{
            marginBottom: '20px',
            padding: '12px 16px',
            background: '#f3f4f6',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <span style={{ fontWeight: 'bold', color: '#374151' }}>{t('growthChart.latestEvaluation')}:</span>
          <span style={{ color: evaluation.color, fontWeight: 'bold' }}>
            {evaluation.text} (P{latestPercentile})
          </span>
        </div>
      )}

      {/* 图表 */}
      <div style={{ height: '400px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="age"
              tick={{ fontSize: 12 }}
              interval={Math.floor(chartData.length / 6)}
            />
            <YAxis
              domain={[metricConfig.min, metricConfig.max]}
              tick={{ fontSize: 12 }}
              label={{
                value: `${metricConfig.name} (${metricConfig.unit})`,
                angle: -90,
                position: 'insideLeft',
              }}
            />
            <Tooltip
              contentStyle={{
                background: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
              }}
            />
            <Legend />

            {/* 百分位参考线 */}
            <Line
              type="monotone"
              dataKey="p3"
              stroke="#ef4444"
              strokeWidth={2}
              dot={false}
              name={t('growthChart.p3')}
            />
            <Line
              type="monotone"
              dataKey="p50"
              stroke="#22c55e"
              strokeWidth={2}
              dot={false}
              name={t('growthChart.p50')}
            />
            <Line
              type="monotone"
              dataKey="p97"
              stroke="#8b5cf6"
              strokeWidth={2}
              dot={false}
              name={t('growthChart.p97')}
            />
            {chartData[0]?.p85 && (
              <Line
                type="monotone"
                dataKey="p85"
                stroke="#f97316"
                strokeWidth={1}
                strokeDasharray="5 5"
                dot={false}
                name={t('growthChart.p85')}
              />
            )}

            {/* 孩子的实际数据 */}
            {childChartData.length > 0 && (
              <Line
                type="monotone"
                data={childChartData}
                dataKey="value"
                stroke={genderConfig.color}
                strokeWidth={3}
                dot={{ r: 5, fill: genderConfig.color }}
                name={t('growthChart.childData')}
                connectNulls
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 说明 */}
      <div
        style={{
          marginTop: '20px',
          padding: '12px',
          background: '#f9fafb',
          borderRadius: '6px',
          fontSize: '12px',
          color: '#6b7280',
        }}
      >
        <p style={{ margin: '0 0 8px 0' }}>
          <strong>{t('growthChart.dataSource')}:</strong>{' '}
          {selectedAgeGroup === 'infant' || selectedAgeGroup === 'toddler'
            ? t('growthChart.whoStandard')
            : t('growthChart.chinaStandard')}
        </p>
        <p style={{ margin: 0 }}>
          <strong>{t('growthChart.description')}</strong>
        </p>
      </div>
    </div>
  );
};

export default GrowthChart;

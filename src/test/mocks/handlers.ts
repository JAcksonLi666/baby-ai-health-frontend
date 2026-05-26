import { http, HttpResponse } from 'msw';

const API_BASE = 'http://localhost:8000';

export const handlers = [
  http.get(`${API_BASE}/api/sleep`, () => {
    return HttpResponse.json({
      success: true,
      records: [
        {
          id: 'sleep_202605190730_abc123',
          start_time: '2026-05-19 07:30',
          end_time: '2026-05-19 08:15',
          sleep_type: 'nap',
          duration_minutes: 45,
          is_ongoing: false,
          notes: '上午小睡',
          created_at: '2026-05-19T07:30:00',
          updated_at: '2026-05-19T08:15:00',
        },
      ],
      total: 1,
    });
  }),

  http.get(`${API_BASE}/api/sleep/ongoing`, () => {
    return HttpResponse.json({
      success: false,
      message: '当前没有进行中的睡眠',
    });
  }),

  http.post(`${API_BASE}/api/sleep`, () => {
    return HttpResponse.json({
      success: true,
      id: 'sleep_new_001',
    });
  }),

  http.put(`${API_BASE}/api/sleep/:id`, () => {
    return HttpResponse.json({ success: true });
  }),

  http.delete(`${API_BASE}/api/sleep/:id`, () => {
    return HttpResponse.json({ success: true });
  }),

  http.get(`${API_BASE}/api/diaper`, () => {
    return HttpResponse.json({
      success: true,
      records: [
        {
          id: 'diaper_202605190900_abc123',
          time: '2026-05-19 09:00',
          type: 'both',
          pee: true,
          poop: true,
          color: 'yellow',
          notes: '正常',
          created_at: '2026-05-19T09:00:00',
          updated_at: '2026-05-19T09:00:00',
        },
      ],
      total: 1,
    });
  }),

  http.post(`${API_BASE}/api/diaper`, () => {
    return HttpResponse.json({
      success: true,
      id: 'diaper_new_001',
    });
  }),

  http.put(`${API_BASE}/api/diaper/:id`, () => {
    return HttpResponse.json({ success: true });
  }),

  http.delete(`${API_BASE}/api/diaper/:id`, () => {
    return HttpResponse.json({ success: true });
  }),

  http.get(`${API_BASE}/api/cry`, () => {
    return HttpResponse.json({
      success: true,
      records: [
        {
          id: 'cry_20260519053957_f76838',
          start_time: '2026-05-19 07:30',
          end_time: '2026-05-19 07:35',
          reason: 'hungry',
          intensity: 3,
          soothing_method: '喂奶',
          notes: null,
          has_audio: false,
          created_at: '2026-05-19T07:30:00',
          updated_at: '2026-05-19T07:35:00',
        },
      ],
      total: 1,
    });
  }),

  http.get(`${API_BASE}/api/cry/ongoing`, () => {
    return HttpResponse.json({
      success: false,
      message: '当前没有进行中的哭闹',
    });
  }),

  http.get(`${API_BASE}/api/cry/analyze`, () => {
    return HttpResponse.json({
      success: true,
      suggested_reasons: [
        { reason: 'hungry', confidence: 0.85 },
        { reason: 'sleepy', confidence: 0.65 },
        { reason: 'diaper', confidence: 0.45 },
      ],
      analysis_basis: '基于今日 2 条睡眠、2 条排泄、3 条哭声记录分析',
      note: 'MVP 规则引擎分析，后续将集成 AI 音频分类模型',
    });
  }),

  http.post(`${API_BASE}/api/cry`, () => {
    return HttpResponse.json({
      success: true,
      id: 'cry_new_001',
    });
  }),

  http.put(`${API_BASE}/api/cry/:id`, () => {
    return HttpResponse.json({ success: true });
  }),

  http.delete(`${API_BASE}/api/cry/:id`, () => {
    return HttpResponse.json({ success: true });
  }),

  http.get(`${API_BASE}/api/today/summary`, () => {
    return HttpResponse.json({
      date: '2026-05-19',
      sleep: {
        total_minutes: 270,
        total_display: '4小时30分钟',
        nap_count: 2,
        nap_minutes: 180,
        night_minutes: 90,
        is_ongoing: false,
        record_count: 3,
      },
      diaper: {
        total_count: 2,
        pee_count: 1,
        poop_count: 0,
        both_count: 1,
        colors: ['yellow'],
        has_abnormal: false,
      },
      cry: {
        total_minutes: 13,
        total_count: 3,
        reason_counts: { hungry: 2, sleepy: 1 },
        top_reason: 'hungry',
        is_ongoing: false,
      },
      insights: [
        '今日睡眠总计4小时30分钟，建议增加夜间睡眠时间',
        '今日换尿布2次，颜色正常',
        '今日哭闹3次，主要原因是饥饿',
      ],
    });
  }),

  http.get(`${API_BASE}/api/knowledge/search`, ({ request }) => {
    const url = new URL(request.url);
    const query = url.searchParams.get('query');
    
    return HttpResponse.json({
      success: true,
      query,
      results: [
        {
          id: 'kb_feed_001',
          title: '母乳喂养频率与时长',
          source: '国家卫健委《3岁以下婴幼儿健康养育照护指南（试行）》',
          content: '母乳是婴儿最理想的天然食物。出生后应尽早开奶（半小时内），按需哺乳，每日不少于8次...',
          keywords: ['母乳', '喂养', '哺乳'],
          score: 1.0,
          match_type: 'keyword',
        },
      ],
      total: 1,
    });
  }),

  http.get(`${API_BASE}/api/knowledge/status`, () => {
    return HttpResponse.json({
      success: true,
      ready: true,
      total_entries: 24,
      source: '国家卫健委婴幼儿照护指南（3部）',
      retrieval_method: 'BM25 + 关键词混合检索',
    });
  }),
];

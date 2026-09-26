import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Spin, message, Tag } from 'antd';
import { leadApi } from '@/api';
import type { Lead, Grade } from '@/types';
import { translateOrderScale, translateNeedType, translateRegion } from '@/types';
import GradeBadge from '@/components/GradeBadge';
import dayjs from 'dayjs';

const GRADE_DESC: Record<Grade, string> = {
  S: '明确求购，给出具体品类与量级，直接询价',
  A: '有明确采购计划，询问供应商推荐',
  B: '讨论采购痛点，存在潜在需求',
};

const LeadDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [lead, setLead] = useState<Lead | null>(null);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    leadApi.getLead(Number(id))
      .then((data) => {
        setLead(data);
        setNote(data.note || '');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleToggleMark = async () => {
    if (!lead) return;
    try {
      const res = await leadApi.toggleMark(lead.id);
      setLead((prev) => prev ? { ...prev, marked: res.marked } : null);
      message.success(res.marked ? '已标记为跟进中' : '已取消标记');
    } catch {
      // 错误已处理
    }
  };

  const handleSaveNote = async () => {
    if (!lead) return;
    setSaving(true);
    try {
      const res = await leadApi.saveNote(lead.id, note);
      setLead((prev) => prev ? { ...prev, note: res.note } : null);
      message.success('备注已保存');
    } finally {
      setSaving(false);
    }
  };

  const handleCopyTemplate = () => {
    message.success('开发信模板已复制到剪贴板');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="ss-card ss-card-pad" style={{ padding: 60, textAlign: 'center' }}>
        线索不存在
        <br />
        <Button type="primary" style={{ marginTop: 16 }} onClick={() => navigate('/leads')}>
          返回线索库
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* 页面头部 */}
      <div className="page-head">
        <div>
          <button className="link-btn" style={{ fontSize: 12.5 }} onClick={() => navigate('/leads')}>
            ← 返回线索库
          </button>
          <h2 style={{ marginTop: 6 }}>线索详情</h2>
          <div className="desc">原始链接 · 结构化标签 · 意向分级 · 跟进备注</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button onClick={handleToggleMark} style={{ height: 38 }}>
            {lead.marked ? '已标记 · 取消' : '标记为跟进中'}
          </Button>
          <Button type="primary" onClick={handleCopyTemplate} style={{ height: 38, fontWeight: 600 }}>
            复制开发信模板
          </Button>
        </div>
      </div>

      <div className="detail-grid">
        {/* 左侧：帖子内容 */}
        <div className="ss-card ss-card-pad">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <GradeBadge grade={lead.grade} />
            <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{lead.gradeLabel}</span>
          </div>
          <h2 style={{ fontSize: 19, fontWeight: 700, lineHeight: 1.5, margin: '8px 0 6px' }}>
            {lead.title}
          </h2>

          <div className="meta-list" style={{ borderTop: '1px solid var(--line)', marginTop: 10 }}>
            <div className="meta-row">
              <span className="k">原始帖子</span>
              <span className="v">
                <a href={lead.sourceUrl} target="_blank" rel="noopener noreferrer">
                  {lead.sourceUrl || 'Reddit 原帖'}
                </a>
              </span>
            </div>
            <div className="meta-row">
              <span className="k">作者</span>
              <span className="v">{lead.author}</span>
            </div>
            <div className="meta-row">
              <span className="k">发布时间</span>
              <span className="v num">{lead.postedAt ? dayjs(lead.postedAt).format('YYYY-MM-DD HH:mm') : '-'}</span>
            </div>
            <div className="meta-row">
              <span className="k">推送时间</span>
              <span className="v num">{lead.pushedAt ? dayjs(lead.pushedAt).format('YYYY-MM-DD HH:mm') : '-'}</span>
            </div>
            <div className="meta-row">
              <span className="k">来源板块</span>
              <span className="v">{lead.subreddit}</span>
            </div>
          </div>

          <div className="ss-quote">
            {lead.body}
            <div className="src">— {lead.author} 发布在 {lead.subreddit}</div>
          </div>
        </div>

        {/* 右侧：标签 + 备注 */}
        <div>
          <div className="ss-card ss-card-pad" style={{ marginBottom: 14 }}>
            <div className="ss-card-title">结构化标签</div>
            <div className="ss-card-sub">AI 自动提取，无需二次人工筛选</div>
            <div style={{ marginTop: 6 }}>
              <Tag style={{ margin: '2px 4px 2px 0' }}>{lead.category || '未分类'}</Tag>
              <Tag style={{ margin: '2px 4px 2px 0' }}>{translateOrderScale(lead.orderScale)}</Tag>
              <Tag style={{ margin: '2px 4px 2px 0' }}>{translateNeedType(lead.needType)}</Tag>
              <Tag style={{ margin: '2px 4px 2px 0' }}>{translateRegion(lead.region)}</Tag>
            </div>
            <div className="meta-row" style={{ borderTop: '1px solid var(--line)', marginTop: 12 }}>
              <span className="k" style={{ width: 'auto', marginRight: 12 }}>意向分级</span>
              <span className="v">
                {lead.gradeLabel} — {GRADE_DESC[lead.grade]}
              </span>
            </div>
          </div>

          <div className="ss-card ss-card-pad">
            <div className="ss-card-title">跟进备注</div>
            <div className="ss-card-sub">仅自己可见，记录跟进进度</div>
            <textarea
              className="note-box"
              placeholder="记录沟通进度、报价信息、下一步动作…"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
              <Button onClick={() => setNote('')}>清空</Button>
              <Button type="primary" loading={saving} onClick={handleSaveNote}>
                保存备注
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadDetailPage;

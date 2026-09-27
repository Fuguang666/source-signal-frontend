import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, Spin, message, Tag } from 'antd';
import { leadApi } from '@/api';
import type { Lead, Grade } from '@/types';
import { translateOrderScale, translateNeedType, translateRegion } from '@/types';
import GradeBadge from '@/components/GradeBadge';
import dayjs from 'dayjs';

const LeadDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [lead, setLead] = useState<Lead | null>(null);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const GRADE_DESC: Record<Grade, string> = {
    S: t('grade.sDesc'),
    A: t('grade.aDesc'),
    B: t('grade.bDesc'),
  };

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
      message.success(res.marked ? t('leads.markReviewed') : t('leads.markUnreviewed'));
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
      message.success(t('common.success'));
    } finally {
      setSaving(false);
    }
  };

  const handleCopyTemplate = () => {
    message.success(t('common.success'));
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
        {t('leads.noData')}
        <br />
        <Button type="primary" style={{ marginTop: 16 }} onClick={() => navigate('/app/leads')}>
          {t('leadDetail.back')}
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <button className="link-btn" style={{ fontSize: 12.5 }} onClick={() => navigate('/app/leads')}>
            ← {t('leadDetail.back')}
          </button>
          <h2 style={{ marginTop: 6 }}>{t('leads.title')}</h2>
          <div className="desc">{t('leadDetail.originalPost')} · {t('leadDetail.structuredTags')} · {t('leadDetail.followUp')}</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button onClick={handleToggleMark} style={{ height: 38 }}>
            {lead.marked ? t('leads.markUnreviewed') : t('leads.markReviewed')}
          </Button>
        </div>
      </div>

      <div className="detail-grid">
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
              <span className="k">{t('leadDetail.originalPost')}</span>
              <span className="v">
                <a href={lead.sourceUrl} target="_blank" rel="noopener noreferrer">
                  {lead.sourceUrl || 'Reddit'}
                </a>
              </span>
            </div>
            <div className="meta-row">
              <span className="k">{t('leads.author')}</span>
              <span className="v">{lead.author}</span>
            </div>
            <div className="meta-row">
              <span className="k">{t('leads.postedAt')}</span>
              <span className="v num">{lead.postedAt ? dayjs(lead.postedAt).format('YYYY-MM-DD HH:mm') : '-'}</span>
            </div>
            <div className="meta-row">
              <span className="k">{t('leads.collectedAt')}</span>
              <span className="v num">{lead.pushedAt ? dayjs(lead.pushedAt).format('YYYY-MM-DD HH:mm') : '-'}</span>
            </div>
            <div className="meta-row">
              <span className="k">{t('leads.subreddit')}</span>
              <span className="v">{lead.subreddit}</span>
            </div>
          </div>

          <div className="ss-quote">
            {lead.body}
            <div className="src">— {lead.author}</div>
          </div>
        </div>

        <div>
          <div className="ss-card ss-card-pad" style={{ marginBottom: 14 }}>
            <div className="ss-card-title">{t('leadDetail.structuredTags')}</div>
            <div style={{ marginTop: 6 }}>
              <Tag style={{ margin: '2px 4px 2px 0' }}>{lead.category || '-'}</Tag>
              <Tag style={{ margin: '2px 4px 2px 0' }}>{translateOrderScale(lead.orderScale)}</Tag>
              <Tag style={{ margin: '2px 4px 2px 0' }}>{translateNeedType(lead.needType)}</Tag>
              <Tag style={{ margin: '2px 4px 2px 0' }}>{translateRegion(lead.region)}</Tag>
            </div>
            <div className="meta-row" style={{ borderTop: '1px solid var(--line)', marginTop: 12 }}>
              <span className="k" style={{ width: 'auto', marginRight: 12 }}>{t('leads.grade')}</span>
              <span className="v">
                {lead.gradeLabel} — {GRADE_DESC[lead.grade]}
              </span>
            </div>
          </div>

          <div className="ss-card ss-card-pad">
            <div className="ss-card-title">{t('leadDetail.followUp')}</div>
            <textarea
              className="note-box"
              placeholder={t('leads.addNote')}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
              <Button onClick={() => setNote('')}>{t('common.reset')}</Button>
              <Button type="primary" loading={saving} onClick={handleSaveNote}>
                {t('common.save')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadDetailPage;

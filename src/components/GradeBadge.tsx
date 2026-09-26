import React from 'react';
import type { Grade } from '@/types';

interface GradeBadgeProps {
  grade: Grade;
  showLabel?: boolean;
}

const GRADE_META: Record<Grade, { label: string; cls: string }> = {
  S: { label: 'S 级 · 高意向', cls: 's' },
  A: { label: 'A 级 · 中意向', cls: 'a' },
  B: { label: 'B 级 · 低意向', cls: 'b' },
};

const GradeBadge: React.FC<GradeBadgeProps> = ({ grade, showLabel = false }) => {
  const meta = GRADE_META[grade] || GRADE_META.B;
  return (
    <span className={`grade-badge ${meta.cls}`}>
      <span className={`sig-dot ${meta.cls}`} style={{ width: 7, height: 7 }} />
      {showLabel ? meta.label : grade}
    </span>
  );
};

export default GradeBadge;

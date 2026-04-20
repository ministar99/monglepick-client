import { useState, useEffect, useCallback } from 'react';
import * as S from './ReportModal.styled';

const REPORT_REASONS = [
  { value: 'SPAM', label: '스팸 / 도배' },
  { value: 'ABUSE', label: '욕설 / 비방' },
  { value: 'OBSCENE', label: '음란물' },
  { value: 'DEFAMATION', label: '명예훼손' },
  { value: 'ETC', label: '기타' },
];

const CLOSE_MS = 200;

/**
 * 게시글 신고 모달.
 *
 * @param {boolean}  isOpen    - 표시 여부
 * @param {function} onClose   - 닫기 콜백
 * @param {function} onSubmit  - 제출 콜백 ({ reason, detail }) => Promise<void>
 */
export default function ReportModal({ isOpen, onClose, onSubmit }) {
  const [reason, setReason] = useState('');
  const [detail, setDetail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [closing, setClosing] = useState(false);

  /* 열릴 때마다 폼 초기화 */
  useEffect(() => {
    if (isOpen) {
      setReason('');
      setDetail('');
      setClosing(false);
    }
  }, [isOpen]);

  /* 닫기 — 퇴장 애니메이션 후 onClose 호출 */
  const handleClose = useCallback(() => {
    setClosing(true);
    setTimeout(() => {
      onClose();
    }, CLOSE_MS);
  }, [onClose]);

  /* ESC 키로 닫기 */
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, handleClose]);

  /* 스크롤 방지 */
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!reason || submitting) return;
    setSubmitting(true);
    try {
      await onSubmit({ reason, detail: detail.trim() });
      handleClose();
    } finally {
      setSubmitting(false);
    }
  };

  const handleOverlay = (e) => {
    if (e.target === e.currentTarget) handleClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <S.Overlay $closing={closing} onClick={handleOverlay} />
      <S.Container $closing={closing} role="dialog" aria-modal="true" aria-labelledby="report-title">
        <S.Header>
          <S.IconArea>🚨</S.IconArea>
          <S.Title id="report-title">게시글 신고</S.Title>
        </S.Header>

        <S.ReasonList>
          {REPORT_REASONS.map(({ value, label }) => (
            <S.ReasonItem key={value} $selected={reason === value}>
              <input
                type="radio"
                name="report-reason"
                value={value}
                checked={reason === value}
                onChange={() => setReason(value)}
              />
              {label}
            </S.ReasonItem>
          ))}
        </S.ReasonList>

        <S.DetailTextarea
          placeholder="추가 설명이 있으면 입력해주세요 (선택)"
          value={detail}
          onChange={(e) => setDetail(e.target.value)}
          maxLength={500}
        />

        <S.ButtonGroup>
          <S.CancelButton onClick={handleClose} disabled={submitting}>
            취소
          </S.CancelButton>
          <S.SubmitButton
            onClick={handleSubmit}
            disabled={!reason || submitting}
          >
            {submitting ? '신고 중...' : '신고하기'}
          </S.SubmitButton>
        </S.ButtonGroup>
      </S.Container>
    </>
  );
}

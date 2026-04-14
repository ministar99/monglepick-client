/**
 * 게시글 작성/수정 폼 컴포넌트.
 *
 * 제목, 카테고리, 내용을 입력받아 게시글을 생성한다.
 * 수정 모드일 때는 initialData를 useState lazy initializer로 직접 주입한다.
 * (useEffect 내 동기 setState 제거 → ESLint react/no-use-state-in-effect 준수)
 *
 * @param {Object} props
 * @param {function} props.onSubmit - 폼 제출 콜백 ({ title, content, category })
 * @param {Object} [props.initialData] - 수정 시 초기 데이터 (마운트 시 1회만 적용)
 * @param {boolean} [props.isSubmitting=false] - 제출 중 상태
 * @param {function} [props.onCancel] - 취소 버튼 콜백
 */

import { useState } from 'react';
/* 유효성 검사 유틸 — shared/utils에서 가져옴 */
import { validatePostTitle, validateContent } from '../../../shared/utils/validators';
import * as S from './PostForm.styled';

/** 카테고리 선택 옵션 목록 */
const CATEGORY_OPTIONS = [
  { value: 'FREE', label: '자유' },      // ✅ '전체' → '자유'
  { value: 'DISCUSSION', label: '토론' },
  { value: 'RECOMMENDATION', label: '추천' },
  { value: 'NEWS', label: '뉴스' },
];

export default function PostForm({ onSubmit, initialData, isSubmitting = false, onCancel }) {
  /**
   * lazy initializer를 사용해 마운트 시점에 initialData를 직접 읽는다.
   * - initialData가 존재하면 해당 값을 초기값으로 사용
   * - initialData가 없으면 빈 문자열 / 기본 카테고리 사용
   * - useEffect + setState 패턴을 대체하여 불필요한 재렌더링을 제거
   */
  const [title, setTitle] = useState(() => initialData?.title ?? '');
  const [content, setContent] = useState(() => initialData?.content ?? '');
  const [category, setCategory] = useState(() => initialData?.category ?? 'FREE');
  // 필드별 에러 메시지
  const [errors, setErrors] = useState({});

  /**
   * 폼 유효성 검사.
   *
   * @returns {boolean} 유효 여부
   */
  const validateForm = () => {
    const newErrors = {};

    const titleResult = validatePostTitle(title);
    if (!titleResult.isValid) newErrors.title = titleResult.message;

    const contentResult = validateContent(content);
    if (!contentResult.isValid) newErrors.content = contentResult.message;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * 폼 제출 핸들러.
   *
   * @param {Event} e - 폼 제출 이벤트
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    onSubmit({ title: title.trim(), content: content.trim(), category });
  };

  return (
    <S.Wrapper onSubmit={handleSubmit} noValidate>
      {/* 카테고리 선택 */}
      <S.Field>
        <S.Label>카테고리</S.Label>
        <S.Categories>
          {CATEGORY_OPTIONS.map((opt) => (
            <S.CategoryBtn
              key={opt.value}
              type="button"
              $active={category === opt.value}
              onClick={() => setCategory(opt.value)}
              disabled={isSubmitting}
            >
              {opt.label}
            </S.CategoryBtn>
          ))}
        </S.Categories>
      </S.Field>

      {/* 제목 입력 */}
      <S.Field>
        <S.Label htmlFor="post-title">제목</S.Label>
        <S.Input
          id="post-title"
          type="text"
          $error={!!errors.title}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="제목을 입력하세요"
          disabled={isSubmitting}
          maxLength={100}
        />
        {errors.title && <S.ErrorMsg>{errors.title}</S.ErrorMsg>}
      </S.Field>

      {/* 내용 입력 */}
      <S.Field>
        <S.Label htmlFor="post-content">내용</S.Label>
        <S.Textarea
          id="post-content"
          $error={!!errors.content}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="내용을 입력하세요 (10자 이상)"
          disabled={isSubmitting}
          rows={10}
          maxLength={5000}
        />
        {/* 글자 수 표시 */}
        <S.CharCount>
          <span>{content.length} / 5,000</span>
        </S.CharCount>
        {errors.content && <S.ErrorMsg>{errors.content}</S.ErrorMsg>}
      </S.Field>

      {/* 버튼 영역 */}
      <S.Actions>
        {onCancel && (
          <S.CancelBtn
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            취소
          </S.CancelBtn>
        )}
        <S.SubmitBtn
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? '등록 중...' : (initialData ? '수정하기' : '등록하기')}
        </S.SubmitBtn>
      </S.Actions>
    </S.Wrapper>
  );
}

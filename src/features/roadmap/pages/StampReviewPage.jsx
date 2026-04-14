/**
 * 도장깨기 리뷰 작성 페이지.
 *
 * 사용자가 영화를 시청한 후 텍스트 리뷰를 작성하면
 * course_review 테이블에 저장되고, 백엔드에서 AI 유사도 분석을 처리한다.
 * 분석 결과는 이 페이지에서 보여주지 않는다.
 *
 * URL: /stamp/:courseId/review/:movieId
 *
 * @module features/roadmap/pages/StampReviewPage
 */

import { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useModal } from '../../../shared/components/Modal';
import { ROUTES, buildPath } from '../../../shared/constants/routes';
import { completeMovie } from '../api/roadmapApi';
import * as S from './StampReviewPage.styled';

const MAX_LENGTH = 500;

export default function StampReviewPage() {
  const { courseId, movieId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { showAlert } = useModal();

  /* navigate 시 state로 영화 제목/코스 제목 전달받음 */
  const movieTitle = location.state?.movieTitle || '영화';
  const courseTitle = location.state?.courseTitle || '코스';

  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  /** 뒤로가기 — 코스 상세 페이지 */
  const handleBack = () => {
    navigate(buildPath(ROUTES.STAMP_DETAIL, { id: courseId }));
  };

  /** 리뷰 제출 */
  const handleSubmit = async () => {
    if (!reviewText.trim()) {
      showAlert({ title: '안내', message: '리뷰를 작성해 주세요.', type: 'info' });
      return;
    }
    setIsSubmitting(true);
    try {
      await completeMovie(courseId, movieId, reviewText.trim());
      showAlert({
        title: '도장 완료!',
        message: `'${movieTitle}' 영화 도장을 찍었어요!`,
        type: 'success',
      });
      navigate(buildPath(ROUTES.STAMP_DETAIL, { id: courseId }));
    } catch (err) {
      showAlert({
        title: '오류',
        message: err?.message || '저장에 실패했습니다.',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <S.Container>
      <S.BackLink onClick={handleBack}>← 코스로 돌아가기</S.BackLink>

      <S.Header>
        <S.CourseName>{courseTitle}</S.CourseName>
        <S.PageTitle>도장깨기 리뷰</S.PageTitle>
        <S.MovieName>🎬 {movieTitle}</S.MovieName>
      </S.Header>

      <S.Card>
        <S.Label>이 영화를 보고 느낀 점을 자유롭게 적어주세요.</S.Label>
        <S.Hint>
          줄거리, 인상적인 장면, 감독의 연출 방식, 배우의 연기 등
          영화와 관련된 내용이라면 무엇이든 좋아요.
        </S.Hint>
        <S.Textarea
          placeholder="예) 봉준호 감독의 계단 연출이 인상적이었어요. 빈부격차를 공간으로 표현한 방식이 탁월했습니다..."
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          maxLength={MAX_LENGTH}
          autoFocus
        />
        <S.CharCount $warn={reviewText.length > MAX_LENGTH * 0.9}>
          {reviewText.length} / {MAX_LENGTH}
        </S.CharCount>
      </S.Card>

      <S.Actions>
        <S.CancelBtn onClick={handleBack} disabled={isSubmitting}>
          취소
        </S.CancelBtn>
        <S.SubmitBtn
          onClick={handleSubmit}
          disabled={isSubmitting || !reviewText.trim()}
        >
          {isSubmitting ? '저장 중...' : '도장 찍기 완료'}
        </S.SubmitBtn>
      </S.Actions>
    </S.Container>
  );
}

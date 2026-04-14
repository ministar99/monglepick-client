import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getPostDetail, deletePost, togglePostLike } from '../api/communityApi'; // ✅ togglePostLike 추가
import { formatRelativeTime } from '../../../shared/utils/formatters';
import Loading from '../../../shared/components/Loading/Loading';
import CommentSection from '../components/CommentSection';
import useAuthStore from '../../../shared/stores/useAuthStore';
import * as S from './PostDetailPage.styled';

const CATEGORY_LABEL = {
  general: '자유',
  free: '자유',
  FREE: '자유',
  review: '리뷰',
  question: '질문',
  DISCUSSION: '토론',
  RECOMMENDATION: '추천',
  NEWS: '뉴스',
};

export default function PostDetailPage() {
  const { id: postId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ✅ 좋아요 상태
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isLiking, setIsLiking] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadPost() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getPostDetail(postId);
        if (!cancelled) {
          setPost(data);
          setLikeCount(data.likeCount ?? 0); // ✅ 초기 좋아요 수 세팅
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || '게시글을 불러오지 못했습니다.');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    if (postId) loadPost();
    return () => { cancelled = true; };
  }, [postId]);

  const handleDelete = async () => {
    const confirmed = window.confirm('게시글을 삭제하시겠습니까?');
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await deletePost(postId);
      navigate('/community');
    } catch {
      alert('삭제에 실패했습니다. 다시 시도해주세요.');
      setIsDeleting(false);
    }
  };

  // ✅ 좋아요 토글 핸들러
  const handleLike = async () => {
    if (!user) {
      alert('로그인이 필요합니다.');
      return;
    }
    if (isLiking) return;

    setIsLiking(true);
    // 낙관적 업데이트 — API 응답 전에 UI 먼저 반영
    setLiked((prev) => !prev);
    setLikeCount((prev) => liked ? prev - 1 : prev + 1);

    try {
      const result = await togglePostLike(postId);
      // 서버 응답으로 최종 동기화
      setLiked(result.liked);
      setLikeCount(result.likeCount);
    } catch {
      // 실패 시 롤백
      setLiked((prev) => !prev);
      setLikeCount((prev) => liked ? prev + 1 : prev - 1);
      alert('좋아요 처리에 실패했습니다.');
    } finally {
      setIsLiking(false);
    }
  };
  
  const isOwner = user && post && user.id === post.authorId;

  if (isLoading) {
    return (
      <S.PageWrapper>
        <S.PageInner>
          <Loading message="게시글 로딩 중..." />
        </S.PageInner>
      </S.PageWrapper>
    );
  }
  

  if (error || !post) {
    return (
      <S.PageWrapper>
        <S.PageInner>
          <S.BackButton onClick={() => navigate('/community')}>← 목록으로</S.BackButton>
          <S.Status>{error || '게시글을 찾을 수 없습니다.'}</S.Status>
        </S.PageInner>
      </S.PageWrapper>
    );
  }

  return (
    <S.PageWrapper>
      <S.PageInner>
        <S.BackButton onClick={() => navigate('/community')}>← 목록으로</S.BackButton>

        <S.Card>
          <S.Header>
            {post.category && (
              <S.CategoryBadge>
                {CATEGORY_LABEL[post.category] || post.category}
              </S.CategoryBadge>
            )}
            <S.Time>{formatRelativeTime(post.createdAt)}</S.Time>
            {isOwner && (
              <S.DeleteButton onClick={handleDelete} disabled={isDeleting}>
                {isDeleting ? '삭제 중...' : '삭제'}
              </S.DeleteButton>
            )}
          </S.Header>

          <S.Title>{post.title}</S.Title>

          

          <S.AuthorBar>
            <span>작성자</span>
            <strong>{post.author?.nickname || '익명'}</strong>
          </S.AuthorBar>

          <S.Body>{post.content}</S.Body>

          {/* ✅ 좋아요 버튼 */}
          <S.LikeBar>
            <S.LikeButton onClick={handleLike} $liked={liked} disabled={isLiking}>
              {liked ? '❤️' : '🤍'} {likeCount}
            </S.LikeButton>
          </S.LikeBar>
        </S.Card>
        
        {/* 작성자 */}
          <S.AuthorBar>
           <span>작성자</span>
              <strong>{post.author?.nickname || '익명'}</strong>
           <S.ViewCount>👁 {post.viewCount ?? 0}</S.ViewCount>
          </S.AuthorBar>

        <CommentSection postId={postId} />
      </S.PageInner>
    </S.PageWrapper>
  );
}
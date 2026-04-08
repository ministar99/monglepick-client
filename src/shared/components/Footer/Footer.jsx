/**
 * 푸터 컴포넌트.
 *
 * 앱 하단에 4컬럼 구조로 정보를 표시한다 (v2 개편 — 2026-04-08):
 * - 좌:    로고 + 서비스 설명
 * - 중1:   서비스 (AI 추천 도메인 — 채팅/매치 + 검색/커뮤니티)
 * - 중2:   계정 (마이페이지/포인트/결제·구독/고객센터) — 헤더 v2 의 아바타 메뉴와 정합
 * - 우:    팀 정보 (몽글픽 팀, 이메일)
 * - 하단:  구분선 + 저작권
 *
 * 모바일에서는 1컬럼 스택으로 전환된다 (Columns 의 grid-template-columns 미디어 쿼리).
 *
 * 헤더 v2 개편(NAV_ITEMS = AI추천▾/검색/커뮤니티/마이픽▾)과 정합을 맞추기 위해
 * 기존 4-링크 단일 컬럼(홈/검색/커뮤니티/고객센터) → 도메인별 2-컬럼으로 확장.
 *
 * NOTE: "마이 픽" 도메인(추천내역/플레이리스트/로드맵/업적/월드컵)은 의도적으로 Footer 에 노출하지 않는다.
 *   이유: 모두 로그인 필수 + 헤더 NAV "마이 픽" 드롭다운이 1차 진입점 역할을 충분히 하므로
 *         Footer 까지 노출하면 동일 정보가 4중 노출(헤더 NAV/모바일 햄버거/Footer/아바타 메뉴) 되어
 *         단일 진실 원본 원칙에 위배된다.
 */

/* 라우트 경로 상수 — shared/constants에서 가져옴 */
import { ROUTES } from '../../constants/routes';
import * as S from './Footer.styled';

export default function Footer() {
  // 현재 연도 — 저작권 표시에 사용
  const currentYear = new Date().getFullYear();

  return (
    <S.FooterWrapper>
      <S.Inner>
        {/* ── 4컬럼 콘텐츠 영역 ── */}
        <S.Columns>
          {/* 좌측 — 로고 및 서비스 설명 */}
          <S.Brand>
            <S.LogoLink to={ROUTES.HOME}>
              <S.LogoIcon src="/mongle-transparent.png" alt="몽글픽" />
              <S.LogoText>몽글픽</S.LogoText>
            </S.LogoLink>
            <S.Desc>
              AI가 당신의 취향을 분석하여
            </S.Desc>
            <S.Desc>
              딱 맞는 영화를 추천해 드립니다.
            </S.Desc>
          </S.Brand>

          {/*
            중앙1 — 서비스 (헤더 v2 의 NAV 도메인과 정합).
            상단 헤더에서 그대로 가져온 4개 도메인:
              AI 채팅 추천 / 둘이 영화 고르기 / 영화 검색 / 커뮤니티
            "홈" 은 헤더와 마찬가지로 좌측 로고 클릭으로 진입.
          */}
          <S.Nav>
            <S.NavTitle>서비스</S.NavTitle>
            <S.NavLink to={ROUTES.CHAT}>AI 채팅 추천</S.NavLink>
            <S.NavLink to={ROUTES.MATCH}>둘이 영화 고르기</S.NavLink>
            <S.NavLink to={ROUTES.SEARCH}>영화 검색</S.NavLink>
            <S.NavLink to={ROUTES.COMMUNITY}>커뮤니티</S.NavLink>
          </S.Nav>

          {/*
            중앙2 — 계정 (헤더 v2 의 아바타 드롭다운과 정합).
            로그인 여부와 무관하게 모두 노출하되, 비로그인 사용자가 클릭하면
            각 페이지의 PrivateRoute 가드 또는 페이지 내부에서 로그인 모달을 띄운다.
          */}
          <S.Nav>
            <S.NavTitle>계정</S.NavTitle>
            <S.NavLink to={ROUTES.MYPAGE}>마이페이지</S.NavLink>
            <S.NavLink to={ROUTES.POINT}>포인트</S.NavLink>
            <S.NavLink to={ROUTES.PAYMENT}>결제·구독</S.NavLink>
            <S.NavLink to={ROUTES.SUPPORT}>고객센터</S.NavLink>
          </S.Nav>

          {/* 우측 — 팀 정보 */}
          <S.Team>
            <S.NavTitle>팀 정보</S.NavTitle>
            <S.TeamName>몽글픽 팀</S.TeamName>
            <S.TeamEmail>contact@monglepick.com</S.TeamEmail>
          </S.Team>
        </S.Columns>

        {/* ── 구분선 ── */}
        <S.Divider />

        {/* ── 저작권 ── */}
        <S.Copyright>
          <p>&copy; {currentYear} 몽글픽. All rights reserved.</p>
        </S.Copyright>
      </S.Inner>
    </S.FooterWrapper>
  );
}

/**
 * 다이어그램 모달 컴포넌트.
 *
 * 제목, 설명, 그리고 children(SVG 다이어그램 또는 이미지)을 전체화면 모달로 보여준다.
 * ESC 닫기 + 오버레이 클릭 닫기 + body 스크롤 잠금 지원.
 */

import { useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

export default function DiagramModal({ isOpen, onClose, title, desc, children }) {
  /* ESC 키 닫기 + body 스크롤 잠금 */
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <Overlay onClick={onClose}>
      <ModalBox onClick={(e) => e.stopPropagation()}>
        {/* 닫기 버튼 */}
        <CloseBtn onClick={onClose}>&times;</CloseBtn>

        {/* 헤더 */}
        {title && <ModalTitle>{title}</ModalTitle>}
        {desc && <ModalDesc>{desc}</ModalDesc>}

        {/* 다이어그램 본체 — SVG 컴포넌트 또는 이미지 */}
        <ContentArea>
          {children}
        </ContentArea>
      </ModalBox>
    </Overlay>
  );
}

/* ── styled-components ── */

const fadeIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`;
const slideUp = keyframes`
  from { opacity: 0; transform: translateY(30px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  animation: ${fadeIn} 0.2s ease;
`;

const ModalBox = styled.div`
  position: relative;
  width: 100%;
  max-width: 1100px;
  max-height: 90vh;
  overflow-y: auto;
  background: #0d0d18;
  border-radius: 20px;
  border: 1px solid rgba(124, 108, 240, 0.2);
  padding: 36px 28px 28px;
  animation: ${slideUp} 0.3s ease;
  color: #e8e8f0;
  font-family: 'Noto Sans KR', sans-serif;

  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }

  @media (max-width: 600px) {
    padding: 28px 14px 16px;
    max-height: 92vh;
  }
`;

const CloseBtn = styled.button`
  position: sticky;
  top: 0;
  float: right;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #aaa;
  font-size: 26px;
  width: 38px;
  height: 38px;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  z-index: 1;
  &:hover { background: rgba(255, 255, 255, 0.15); color: #fff; }
`;

const ModalTitle = styled.h2`
  font-size: 22px;
  font-weight: 800;
  margin: 0 0 4px;
  color: #e8e8f0;
  font-family: 'Inter', 'Noto Sans KR', sans-serif;
  display: flex;
  align-items: center;
  gap: 10px;

  &::before {
    content: '';
    width: 4px;
    height: 22px;
    border-radius: 2px;
    background: linear-gradient(180deg, #7c6cf0, #06d6a0);
    flex-shrink: 0;
  }
`;

const ModalDesc = styled.p`
  font-size: 13px;
  color: #8888a0;
  margin: 0 0 20px 14px;
`;

const ContentArea = styled.div`
  /* SVG 다이어그램이 가로 스크롤 가능하도록 */
  width: 100%;
  overflow-x: auto;

  /* 내부 이미지 반응형 */
  img {
    width: 100%;
    border-radius: 12px;
    border: 1px solid rgba(124, 108, 240, 0.12);
    display: block;
  }

  /* 내부 SVG 래퍼(Wrap) 최소 너비 해제 — 모달이 충분히 넓으므로 */
  svg {
    min-width: unset;
  }
`;

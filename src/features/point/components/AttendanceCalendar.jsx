/**
 * 출석 체크 섹션 컴포넌트.
 *
 * 출석 통계(연속/총 출석), 보너스 안내, 달력 그리드(좌/우 월 네비게이션 포함),
 * 출석 결과 애니메이션(합계 + 마일스톤 보너스 내역), 출석 체크 버튼을 표시한다.
 *
 * 2026-05-11 개편:
 *   - 월 네비게이션: 좌/우 화살표 + "이번달" 복귀 버튼 (이전달 출석 도장 조회)
 *   - 결과 토스트: 합계 + 내역 분리 (기본 + 7/15/30일 보너스를 ul 로 노출)
 *   - 보너스 안내: 15일 연속 100P 라벨 추가 (시드에는 있던 정책이 UI 에서 누락된 결함 보정)
 *
 * @param {Object} props
 * @param {Object|null} props.attendanceStatus - 출석 현황
 *   {currentStreak, totalDays, checkedToday, monthlyDates: ["YYYY-MM-DD",...], month: "YYYY-MM"}
 * @param {Object|null} props.attendanceResult - 출석 결과
 *   {checkDate, streakCount, totalEarned, baseEarned, bonuses: [{actionType,activityName,points}], ...}
 * @param {number} props.viewYear - 달력에 표시 중인 연도
 * @param {number} props.viewMonth - 달력에 표시 중인 월 (1~12)
 * @param {boolean} props.canGoForward - 다음달 이동 가능 여부 (현재 달이면 false)
 * @param {boolean} props.isViewingCurrentMonth - 현재 달을 보고 있는지 여부 (false면 출석 버튼 비활성)
 * @param {Function} props.onPrevMonth - 이전달 이동 핸들러
 * @param {Function} props.onNextMonth - 다음달 이동 핸들러
 * @param {Function} props.onResetMonth - 이번달 복귀 핸들러
 * @param {boolean} props.isLoading - 로딩 상태
 * @param {boolean} props.isCheckingAttendance - 출석 체크 처리 중
 * @param {Function} props.onCheckAttendance - 출석 체크 핸들러
 */

import Loading from '../../../shared/components/Loading/Loading';
import * as S from './AttendanceCalendar.styled';

/** 요일 라벨 (달력 그리드 헤더용) */
const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

/**
 * 지정한 연/월의 달력 그리드 데이터를 생성한다.
 * 빈 셀(이전/다음 달)을 포함하여 7열 그리드를 구성한다.
 *
 * @param {number} year - 연도
 * @param {number} month - 월 (1-12)
 * @returns {Array<{day: number|null, dateStr: string|null}>} 달력 셀 배열
 */
function generateCalendarGrid(year, month) {
  /* 해당 월의 첫날과 마지막 날 계산 */
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const startDayOfWeek = firstDay.getDay();
  const totalDays = lastDay.getDate();

  const grid = [];

  /* 첫 주의 빈 셀 (이전 달) */
  for (let i = 0; i < startDayOfWeek; i++) {
    grid.push({ day: null, dateStr: null });
  }

  /* 해당 월의 날짜 셀 */
  for (let d = 1; d <= totalDays; d++) {
    const mm = String(month).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    grid.push({ day: d, dateStr: `${year}-${mm}-${dd}` });
  }

  return grid;
}

export default function AttendanceCalendar({
  attendanceStatus,
  attendanceResult,
  viewYear,
  viewMonth,
  canGoForward,
  isViewingCurrentMonth,
  onPrevMonth,
  onNextMonth,
  onResetMonth,
  isLoading,
  isCheckingAttendance,
  onCheckAttendance,
}) {
  /* 표시 대상 달력 데이터 — 부모에서 viewYear/viewMonth 를 받아 그린다 */
  const calendarGrid = generateCalendarGrid(viewYear, viewMonth);

  /* 오늘 문자열 — 현재 달을 보고 있을 때 셀의 "오늘" 표시에 사용 */
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  /* 출석 날짜 Set (빠른 조회용).
   * Backend 가 LocalDate 를 ISO_LOCAL_DATE "YYYY-MM-DD" 로 직렬화하므로 cell.dateStr 과 직접 매칭. */
  const checkedDatesSet = new Set(attendanceStatus?.monthlyDates || []);

  return (
    <section className="point-page__section point-page__attendance">
      <h2 className="point-page__section-title">출석 체크</h2>

      {isLoading ? (
        <Loading message="출석 현황 로딩 중..." />
      ) : (
        <S.AttendanceContent>
          {/* 출석 통계 — viewMonth 와 무관하게 사용자 현재 상태를 표시 */}
          <S.AttendanceStats>
            <S.AttendanceStat>
              <S.AttendanceStatValue>
                {attendanceStatus?.currentStreak || 0}일
              </S.AttendanceStatValue>
              <S.AttendanceStatLabel>연속 출석</S.AttendanceStatLabel>
            </S.AttendanceStat>
            <S.AttendanceStat>
              <S.AttendanceStatValue>
                {attendanceStatus?.totalDays || 0}일
              </S.AttendanceStatValue>
              <S.AttendanceStatLabel>총 출석</S.AttendanceStatLabel>
            </S.AttendanceStat>
          </S.AttendanceStats>

          {/* 보너스 안내 — 실제 정책 시드와 일치 (기본 10P / 7일 50P / 15일 100P / 30일 300P) */}
          <S.BonusInfo>
            <S.BonusTag>기본 10P</S.BonusTag>
            <S.BonusTag $variant="highlight">7일 연속 50P</S.BonusTag>
            <S.BonusTag $variant="highlight">15일 연속 100P</S.BonusTag>
            <S.BonusTag $variant="premium">30일 연속 300P</S.BonusTag>
          </S.BonusInfo>

          {/* 달력 그리드 */}
          <S.Calendar>
            {/* 달력 헤더 — 좌측 이전달 / 중앙 월 텍스트 / 우측 다음달·이번달 복귀 */}
            <S.CalendarHeader>
              <S.MonthNavButton
                type="button"
                onClick={onPrevMonth}
                aria-label="이전 달 보기"
              >
                ‹
              </S.MonthNavButton>

              <S.CalendarMonth>
                {viewYear}년 {viewMonth}월
              </S.CalendarMonth>

              <S.MonthNavRightGroup>
                {/* 이번달 복귀 버튼 — 다른 달을 볼 때만 노출 */}
                {!isViewingCurrentMonth && (
                  <S.MonthResetButton
                    type="button"
                    onClick={onResetMonth}
                    aria-label="이번 달로 돌아가기"
                  >
                    이번 달
                  </S.MonthResetButton>
                )}
                <S.MonthNavButton
                  type="button"
                  onClick={onNextMonth}
                  disabled={!canGoForward}
                  aria-label="다음 달 보기"
                  title={canGoForward ? '다음 달' : '미래 달은 조회할 수 없습니다'}
                >
                  ›
                </S.MonthNavButton>
              </S.MonthNavRightGroup>
            </S.CalendarHeader>

            {/* 요일 라벨 */}
            <S.CalendarWeekdays>
              {WEEKDAY_LABELS.map((label) => (
                <S.CalendarWeekday key={label}>{label}</S.CalendarWeekday>
              ))}
            </S.CalendarWeekdays>

            {/* 날짜 셀 */}
            <S.CalendarGrid>
              {calendarGrid.map((cell, idx) => {
                /* 빈 셀 (이전/다음 달) */
                if (!cell.day) {
                  return <S.CalendarCell key={`empty-${idx}`} $isEmpty />;
                }

                /* 출석 여부 */
                const isChecked = checkedDatesSet.has(cell.dateStr);
                /* 오늘 날짜 — 현재 달을 보고 있을 때만 표시 (이전달 보기에서는 의미 없음) */
                const isToday = isViewingCurrentMonth && cell.dateStr === todayStr;

                return (
                  <S.CalendarCell
                    key={cell.dateStr}
                    $isChecked={isChecked}
                    $isToday={isToday}
                  >
                    <S.CalendarDay>{cell.day}</S.CalendarDay>
                    {isChecked && (
                      <S.CalendarCheckIcon aria-label="출석 완료">
                        &#10003;
                      </S.CalendarCheckIcon>
                    )}
                  </S.CalendarCell>
                );
              })}
            </S.CalendarGrid>
          </S.Calendar>

          {/* 출석 체크 결과 애니메이션 — totalEarned > 0 일 때만 노출 (0P 케이스는 부모에서 에러 토스트 처리) */}
          {attendanceResult && attendanceResult.totalEarned > 0 && (
            <S.AttendanceResult role="status">
              <S.AttendanceResultHeader>
                <S.AttendanceResultPoints>
                  +{attendanceResult.totalEarned}P 적립!
                </S.AttendanceResultPoints>
                <S.AttendanceResultText>
                  {attendanceResult.streakCount}일 연속 출석!
                </S.AttendanceResultText>
              </S.AttendanceResultHeader>

              {/* 내역 — 기본 출석 + 보너스 각각을 라벨/포인트로 분리 */}
              <S.BonusBreakdown>
                <S.BonusBreakdownItem>
                  <S.BonusBreakdownLabel>· 출석 기본</S.BonusBreakdownLabel>
                  <S.BonusBreakdownPoints>
                    {attendanceResult.baseEarned ?? 0}P
                  </S.BonusBreakdownPoints>
                </S.BonusBreakdownItem>
                {(attendanceResult.bonuses || []).map((bonus) => (
                  <S.BonusBreakdownItem key={bonus.actionType}>
                    <S.BonusBreakdownLabel>· {bonus.activityName}</S.BonusBreakdownLabel>
                    <S.BonusBreakdownPoints>{bonus.points}P</S.BonusBreakdownPoints>
                  </S.BonusBreakdownItem>
                ))}
              </S.BonusBreakdown>
            </S.AttendanceResult>
          )}

          {/* 출석 체크 버튼 —
              이전달 보기 모드 / 오늘 이미 출석 / 처리 중 일 때 비활성 */}
          <S.AttendanceButton
            onClick={onCheckAttendance}
            disabled={
              !isViewingCurrentMonth ||
              attendanceStatus?.checkedToday ||
              isCheckingAttendance
            }
          >
            {!isViewingCurrentMonth
              ? '이번 달로 돌아가서 출석'
              : isCheckingAttendance
                ? '출석 체크 중...'
                : attendanceStatus?.checkedToday
                  ? '오늘 출석 완료'
                  : '출석 체크'}
          </S.AttendanceButton>
        </S.AttendanceContent>
      )}
    </section>
  );
}

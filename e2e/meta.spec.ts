import { test, expect, Page } from '@playwright/test'

/**
 * tic-tac-toe-meta 슬라이스 E2E.
 *
 * 커버 시나리오 (spec.md 기준 12개):
 *  1. 초기 표시 — 빈 세션 → "X:0 / Draw:0 / O:0", X 카드 강조
 *  2. 차례에 따른 강조 이동 — X 착수 후 O 카드 강조
 *  3. X 승리 시 X 스코어 +1 + 카운트업 animate-countup
 *  4. 무승부 시 draw +1
 *  5. 다이얼로그 기본 포커스 [취소] + ESC 취소 → 스코어 유지
 *  6. 오버레이 클릭 취소
 *  7. [리셋] 확정 → 0/0/0 + 보드 초기화 + nextStarter=X + 다이얼로그 닫힘
 *  8. 포커스 트랩 — Tab 반복 시 [취소] ↔ [리셋] 순환
 *  9. 새로고침 후 복원 — sessionStorage scores/nextStarter 복원, 보드 초기화
 * 10. 저장 포맷 손상 시 기본값
 * 11. 탭 종료 후 재오픈 — 새 context → sessionStorage 격리
 * 12. 카드 접근 가능 텍스트 "X N승"
 */

const cell = (page: Page, index: number) =>
  page.locator(`[data-testid="game-board"] button[data-index="${index}"]`)

const scoreCardX = (page: Page) => page.locator('[aria-label^="X "]')
const scoreCardDraw = (page: Page) => page.locator('[aria-label^="무승부 "]')
const scoreCardO = (page: Page) => page.locator('[aria-label^="O "]')
const scoreValueX = (page: Page) => scoreCardX(page).locator('[data-role="score-value"]')
const scoreValueDraw = (page: Page) => scoreCardDraw(page).locator('[data-role="score-value"]')
const scoreValueO = (page: Page) => scoreCardO(page).locator('[data-role="score-value"]')

const openDialogBtn = (page: Page) => page.getByRole('button', { name: '스코어 리셋' })
const dialog = (page: Page) => page.getByRole('dialog')
const dialogCancelBtn = (page: Page) => dialog(page).getByRole('button', { name: '취소' })
const dialogConfirmBtn = (page: Page) => dialog(page).getByRole('button', { name: '리셋' })
const overlay = (page: Page) => page.getByTestId('reset-score-dialog-overlay')

async function playSequence(page: Page, indices: number[]) {
  for (const i of indices) {
    await cell(page, i).click()
  }
}

// 공통 시퀀스들
// X 가로 승리: X(0), O(3), X(1), O(4), X(2)
const X_WIN_SEQ = [0, 3, 1, 4, 2]
// 무승부: X:0, O:1, X:2, O:4, X:3, O:5, X:7, O:6, X:8
const DRAW_SEQ = [0, 1, 2, 4, 3, 5, 7, 6, 8]

test.describe('Tic-Tac-Toe Meta E2E', () => {
  // 1. 초기 표시
  test('1. 빈 세션에서 "0/0/0"과 X 카드 강조', async ({ browser }) => {
    const context = await browser.newContext()
    const page = await context.newPage()
    await page.goto('/')
    await expect(page.getByTestId('game-board')).toBeVisible()

    await expect(scoreValueX(page)).toHaveText('0')
    await expect(scoreValueDraw(page)).toHaveText('0')
    await expect(scoreValueO(page)).toHaveText('0')

    // X 카드 active
    await expect(scoreCardX(page)).toHaveAttribute('data-active', 'true')
    await expect(scoreCardO(page)).toHaveAttribute('data-active', 'false')
    await expect(scoreCardDraw(page)).toHaveAttribute('data-active', 'false')
    await context.close()
  })

  // 2. 차례에 따른 강조 이동
  test('2. X 착수 후 O 카드 강조', async ({ browser }) => {
    const context = await browser.newContext()
    const page = await context.newPage()
    await page.goto('/')

    await cell(page, 4).click() // X at center
    await expect(scoreCardO(page)).toHaveAttribute('data-active', 'true')
    await expect(scoreCardX(page)).toHaveAttribute('data-active', 'false')
    await context.close()
  })

  // 3. X 승리 → X 스코어 +1
  test('3. X 승리 시 X 스코어 0→1 & 카운트업 클래스', async ({ browser }) => {
    const context = await browser.newContext()
    const page = await context.newPage()
    await page.goto('/')

    await playSequence(page, X_WIN_SEQ)
    await expect(page.getByRole('status')).toHaveText('X 승리!')
    await expect(scoreValueX(page)).toHaveText('1')
    await expect(scoreValueO(page)).toHaveText('0')
    await expect(scoreValueDraw(page)).toHaveText('0')
    // 카운트업 클래스 (motion-reduce가 아닌 기본 환경)
    await expect(scoreValueX(page)).toHaveClass(/animate-countup/)
    await context.close()
  })

  // 4. 무승부 → draw +1
  test('4. 무승부 시 draw 스코어 0→1', async ({ browser }) => {
    const context = await browser.newContext()
    const page = await context.newPage()
    await page.goto('/')

    await playSequence(page, DRAW_SEQ)
    await expect(page.getByRole('status')).toHaveText('무승부!')
    await expect(scoreValueDraw(page)).toHaveText('1')
    await expect(scoreValueX(page)).toHaveText('0')
    await expect(scoreValueO(page)).toHaveText('0')
    await context.close()
  })

  // 5. 다이얼로그 기본 포커스 [취소] + ESC 취소 → 스코어 유지
  test('5. [스코어 리셋] → 다이얼로그, 기본 포커스 [취소], ESC 취소 → 스코어 유지', async ({
    browser,
  }) => {
    const context = await browser.newContext()
    const page = await context.newPage()
    await page.goto('/')

    // X 승리로 스코어 1/0/0
    await playSequence(page, X_WIN_SEQ)
    await expect(scoreValueX(page)).toHaveText('1')

    await openDialogBtn(page).click()
    await expect(dialog(page)).toBeVisible()
    await expect(dialogCancelBtn(page)).toBeFocused()

    await page.keyboard.press('Escape')
    await expect(dialog(page)).toHaveCount(0)
    // 스코어 유지
    await expect(scoreValueX(page)).toHaveText('1')
    await context.close()
  })

  // 6. 오버레이 클릭 취소
  test('6. 다이얼로그 오버레이 클릭 시 취소 (스코어 유지)', async ({ browser }) => {
    const context = await browser.newContext()
    const page = await context.newPage()
    await page.goto('/')

    await playSequence(page, X_WIN_SEQ)
    await expect(scoreValueX(page)).toHaveText('1')

    await openDialogBtn(page).click()
    await expect(dialog(page)).toBeVisible()

    // 오버레이 좌상단(다이얼로그 박스 바깥)을 클릭
    await overlay(page).click({ position: { x: 5, y: 5 } })
    await expect(dialog(page)).toHaveCount(0)
    await expect(scoreValueX(page)).toHaveText('1')
    await context.close()
  })

  // 7. [리셋] 확정
  test('7. [리셋] 확정 → 스코어 0/0/0 + 보드 초기화 + nextStarter=X + 다이얼로그 닫힘', async ({
    browser,
  }) => {
    const context = await browser.newContext()
    const page = await context.newPage()
    await page.goto('/')

    // 승리 한 번 + 셀 하나 둬서 보드 비우기 전 확인 데이터 확보
    await playSequence(page, X_WIN_SEQ) // X 승리, 스코어 X=1, nextStarter=O
    await expect(scoreValueX(page)).toHaveText('1')

    await openDialogBtn(page).click()
    await expect(dialog(page)).toBeVisible()
    await dialogConfirmBtn(page).click()

    // 다이얼로그 닫힘
    await expect(dialog(page)).toHaveCount(0)
    // 스코어 0/0/0
    await expect(scoreValueX(page)).toHaveText('0')
    await expect(scoreValueDraw(page)).toHaveText('0')
    await expect(scoreValueO(page)).toHaveText('0')
    // 보드 초기화
    for (let i = 0; i < 9; i++) {
      await expect(cell(page, i)).toHaveText('')
    }
    // nextStarter=X → X 카드 강조
    await expect(scoreCardX(page)).toHaveAttribute('data-active', 'true')
    // 다음 클릭이 X
    await cell(page, 0).click()
    await expect(cell(page, 0)).toHaveText('X')
    await context.close()
  })

  // 8. 포커스 트랩
  test('8. 다이얼로그 내 Tab 반복 → [취소] ↔ [리셋] 순환', async ({ browser }) => {
    const context = await browser.newContext()
    const page = await context.newPage()
    await page.goto('/')

    await openDialogBtn(page).click()
    await expect(dialogCancelBtn(page)).toBeFocused()

    await page.keyboard.press('Tab')
    await expect(dialogConfirmBtn(page)).toBeFocused()

    await page.keyboard.press('Tab')
    await expect(dialogCancelBtn(page)).toBeFocused()

    // Shift+Tab 역방향도 동일하게 두 버튼 내 순환
    await page.keyboard.press('Shift+Tab')
    await expect(dialogConfirmBtn(page)).toBeFocused()
    await context.close()
  })

  // 9. 새로고침 후 복원
  test('9. 새로고침 후 sessionStorage에서 scores/nextStarter 복원, 보드 초기화', async ({
    browser,
  }) => {
    const context = await browser.newContext()
    const page = await context.newPage()
    await page.goto('/')

    // X 승리 시나리오 → scores X=1, nextStarter=O
    await playSequence(page, X_WIN_SEQ)
    await expect(scoreValueX(page)).toHaveText('1')
    await expect(page.getByRole('status')).toHaveText('X 승리!')

    // sessionStorage 확인
    const raw = await page.evaluate(() => sessionStorage.getItem('tic-tac-toe/v1'))
    expect(raw).not.toBeNull()
    const parsed = JSON.parse(raw!)
    expect(parsed.scores).toEqual({ X: 1, draw: 0, O: 0 })
    expect(parsed.nextStarter).toBe('O')

    // 새로고침
    await page.reload()
    await expect(page.getByTestId('game-board')).toBeVisible()

    // 스코어 복원
    await expect(scoreValueX(page)).toHaveText('1')
    await expect(scoreValueDraw(page)).toHaveText('0')
    await expect(scoreValueO(page)).toHaveText('0')

    // 보드 초기화
    for (let i = 0; i < 9; i++) {
      await expect(cell(page, i)).toHaveText('')
    }

    // nextStarter=O 복원 → 다음 착수가 O
    await expect(scoreCardO(page)).toHaveAttribute('data-active', 'true')
    await cell(page, 0).click()
    await expect(cell(page, 0)).toHaveText('O')
    await context.close()
  })

  // 10. 저장 포맷 손상 시 기본값
  test('10. sessionStorage 손상 포맷 → 기본값으로 정상 동작', async ({ browser }) => {
    const context = await browser.newContext()
    const page = await context.newPage()
    await page.goto('/')

    // 손상된 문자열 주입
    await page.evaluate(() => sessionStorage.setItem('tic-tac-toe/v1', 'NOT_JSON'))
    await page.reload()
    await expect(page.getByTestId('game-board')).toBeVisible()

    // 기본값 0/0/0
    await expect(scoreValueX(page)).toHaveText('0')
    await expect(scoreValueDraw(page)).toHaveText('0')
    await expect(scoreValueO(page)).toHaveText('0')
    // X 선공
    await expect(scoreCardX(page)).toHaveAttribute('data-active', 'true')
    await cell(page, 0).click()
    await expect(cell(page, 0)).toHaveText('X')

    // 형식은 맞지만 무효한 데이터
    await page.evaluate(() =>
      sessionStorage.setItem(
        'tic-tac-toe/v1',
        JSON.stringify({ scores: { X: -1, draw: 0, O: 'bad' }, nextStarter: 'Z' }),
      ),
    )
    await page.reload()
    await expect(page.getByTestId('game-board')).toBeVisible()
    await expect(scoreValueX(page)).toHaveText('0')
    await expect(scoreValueO(page)).toHaveText('0')
    await expect(scoreValueDraw(page)).toHaveText('0')
    await context.close()
  })

  // 11. 탭 종료 후 재오픈 → 0/0/0 (새 context는 sessionStorage 격리)
  test('11. 새 브라우저 context → sessionStorage 격리되어 0/0/0 초기화', async ({ browser }) => {
    const ctx1 = await browser.newContext()
    const page1 = await ctx1.newPage()
    await page1.goto('/')
    await playSequence(page1, X_WIN_SEQ)
    await expect(scoreValueX(page1)).toHaveText('1')
    await ctx1.close()

    // 새 context = 탭 종료 후 재오픈 시뮬레이션
    const ctx2 = await browser.newContext()
    const page2 = await ctx2.newPage()
    await page2.goto('/')
    await expect(page2.getByTestId('game-board')).toBeVisible()
    await expect(scoreValueX(page2)).toHaveText('0')
    await expect(scoreValueDraw(page2)).toHaveText('0')
    await expect(scoreValueO(page2)).toHaveText('0')
    await ctx2.close()
  })

  // 12. 카드 접근 가능 텍스트 "X N승"
  test('12. 카드 aria-label "X N승", "O N승", "무승부 N"', async ({ browser }) => {
    const context = await browser.newContext()
    const page = await context.newPage()
    await page.goto('/')

    await expect(scoreCardX(page)).toHaveAttribute('aria-label', 'X 0승')
    await expect(scoreCardO(page)).toHaveAttribute('aria-label', 'O 0승')
    await expect(scoreCardDraw(page)).toHaveAttribute('aria-label', '무승부 0')

    // X 승리 → "X 1승"
    await playSequence(page, X_WIN_SEQ)
    await expect(scoreCardX(page)).toHaveAttribute('aria-label', 'X 1승')
    await expect(scoreCardO(page)).toHaveAttribute('aria-label', 'O 0승')
    await expect(scoreCardDraw(page)).toHaveAttribute('aria-label', '무승부 0')
    await context.close()
  })
})

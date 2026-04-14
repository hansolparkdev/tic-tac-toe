import { test, expect, Page } from '@playwright/test'

/**
 * 셀 인덱스(0~8)를 기반으로 해당 셀 버튼 locator 반환.
 * 인덱스 = row*3 + col (0-based).
 */
const cell = (page: Page, index: number) =>
  page.locator(`[data-testid="game-board"] button[data-index="${index}"]`)

const board = (page: Page) => page.getByTestId('game-board')
const winningLine = (page: Page) => page.getByTestId('winning-line')
const status = (page: Page) => page.getByRole('status')
const resetBtn = (page: Page) => page.getByRole('button', { name: '다시하기' })

/**
 * 여러 셀에 순차적으로 클릭 착수. X/O는 내부 차례 로직에 따라 결정됨.
 */
async function playSequence(page: Page, indices: number[]) {
  for (const i of indices) {
    await cell(page, i).click()
  }
}

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await expect(board(page)).toBeVisible()
})

test.describe('Tic-Tac-Toe E2E', () => {
  // 시나리오 1: 빈 셀 착수
  test('1. 빈 셀 클릭 → X 렌더, 차례 O로 전환', async ({ page }) => {
    // 초기: X 차례 표시
    await expect(page.locator('text=차례')).toBeVisible()
    // (1,1) = index 4 클릭
    await cell(page, 4).click()
    await expect(cell(page, 4)).toHaveText('X')
    // aria-label 갱신 확인
    await expect(cell(page, 4)).toHaveAttribute('aria-label', /2행 2열, X/)
    // 차례 O
    const turn = page.locator('div').filter({ hasText: /^O차례$/ }).first()
    await expect(turn).toBeVisible()
  })

  // 시나리오 2: 점유 셀 무시
  test('2. 점유 셀 재클릭 → 상태 불변', async ({ page }) => {
    await cell(page, 4).click() // X at (1,1)
    await expect(cell(page, 4)).toHaveText('X')
    // O 차례에서 (1,1) 재클릭
    await cell(page, 4).click()
    // 여전히 X 유지
    await expect(cell(page, 4)).toHaveText('X')
    // O 차례가 유지되어야 함
    const turn = page.locator('div').filter({ hasText: /^O차례$/ }).first()
    await expect(turn).toBeVisible()
    // 다른 셀들은 비어있음
    await expect(cell(page, 0)).toHaveText('')
  })

  // 시나리오 3: 가로 승리
  test('3. X 가로 승리 → 승리 메시지, 승리 라인, 이후 클릭 무시', async ({ page }) => {
    // X (0,0)=0, O (1,0)=3, X (0,1)=1, O (1,1)=4, X (0,2)=2 → X 가로 승리
    await playSequence(page, [0, 3, 1, 4, 2])
    await expect(status(page)).toHaveText('X 승리!')
    await expect(winningLine(page)).toBeVisible()
    // 승리 후 빈 셀(7) 클릭 시도 → 보드 불변
    await cell(page, 7).click()
    await expect(cell(page, 7)).toHaveText('')
    await expect(status(page)).toHaveText('X 승리!')
  })

  // 시나리오 4: 무승부
  test('4. 무승부 → "무승부!" 메시지, winningLine 없음', async ({ page }) => {
    // 시퀀스: 0,4,8,1,7,2,3,5,6  → 3연속 없이 9칸 채움
    // X:0, O:4, X:8, O:1, X:7, O:2, X:3, O:5, X:6
    // 승리 조건 확인:
    //   row0: X(0),O(1),O(2) → no
    //   row1: X(3),O(4),O(5) → no
    //   row2: X(6),X(7),X(8) → X 승리! 잘못된 시퀀스. 재구성 필요.
    // 안전한 무승부 시퀀스: X:0, O:1, X:2, O:4, X:3, O:5, X:7, O:6, X:8
    //   board: X O X X O O O X X
    //   row0: X,O,X  row1: X,O,O  row2: O,X,X
    //   col0: X,X,O col1: O,O,X col2: X,O,X
    //   diag: X,O,X  anti: X,O,O → draw
    await playSequence(page, [0, 1, 2, 4, 3, 5, 7, 6, 8])
    await expect(status(page)).toHaveText('무승부!')
    await expect(winningLine(page)).toHaveCount(0)
  })

  // 시나리오 5: 리사이즈 → 좌표 재계산
  test('5. 리사이즈 시 승리 라인 재그림', async ({ page }) => {
    await playSequence(page, [0, 3, 1, 4, 2]) // X 가로 승리
    await expect(winningLine(page)).toBeVisible()
    const initialBox = await winningLine(page).boundingBox()
    expect(initialBox).not.toBeNull()
    // 보드 크기는 80vw & max 360px. 360px 미만이 되도록 viewport 축소 (360 / 0.8 = 450 미만).
    await page.setViewportSize({ width: 400, height: 700 })
    // 재계산 대기 (ResizeObserver)
    await page.waitForTimeout(200)
    const newBox = await winningLine(page).boundingBox()
    expect(newBox).not.toBeNull()
    // 너비가 달라져야 함
    expect(newBox!.width).not.toBe(initialBox!.width)
    // 라인은 여전히 보임
    await expect(winningLine(page)).toBeVisible()
  })

  // 시나리오 6: 패자 선공
  test('6. X 승리 후 다시하기 → 보드 비움, O 선공', async ({ page }) => {
    await playSequence(page, [0, 3, 1, 4, 2]) // X 승리
    await expect(status(page)).toHaveText('X 승리!')
    await resetBtn(page).click()
    // 보드 전부 비어있음
    for (let i = 0; i < 9; i++) {
      await expect(cell(page, i)).toHaveText('')
    }
    // O 선공
    const turn = page.locator('div').filter({ hasText: /^O차례$/ }).first()
    await expect(turn).toBeVisible()
    // 실제로 다음 클릭이 O
    await cell(page, 0).click()
    await expect(cell(page, 0)).toHaveText('O')
  })

  // 시나리오 7: 무승부 후 선공 교대
  test('7. 무승부 후 다시하기 → 직전 선공의 반대(O)가 선공', async ({ page }) => {
    // 무승부 시퀀스 (직전 라운드 선공 X)
    await playSequence(page, [0, 1, 2, 4, 3, 5, 7, 6, 8])
    await expect(status(page)).toHaveText('무승부!')
    await resetBtn(page).click()
    // O 선공
    const turn = page.locator('div').filter({ hasText: /^O차례$/ }).first()
    await expect(turn).toBeVisible()
    await cell(page, 0).click()
    await expect(cell(page, 0)).toHaveText('O')
  })

  // 시나리오 8: 종료 후 클릭 → 보드 불변, 다시하기 pulse
  test('8. 종료 상태에서 빈 셀 클릭 → 보드 불변, 다시하기 pulse', async ({ page }) => {
    await playSequence(page, [0, 3, 1, 4, 2]) // X 승리
    await expect(status(page)).toHaveText('X 승리!')
    // 빈 셀 클릭
    await cell(page, 5).click()
    await expect(cell(page, 5)).toHaveText('')
    // 다시하기 버튼의 pulse 클래스 활성
    await expect(resetBtn(page)).toHaveClass(/animate-pulse-ring/)
  })

  // 시나리오 9: 화살표 + Enter 키보드 조작
  test('9. ArrowRight 후 Enter → (0,1)에 X 착수', async ({ page }) => {
    // (0,0)=index 0 포커스 (초기 focusIndex=0)
    await cell(page, 0).focus()
    await expect(cell(page, 0)).toBeFocused()
    // ArrowRight → (0,1)=index 1로 포커스 이동
    await page.keyboard.press('ArrowRight')
    await expect(cell(page, 1)).toBeFocused()
    // Enter → 착수
    await page.keyboard.press('Enter')
    await expect(cell(page, 1)).toHaveText('X')
  })

  // 시나리오 10: aria-label 갱신
  test('10. (1,1) aria-label 갱신 (비어있음 → X)', async ({ page }) => {
    await expect(cell(page, 4)).toHaveAttribute('aria-label', '2행 2열, 비어있음')
    await cell(page, 4).click()
    await expect(cell(page, 4)).toHaveAttribute('aria-label', '2행 2열, X')
  })

  // 시나리오 11: prefers-reduced-motion + 승리 라인
  test('11. reduced-motion 환경에서 승리 라인 즉시 렌더', async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: 'reduce' })
    const page = await context.newPage()
    await page.goto('/')
    await expect(page.getByTestId('game-board')).toBeVisible()
    const start = Date.now()
    await playSequence(page, [0, 3, 1, 4, 2]) // X 가로 승리
    await expect(page.getByTestId('winning-line')).toBeVisible()
    const elapsed = Date.now() - start
    // 플레이 전체 시간이 아닌, 라인 렌더 직후 애니메이션 없이 즉시 보여야 함.
    // 라인 svg 내부 line이 animate-draw-line 클래스를 가지고 있으나 motion-reduce:animate-none 병기.
    const lineEl = page.locator('[data-testid="winning-line"] line')
    const animationName = await lineEl.evaluate(
      (el) => window.getComputedStyle(el).animationName,
    )
    // reduced-motion일 때 애니메이션이 none이 되거나 매우 짧아야 함
    expect(['none', '']).toContain(animationName)
    // sanity: elapsed 로그용. 단위 테스트성 검증은 이미 완료.
    expect(elapsed).toBeGreaterThan(0)
    await context.close()
  })
})

import type { EngineInterface, Register, SessionRateLimit } from 'claude-code'

const DAY_MS = 86_400_000
const DAILY_PERCENT = 100 / 7

const showPace = async ($: EngineInterface, limits: SessionRateLimit[]) => {
  const limit = limits.find(({ kind }) => kind === 'seven_day')

  if (!limit?.resetsAt) {
    return
  }

  const daysLeft = (Date.parse(limit.resetsAt) - (await $.clock.now())) / DAY_MS
  const day = Math.min(7, Math.max(1, Math.ceil(7 - daysLeft)))
  const usedToday = limit.percentUsed - (day - 1) * DAILY_PERCENT
  const percent = Math.max(0, Math.round((usedToday / DAILY_PERCENT) * 100))

  $.ui.status(`${percent}%`)
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await showPace($, (await $.session.usage()).rateLimits)

    return next(e)
  })

  on('session.measure', async ($, e, next) => {
    await showPace($, e.rateLimits)

    return next(e)
  })
}

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
  const budget = day * DAILY_PERCENT

  $.ui.status(`${limit.percentUsed}% / ${budget.toFixed(1)}% today`)
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

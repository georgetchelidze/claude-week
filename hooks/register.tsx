import type { EngineInterface, Register, SessionRateLimit } from 'claude-code'

const DAY_MS = 86_400_000
const DAILY_PERCENT = 100 / 7
const LAST_READING = 'lastReading'

type Reading = { percentUsed: number; resetsAt: string }

const isReading = (value: unknown): value is Reading =>
  typeof value === 'object' &&
  value !== null &&
  typeof (value as Reading).percentUsed === 'number' &&
  typeof (value as Reading).resetsAt === 'string'

const showPace = async ($: EngineInterface, reading: Reading, mark: string) => {
  const daysLeft = (Date.parse(reading.resetsAt) - (await $.clock.now())) / DAY_MS

  if (daysLeft <= 0) {
    return
  }

  const day = Math.min(7, Math.max(1, Math.ceil(7 - daysLeft)))
  const left = day * DAILY_PERCENT - reading.percentUsed

  $.ui.status(
    left >= 0
      ? `${mark}${left.toFixed(1)}% left`
      : `${mark}${(-left).toFixed(1)}% over`,
  )
}

const showFresh = async ($: EngineInterface, limits: SessionRateLimit[]) => {
  const limit = limits.find(({ kind }) => kind === 'seven_day')

  if (!limit?.resetsAt) {
    return false
  }

  const reading = { percentUsed: limit.percentUsed, resetsAt: limit.resetsAt }
  await $.store.set(LAST_READING, reading)
  await showPace($, reading, '')

  return true
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    if (!(await showFresh($, (await $.session.usage()).rateLimits))) {
      const saved = await $.store.get(LAST_READING)

      if (isReading(saved)) {
        await showPace($, saved, '~')
      }
    }

    return next(e)
  })

  on('session.measure', async ($, e, next) => {
    await showFresh($, e.rateLimits)

    return next(e)
  })
}

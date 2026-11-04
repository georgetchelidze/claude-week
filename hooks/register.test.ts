import { expect, test } from 'claude-code/testing'

// Wednesday 10:00, with the week resetting the following Monday at midnight.
const NOW = Date.parse('2026-11-04T10:00:00Z')
const RESETS_AT = '2026-11-09T00:00:00Z'

const statusAfter = async ($: any, on: any, rateLimits: object[]) => {
  const shown: (string | undefined)[] = []
  on('clock.now', () => ({ value: NOW }))
  on('ui.status', (_: unknown, e: any) => {
    shown.push(e.text)

    return { value: undefined }
  })
  on('session.measure', (_: unknown, e: any) => ({ changed: e.changed }))
  await $.session.measure({ context: {}, rateLimits, changed: [] })

  return shown
}

test('the status shows used against today\'s budget', async ($, on) => {
  expect(
    await statusAfter($, on, [
      { kind: 'five_hour', percentUsed: 1, resetsAt: RESETS_AT },
      { kind: 'seven_day', percentUsed: 32, resetsAt: RESETS_AT },
    ]),
  ).toEqual(['32% / 42.9% today'])
})

test('the last day allows the whole limit', async ($, on) => {
  expect(
    await statusAfter($, on, [
      { kind: 'seven_day', percentUsed: 90, resetsAt: '2026-11-05T00:00:00Z' },
    ]),
  ).toEqual(['90% / 100.0% today'])
})

test('no weekly reading leaves the status alone', async ($, on) => {
  expect(
    await statusAfter($, on, [{ kind: 'five_hour', percentUsed: 1, resetsAt: RESETS_AT }]),
  ).toEqual([])
})

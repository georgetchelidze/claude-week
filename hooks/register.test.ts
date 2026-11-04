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

const WEEKLY = (percentUsed: number) => [
  { kind: 'five_hour', percentUsed: 1, resetsAt: RESETS_AT },
  { kind: 'seven_day', percentUsed, resetsAt: RESETS_AT },
]

test('the status maps today\'s slice of the week onto 0 to 100', async ($, on) => {
  expect(await statusAfter($, on, WEEKLY(31))).toEqual(['17%'])
})

test('overspending carries over past 100', async ($, on) => {
  expect(await statusAfter($, on, WEEKLY(45))).toEqual(['115%'])
})

test('leftovers from earlier days hold it at 0', async ($, on) => {
  expect(await statusAfter($, on, WEEKLY(25))).toEqual(['0%'])
})

test('the last day runs up to the whole limit', async ($, on) => {
  expect(
    await statusAfter($, on, [
      { kind: 'seven_day', percentUsed: 100, resetsAt: '2026-11-05T00:00:00Z' },
    ]),
  ).toEqual(['100%'])
})

test('no weekly reading leaves the status alone', async ($, on) => {
  expect(
    await statusAfter($, on, [{ kind: 'five_hour', percentUsed: 1, resetsAt: RESETS_AT }]),
  ).toEqual([])
})

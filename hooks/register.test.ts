import { expect, test } from 'claude-code/testing'

// Wednesday 10:00, with the week resetting the following Monday at midnight.
const NOW = Date.parse('2026-11-04T10:00:00Z')
const RESETS_AT = '2026-11-09T00:00:00Z'

const statusAfter = async ($: any, on: any, rateLimits: object[]) => {
  const shown: (string | undefined)[] = []
  on('clock.now', () => ({ value: NOW }))
  on('store.set', () => ({ value: undefined }))
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

test('the status shows what is left of the budget so far', async ($, on) => {
  expect(await statusAfter($, on, WEEKLY(34))).toEqual(['8.9% left'])
})

test('past the budget it says how far over', async ($, on) => {
  expect(await statusAfter($, on, WEEKLY(45))).toEqual(['2.1% over'])
})

test('leftovers stay in the amount left', async ($, on) => {
  expect(await statusAfter($, on, WEEKLY(10))).toEqual(['32.9% left'])
})

test('the next day adds its share', async ($, on) => {
  expect(
    await statusAfter($, on, [
      { kind: 'seven_day', percentUsed: 34, resetsAt: '2026-11-08T00:00:00Z' },
    ]),
  ).toEqual(['23.1% left'])
})

test('no weekly reading leaves the status alone', async ($, on) => {
  expect(
    await statusAfter($, on, [{ kind: 'five_hour', percentUsed: 1, resetsAt: RESETS_AT }]),
  ).toEqual([])
})

const startWith = async ($: any, on: any, saved: unknown, rateLimits: object[] = []) => {
  const shown: (string | undefined)[] = []
  const stored: unknown[] = []
  on('clock.now', () => ({ value: NOW }))
  on('ui.status', (_: unknown, e: any) => {
    shown.push(e.text)

    return { value: undefined }
  })
  on('store.get', () => ({ value: saved }))
  on('store.set', (_: unknown, e: any) => {
    stored.push(e.value)

    return { value: undefined }
  })
  on('session.usage', () => ({
    value: { startedAt: 0, context: { window: 200_000 }, rateLimits },
  }))
  on('session.start', (_: unknown, e: any) => ({ cwd: e.cwd }))
  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })

  return { shown, stored }
}

test('a new session shows the saved reading, marked', async ($, on) => {
  const { shown } = await startWith($, on, { percentUsed: 34, resetsAt: RESETS_AT })

  expect(shown).toEqual(['~8.9% left'])
})

test('a saved reading past its reset shows nothing', async ($, on) => {
  const { shown } = await startWith($, on, {
    percentUsed: 34,
    resetsAt: '2026-11-02T00:00:00Z',
  })

  expect(shown).toEqual([])
})

test('nothing saved shows nothing', async ($, on) => {
  const { shown } = await startWith($, on, undefined)

  expect(shown).toEqual([])
})

test('a fresh reading wins and is saved', async ($, on) => {
  const fresh = { percentUsed: 34, resetsAt: RESETS_AT }
  const { shown, stored } = await startWith(
    $,
    on,
    { percentUsed: 1, resetsAt: RESETS_AT },
    [{ kind: 'seven_day', ...fresh }],
  )

  expect(shown).toEqual(['8.9% left'])
  expect(stored).toEqual([fresh])
})

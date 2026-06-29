import { test } from '@japa/runner'
import { DateTime } from 'luxon'
import { DEFAULT_ELECTION_MESSAGE, getElectionModeState } from '#helpers/election_mode'

test.group('Election mode', () => {
  test('stays inactive when disabled', ({ assert }) => {
    const state = getElectionModeState(
      { election_mode_enabled: 'false', election_start: '2026-01-01', election_end: '2026-12-31' },
      DateTime.fromISO('2026-06-01')
    )

    assert.isFalse(state.active)
  })

  test('activates inclusively inside the configured window', ({ assert }) => {
    const state = getElectionModeState(
      { election_mode_enabled: 'true', election_start: '2026-06-01', election_end: '2026-06-30' },
      DateTime.fromISO('2026-06-30T23:00:00')
    )

    assert.isTrue(state.active)
  })

  test('does not activate outside the configured window', ({ assert }) => {
    const state = getElectionModeState(
      { election_mode_enabled: 'true', election_start: '2026-07-01', election_end: '2026-07-31' },
      DateTime.fromISO('2026-06-30')
    )

    assert.isFalse(state.active)
  })

  test('uses the legal default message when none is configured', ({ assert }) => {
    const state = getElectionModeState({ election_mode_enabled: 'true', election_message: '' })

    assert.equal(state.message, DEFAULT_ELECTION_MESSAGE)
  })
})

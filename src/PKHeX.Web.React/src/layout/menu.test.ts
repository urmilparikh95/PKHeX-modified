import { describe, expect, it } from 'vitest'
import type { SaveCapability, SaveSummary } from '@pkhex-everywhere/engine'
import { menuEntries } from './menu'

const allCapabilities: SaveCapability[] = ['legality', 'autoLegality', 'encounters', 'showdown', 'events']

const save = (hasEvents: boolean, capabilities = allCapabilities): SaveSummary => ({
  fileName: 'emerald.sav',
  version: 'Emerald',
  generation: 3,
  hasEvents,
  hasMysteryGift: false,
  format: null,
  capabilities,
  statsApproximate: false,
})

const labels = (entries: ReturnType<typeof menuEntries>) => entries.map((entry) => entry.label)

describe('menuEntries', () => {
  it('shows only Home and Save without a save', () => {
    expect(labels(menuEntries(null))).toEqual(['Home', 'Save'])
  })

  it('shows Party, Pokemon Box and Items with a save', () => {
    expect(labels(menuEntries(save(false)))).toEqual(['Home', 'Party', 'Pokemon Box', 'Items', 'Save'])
  })

  it('shows Events when the save has events', () => {
    expect(labels(menuEntries(save(true)))).toEqual(['Home', 'Party', 'Pokemon Box', 'Items', 'Events', 'Save'])
  })

  it('hides Events when the save lacks the capability', () => {
    expect(labels(menuEntries(save(true, ['legality'])))).toEqual(['Home', 'Party', 'Pokemon Box', 'Items', 'Save'])
  })
})

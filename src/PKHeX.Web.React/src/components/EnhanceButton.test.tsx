import { act } from 'react'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { App } from 'antd'
import { EngineError } from '@pkhex-everywhere/engine'
import { render } from '../testing/render'
import { EnhanceButton } from './EnhanceButton'

const loaded = vi.hoisted(() => ({ generation: 4 }))

vi.mock('@pkhex-everywhere/react', async (original) => ({
  ...(await original<typeof import('@pkhex-everywhere/react')>()),
  useLoadedGame: () => ({ game: { generation: loaded.generation } }),
}))

beforeAll(() => {
  vi.stubGlobal('matchMedia', () => ({ matches: false, addEventListener: () => {}, removeEventListener: () => {} }))
})

const flush = () => act(async () => {})

function renderButton(generation: number, onEnhance: () => Promise<string>) {
  loaded.generation = generation
  render(
    <App>
      <EnhanceButton onEnhance={onEnhance} />
    </App>,
  )
  return document.querySelector('button') as HTMLButtonElement
}

describe('EnhanceButton', () => {
  it('is labelled as Generation 4 only', () => {
    expect(renderButton(4, async () => '').textContent).toContain('Enhance PKMN (Gen 4 only)')
  })

  it('is disabled outside Generation 4', () => {
    const onEnhance = vi.fn(async () => '')
    const button = renderButton(5, onEnhance)

    expect(button.disabled).toBe(true)
    button.click()
    expect(onEnhance).not.toHaveBeenCalled()
  })

  it('runs the enhance and reports what it did', async () => {
    const onEnhance = vi.fn(async () => '12 Pokémon in your party and boxes.')
    const button = renderButton(4, onEnhance)

    await act(async () => button.click())
    await flush()

    expect(onEnhance).toHaveBeenCalledOnce()
    expect(document.body.textContent).toContain('12 Pokémon in your party and boxes.')
  })

  it('shows an engine error instead of throwing', async () => {
    const button = renderButton(4, async () => {
      throw new EngineError('not-supported', 'Enhance only works on Generation 4 Pokémon.')
    })

    await act(async () => button.click())
    await flush()

    expect(document.body.textContent).toContain('Enhance only works on Generation 4 Pokémon.')
  })
})

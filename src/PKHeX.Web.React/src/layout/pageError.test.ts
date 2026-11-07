import { describe, expect, it } from 'vitest'
import { EngineError, type SaveVersion } from '@pkhex-everywhere/engine'
import { issueLink, toPageError } from './pageError'

const emerald: SaveVersion = { version: 'Emerald', versionId: 3, generation: 'Gen3', generationId: 3, formatId: null }

function boom() {
  const error = new TypeError('Cannot read properties of undefined')
  error.stack = 'TypeError: Cannot read properties of undefined\n    at Party (party.tsx:1:1)'
  return error
}

describe('page errors', () => {
  it('gives every error a tracking id', () => {
    const first = toPageError(boom())
    const second = toPageError(boom())

    expect(first.id).toMatch(/^[0-9a-f-]{36}$/)
    expect(second.id).not.toBe(first.id)
    expect(first).toMatchObject({ type: 'TypeError', message: 'Cannot read properties of undefined' })
  })

  it('describes values that are not errors', () => {
    expect(toPageError('Boom')).toMatchObject({ type: 'string', message: 'Boom', stack: '' })
  })

  it('links to a new bug issue with the id, game and error', () => {
    const error = toPageError(boom(), 'b7a9f2c4')

    const url = new URL(issueLink(error, emerald)!)

    expect(url.origin + url.pathname).toBe('https://github.com/arleypadua/PKHeX.Everywhere/issues/new')
    expect(url.searchParams.get('title')).toBe('Error on PKHeX.Web: Cannot read properties of undefined')
    expect(url.searchParams.get('labels')).toBe('bug')
    expect(url.searchParams.get('body')).toBe(
      [
        '# Error on PKHeX.Web',
        '',
        '* **Id**: b7a9f2c4',
        '* **Game version**: Emerald',
        '* **Generation**: Gen3',
        '* **Save format**: ',
        '## Type',
        '```',
        'TypeError',
        '```',
        '',
        '## Message',
        '```',
        'Cannot read properties of undefined',
        '```',
        '',
        '## Stack trace',
        '```',
        'TypeError: Cannot read properties of undefined\n    at Party (party.tsx:1:1)',
        '```',
      ].join('\n'),
    )
  })

  it('leaves the game blank in the link when none is loaded', () => {
    const body = new URL(issueLink(toPageError(boom(), 'id'), null)!).searchParams.get('body')

    expect(body).toContain('* **Game version**: \n* **Generation**: \n* **Save format**: \n')
  })

  it('has no link for a Pokémon format the save does not support', () => {
    const error = toPageError(new EngineError('unexpected', 'PKM Format needs to be PK3 when setting to this Save File.'))

    expect(error.unsupportedFormat).toBe(true)
    expect(issueLink(error, emerald)).toBeNull()
  })
})

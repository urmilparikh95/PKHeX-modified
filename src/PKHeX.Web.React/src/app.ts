import { createEngine } from '@pkhex-everywhere/engine'
import { readEnabledFormats } from './enabledFormats'

export const engine = createEngine()

const enabledFormats = readEnabledFormats(location.search, () => localStorage)

// Every route waits for this, so the formats are enabled before the first load.
export const formatsEnabled = engine.ready.then(() =>
  Promise.all(
    enabledFormats.map((id) =>
      engine.game.enableFormat(id).catch((error) => console.error(`Couldn't enable the save format '${id}'.`, error)),
    ),
  ),
)

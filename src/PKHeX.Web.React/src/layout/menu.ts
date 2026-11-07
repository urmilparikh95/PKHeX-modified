import type { SaveSummary } from '@pkhex-everywhere/engine'
import { supports } from '../capabilities'
import { routes } from '../routes'

export type MenuIcon = 'home' | 'team' | 'inbox' | 'shop' | 'flag' | 'save'

export interface MenuEntry {
  route: string
  label: string
  icon?: MenuIcon
}

export function menuEntries(game: SaveSummary | null): MenuEntry[] {
  return [
    { route: routes.home, label: 'Home', icon: 'home' },
    ...(game
      ? [
          { route: routes.party, label: 'Party', icon: 'team' as const },
          { route: routes.box, label: 'Pokemon Box', icon: 'inbox' as const },
          { route: routes.items, label: 'Items', icon: 'shop' as const },
          ...(game.hasEvents && supports(game, 'events') ? [{ route: routes.events, label: 'Events', icon: 'flag' as const }] : []),
        ]
      : []),
    { route: routes.save, label: 'Save', icon: 'save' },
  ]
}

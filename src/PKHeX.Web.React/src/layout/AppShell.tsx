import { useCallback, useEffect, type ReactNode } from 'react'
import { App, ConfigProvider, theme as antdTheme } from 'antd'
import { BrowserRouter, Navigate, Route, Routes, useParams, useSearchParams } from 'react-router'
import type { EngineError, SaveCapability } from '@pkhex-everywhere/engine'
import { EngineProvider, RequireGame, useLoadedGame } from '@pkhex-everywhere/react'
import { engine } from '../app'
import { useSupports } from '../hooks/useSupports'
import { useTheme } from '../host'
import BoxPage from '../pages/box/BoxPage'
import CreditsPage from '../pages/static/CreditsPage'
import EncountersPage from '../pages/encounters/EncountersPage'
import EventsPage from '../pages/events/EventsPage'
import HomePage from '../pages/home/HomePage'
import ItemsPage from '../pages/items/ItemsPage'
import LoadPage from '../pages/load/LoadPage'
import PartyPage from '../pages/party/PartyPage'
import PokemonClonePage from '../pages/pokemon-editor/PokemonClonePage'
import PokemonEditorPage from '../pages/pokemon-editor/PokemonEditorPage'
import SettingsPage from '../pages/settings/SettingsPage'
import { routes } from '../routes'
import { AutoLoadDemo } from './AutoLoadDemo'
import { GameJourney } from './GameJourney'
import { journey } from './journey'
import { LoadLayout } from './LoadLayout'
import { MainLayout } from './MainLayout'

const fontFamily = `'Pokemon GB', "Lucida Console", sans-serif`

function useTitle(title: string | undefined) {
  useEffect(() => {
    if (!title) return
    const previous = document.title
    document.title = title
    return () => {
      document.title = previous
    }
  }, [title])
}

interface PageProps {
  title?: string
  requiresSave?: boolean
  capability?: SaveCapability
  children: ReactNode
}

function Page({ title, requiresSave, capability, children }: PageProps) {
  useTitle(title)
  const page = capability ? <RequireCapability capability={capability}>{children}</RequireCapability> : children
  return requiresSave ? <RequireGame>{page}</RequireGame> : page
}

function RequireCapability({ capability, children }: { capability: SaveCapability; children: ReactNode }) {
  return useSupports(capability) ? children : <p role="alert">This save doesn't support this page.</p>
}

const integer = (value: string | null) => (value && /^-?\d+$/.test(value) ? Number(value) : null)

function HomeRoute() {
  const { game } = useLoadedGame()
  const redirect = journey.redirectsToLoad(game !== null)
  useEffect(() => journey.reachedHome(), [])
  return redirect ? <Navigate to={routes.load} replace /> : <HomePage />
}

function LoadRoute({ autoLoad }: { autoLoad: boolean }) {
  const { game } = useLoadedGame()
  if (game) return <Navigate to={routes.home} replace />
  return (
    <>
      {autoLoad && <AutoLoadDemo />}
      <LoadPage />
    </>
  )
}

function EncountersRoute() {
  const { game } = useLoadedGame()
  const [query] = useSearchParams()
  if (!game) return <Navigate to={routes.load} replace />
  return <EncountersPage version={integer(query.get('version'))} species={integer(query.get('species'))} />
}

function PokemonEditorRoute() {
  const { source, id } = useParams()
  return <PokemonEditorPage source={source} id={id} />
}

function PokemonCloneRoute() {
  const { source, id } = useParams()
  return <PokemonClonePage source={source} id={id} />
}

function AppRoutes({ autoLoad }: { autoLoad: boolean }) {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<Page title="Home"><HomeRoute /></Page>} />
        <Route path="party" element={<Page title="Party" requiresSave><PartyPage /></Page>} />
        <Route path="pokemon-box" element={<Page title="Pokemon Box" requiresSave><BoxPage /></Page>} />
        <Route path="items" element={<Page title="Items" requiresSave><ItemsPage /></Page>} />
        <Route path="events" element={<Page title="Events" requiresSave capability="events"><EventsPage /></Page>} />
        <Route path="pokemon/search-encounter" element={<Page title="Encounters" capability="encounters"><EncountersRoute /></Page>} />
        <Route path="pokemon/:source/:id" element={<Page title="Pokemon" requiresSave><PokemonEditorRoute /></Page>} />
        <Route path="pokemon/:source/:id/clone" element={<Page title="Clone Pokemon" requiresSave><PokemonCloneRoute /></Page>} />
        <Route path="save" element={<Page title="Save"><LoadPage /></Page>} />
        <Route path="settings" element={<Page title="Settings"><SettingsPage /></Page>} />
        <Route path="credits" element={<Page title="Credits"><CreditsPage /></Page>} />
        <Route path="*" element={<Page title="Not found"><p role="alert">Sorry, there's nothing at this address.</p></Page>} />
      </Route>
      <Route element={<LoadLayout />}>
        <Route path="load" element={<LoadRoute autoLoad={autoLoad} />} />
      </Route>
    </Routes>
  )
}

function PageBackground() {
  const { token } = antdTheme.useToken()
  useEffect(() => {
    document.documentElement.style.background = token.colorBgLayout
    document.body.style.background = token.colorBgLayout
  }, [token.colorBgLayout])
  return null
}

function NotifyingEngineProvider({ children }: { children: ReactNode }) {
  const { notification } = App.useApp()
  const onUnhandledError = useCallback(
    (error: EngineError) => notification.error({ title: 'Something went wrong', description: error.message }),
    [notification],
  )
  return (
    <EngineProvider engine={engine} onUnhandledError={onUnhandledError}>
      {children}
    </EngineProvider>
  )
}

export function AppShell({ autoLoad }: { autoLoad: boolean }) {
  const theme = useTheme()

  return (
    <ConfigProvider
      theme={{
        algorithm: theme === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: { fontFamily },
      }}
    >
      <PageBackground />
      <App component={false}>
        <NotifyingEngineProvider>
            <BrowserRouter basename={import.meta.env.BASE_URL}>
              <GameJourney />
              <AppRoutes autoLoad={autoLoad} />
            </BrowserRouter>
        </NotifyingEngineProvider>
      </App>
    </ConfigProvider>
  )
}

import { createRoot } from 'react-dom/client'
import { AppShell } from './layout/AppShell'

export function start({ autoLoad }: { autoLoad: boolean }) {
  createRoot(document.getElementById('root')!).render(<AppShell autoLoad={autoLoad} />)
}

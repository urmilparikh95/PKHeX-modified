import { use, type ReactNode } from 'react'
import { formatsEnabled } from '../app'

export function WhenFormatsEnabled({ children }: { children: ReactNode }) {
  use(formatsEnabled)
  return children
}

import { useState } from 'react'
import { App, Button, Tooltip } from 'antd'
import { EngineError } from '@pkhex-everywhere/engine'
import { useLoadedGame } from '@pkhex-everywhere/react'

interface EnhanceButtonProps {
  onEnhance: () => Promise<string>
  label?: string
  gen4Only?: boolean
}

export function EnhanceButton({ onEnhance, label = 'Enhance PKMN', gen4Only = true }: EnhanceButtonProps) {
  const { game } = useLoadedGame()
  const { notification } = App.useApp()
  const [busy, setBusy] = useState(false)
  const supported = !gen4Only || game?.generation === 4

  const enhance = async () => {
    setBusy(true)
    try {
      notification.success({ title: 'Done', description: await onEnhance() })
    } catch (error) {
      if (!(error instanceof EngineError)) throw error
      notification.error({ title: "Couldn't finish", description: error.message })
    } finally {
      setBusy(false)
    }
  }

  const button = (
    <Button loading={busy} disabled={!supported} onClick={() => void enhance()}>
      {gen4Only ? `${label} (Gen 4 only)` : label}
    </Button>
  )
  if (supported) return button
  return (
    <Tooltip title="Load a Generation 4 save to use this.">
      <span>{button}</span>
    </Tooltip>
  )
}

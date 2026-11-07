import { EllipsisOutlined } from '@ant-design/icons'
import { Button, Dropdown, Space } from 'antd'
import { draftHandle } from '@pkhex-everywhere/engine'
import { useEngine } from '@pkhex-everywhere/react'
import { downloadFile } from '../../host'

interface SaveDropdownProps {
  onSave: () => void
}

export function SaveDropdown({ onSave }: SaveDropdownProps) {
  const engine = useEngine()

  const exportFile = async () => {
    const { bytes, fileName } = await engine.pokemon.export(draftHandle)
    downloadFile(bytes, fileName)
  }

  return (
    <Space.Compact>
      <Button type="primary" onClick={onSave}>
        Save
      </Button>
      <Dropdown
        trigger={['click']}
        menu={{
          items: [
            { key: 'export', label: 'Export *.pk', onClick: () => void exportFile() },
          ],
        }}
      >
        <Button type="primary" icon={<EllipsisOutlined />} aria-label="More actions" />
      </Dropdown>
    </Space.Compact>
  )
}

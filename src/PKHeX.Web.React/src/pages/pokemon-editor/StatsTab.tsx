import { Alert, Button, Descriptions, Flex, Grid, InputNumber, Space } from 'antd'
import type { DescriptionsProps } from 'antd'
import { draftHandle, type StatPatch, type StatValues } from '@pkhex-everywhere/engine'
import { useLoadedGame, useQuery } from '@pkhex-everywhere/react'
import { gameName, statsAreApproximate } from '../../capabilities'
import { useDraft } from './useDraft'

type Stat = keyof StatValues

const stats: { key: Stat; label: string }[] = [
  { key: 'health', label: 'HP' },
  { key: 'attack', label: 'Attack' },
  { key: 'defense', label: 'Defense' },
  { key: 'specialAttack', label: 'Special Attack' },
  { key: 'specialDefense', label: 'Special Defense' },
  { key: 'speed', label: 'Speed' },
]

const total = (values: StatValues) => stats.reduce((sum, stat) => sum + values[stat.key], 0)

export function StatsTab() {
  const { details, submit } = useDraft()
  const { game } = useLoadedGame()
  const screens = Grid.useBreakpoint()
  const layout = screens.sm ? 'horizontal' : 'vertical'

  const inputs: { key: 'ivs' | 'evs' | 'avs'; label: string; values: StatValues | null }[] = [
    { key: 'ivs', label: 'IV', values: details.ivs },
    { key: 'evs', label: 'EV', values: details.evs },
    { key: 'avs', label: 'AV', values: details.avs },
  ]

  const statItems = (stat: { key: Stat; label: string }): DescriptionsProps['items'] => [
    { key: 'stat', label: 'Stat', children: details.stats[stat.key] },
    ...inputs.flatMap(({ key, label, values }) =>
      values === null
        ? []
        : [
            {
              key,
              label,
              children: (
                <InputNumber
                  aria-label={`${stat.label} ${label}`}
                  min={0}
                  value={values[stat.key]}
                  onChange={(value) => value !== null && submit({ [key]: { [stat.key]: value } as StatPatch })}
                />
              ),
            },
          ],
    ),
  ]

  const totalItems: DescriptionsProps['items'] = [
    { key: 'stat', label: 'Stat', children: total(details.stats) },
    ...inputs.flatMap(({ key, label, values }) => (values === null ? [] : [{ key, label, children: total(values) }])),
  ]

  return (
    <Flex vertical gap={20}>
      {game && statsAreApproximate(game) && (
        <Alert
          type="info"
          showIcon
          title={`Stats are approximate. They use the original games' base stats, which ${gameName(game)} may change.`}
        />
      )}
      {stats.map((stat) => (
        <Descriptions key={stat.key} bordered size="small" layout={layout} title={stat.label} items={statItems(stat)} />
      ))}
      <Descriptions bordered size="small" layout={layout} title="Total" items={totalItems} />
      {details.hiddenPower && (
        <Descriptions
          bordered
          size="small"
          layout={layout}
          title="Hidden Power"
          items={[
            { key: 'type', label: 'Type', children: details.hiddenPower.type },
            ...(details.hiddenPower.power === null
              ? []
              : [{ key: 'power', label: 'Power', children: details.hiddenPower.power }]),
          ]}
        />
      )}
      {details.combatPower !== null && (
        <Descriptions
          bordered
          size="small"
          layout={layout}
          title="Extra"
          items={[
            {
              key: 'combatPower',
              label: 'CP',
              children: (
                <Space>
                  <InputNumber
                    aria-label="CP"
                    min={0}
                    value={details.combatPower}
                    onChange={(combatPower) => combatPower !== null && submit({ combatPower })}
                  />
                  <Button onClick={() => submit({ combatPower: details.calculatedCombatPower })}>Re-calculate</Button>
                </Space>
              ),
            },
          ]}
        />
      )}
    </Flex>
  )
}

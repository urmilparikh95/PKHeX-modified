import { Flex, Layout } from 'antd'
import { Link } from 'react-router'
import { applicationName } from '../constants'
import { routes } from '../routes'

export function Footer() {
  return (
    <Layout.Footer style={{ textAlign: 'center' }}>
      <p>{applicationName} - edit pokemon save files.</p>
      <Flex wrap justify="center" gap="8px 16px">
        <Link to={routes.credits}>Credits</Link>
      </Flex>
    </Layout.Footer>
  )
}

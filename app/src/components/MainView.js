import React from 'react'
import { GU, useViewport } from '@1hive/1hive-ui'

import Footer from './Footer'
import Header from './Header'
import Layout from './Layout'

function MainView({ children }) {
  const { below } = useViewport()
  const compactMode = below('medium')

  return (
    <div
      css={`
        display: flex;
        flex-direction: column;
        min-height: 100vh;
      `}
    >
      <Header compact={compactMode} />

      <div
        css={`
          flex: 1;
          ${!compactMode && `transform: translateY(-${4 * GU}px);`}
        `}
      >
        <div
          css={`
            margin-bottom: ${2 * GU}px;
          `}
        >
          <Layout>{children}</Layout>
        </div>
      </div>
      <Footer compact={compactMode} />
    </div>
  )
}

export default MainView

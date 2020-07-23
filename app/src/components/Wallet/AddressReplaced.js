import React from 'react'
import { GU, IdentityBadge, useTheme } from '@1hive/1hive-ui'

function AddressReplaced({ addrs }) {
  const theme = useTheme()

  return (
    <div
      css={`
        padding: ${3 * GU}px;
        text-align: center;
        color: ${theme.contentSecondary};
      `}
    >
      <div>This BrightID connected address has been replaced. </div>
      <div
        css={`
          margin-top: ${2 * GU}px;
        `}
      >
        You must use <IdentityBadge entity={addrs[0]} /> to interact with the
        facuet
      </div>
    </div>
  )
}

export default AddressReplaced

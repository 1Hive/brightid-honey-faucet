import React from 'react'
import { GU, IdentityBadge, useTheme } from '@1hive/1hive-ui'

function AddressReplaced({ addrs }) {
  const theme = useTheme()

  const primaryAddress = addrs.length > 0 ? addrs[0] : ''

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
        You must use <IdentityBadge entity={primaryAddress} /> to interact with
        the faucet
      </div>
    </div>
  )
}

export default AddressReplaced

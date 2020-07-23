import React from 'react'
import {
  Box,
  EthIdenticon,
  GU,
  IconConnect,
  shortenAddress,
  textStyle,
  useTheme,
} from '@1hive/1hive-ui'
import BrightIdConnect from './BrightIdConnect'
import ClaimAndRegister from './ClaimAndRegister'
import LoadingRing from '../LoadingRing'
import TokenBalance from './TokenBalance'

import { useWallet } from '../../providers/Wallet'
import { useBrightIdVerification } from '../../hooks/useBrightIdVerification'
import userIconGray from '../../assets/userIconGray.svg'

function Wallet({ onClaimAndOrRegister }) {
  const { account } = useWallet()

  return (
    <Box padding={0}>
      {!account ? (
        <div
          css={`
            display: flex;
            padding: ${3 * GU}px;
            flex-direction: column;
            text-align: center;
            align-items: center;
          `}
        >
          <div
            css={`
              border-radius: 50%;
              background: #f9f9f9;
              width: ${7 * GU}px;
              height: ${7 * GU}px;
            `}
          >
            <IconConnect
              css={`
                color: #d7d7d7;
              `}
              size="large"
            />
          </div>
          <span
            css={`
              ${textStyle('body1')};
              margin-top: ${2 * GU}px;
            `}
          >
            To start please connect your account
          </span>
        </div>
      ) : (
        <AccountConnected
          account={account}
          onClaimAndOrRegister={onClaimAndOrRegister}
        />
      )}
    </Box>
  )
}

function AccountConnected({ account, onClaimAndOrRegister }) {
  const theme = useTheme()
  // TODO - error handling on this api call
  const {
    addressExist,
    signature,
    userAddresses,
    userSponsored,
    userVerified,
    fetching,
  } = useBrightIdVerification(account)

  return (
    <div>
      <div
        css={`
          display: flex;
          align-items: center;
          justify-content: center;
          padding: ${3 * GU}px;
          border-bottom: 1px solid ${theme.border};
        `}
      >
        <EthIdenticon
          address={account}
          radius={100}
          scale={1.7}
          css={`
            margin-right: ${1.5 * GU}px;
          `}
        />
        <span
          css={`
            ${textStyle('title4')}
          `}
        >
          {shortenAddress(account, 4)}
        </span>
      </div>
      <TokenBalance />
      <div>
        {fetching ? (
          <div
            css={`
              padding: ${3 * GU}px;
              display: flex;
              flex-direction: column;
              align-items: center;
            `}
          >
            <LoadingRing />
          </div>
        ) : (
          <div>
            {(() => {
              if (!userSponsored) {
                return (
                  <BrightIdConnect
                    account={account}
                    addressExist={addressExist}
                  />
                )
              }

              if (!userVerified) {
                return (
                  <div
                    css={`
                      padding: ${3 * GU}px;
                      display: flex;
                      text-align: center;
                      flex-direction: column;
                      align-items: center;
                    `}
                  >
                    <img src={userIconGray} width={5 * GU} height={5 * GU} />
                    <span
                      css={`
                        margin-top: ${2 * GU}px;
                        color: ${theme.surfaceContentSecondary};
                        ${textStyle('body2')};
                      `}
                    >
                      You are yet to be identified as a unique individual by
                      BrightID
                    </span>
                  </div>
                )
              }

              return (
                <ClaimAndRegister
                  addrs={userAddresses}
                  onClaimAndOrRegister={onClaimAndOrRegister}
                  signature={signature}
                />
              )
            })()}
          </div>
        )}
      </div>
    </div>
  )
}

export default Wallet

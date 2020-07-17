import React from 'react'
import styled from 'styled-components'
import {
  Box,
  GU,
  textStyle,
  Link,
  useTheme,
  useViewport,
} from '@1hive/1hive-ui'
import FaucetInfo from '../components/FaucetInfo'
// import { useAppState } from '../providers/AppState'
import { bigNum } from '../lib/math-utils'

import distributionIcon from '../assets/distributionIcon.svg'
import tokensAvailableIcon from '../assets/tokensAvailableIcon.svg'
import tokenIcon from '../assets/tokenIcon.svg'
import userIcon from '../assets/userIcon.svg'
import honeyIsMoneyIcon from '../assets/honeyIsMoneyIcon.svg'
import freeMoneyIcon from '../assets/freeMoneyIcon.svg'
import howItWorksIcon from '../assets/howItWorksIcon.svg'

const MainScreen = React.memo(({ isLoading }) => {
  // const { config } = useAppState()
  const theme = useTheme()
  const { below } = useViewport()
  const compact = below('medium')

  if (isLoading) {
    return null
  }

  return (
    <div
      css={`
        display: flex;
        flex-direction: row;
      `}
    >
      <Box
        css={`
          height: fit-content;
          width: 100%;
        `}
      >
        <div
          css={`
            display: flex;
            flex-direction: row;
            justify-content: space-between;
          `}
        >
          <div>
            <h5
              css={`
                ${textStyle('title3')};
                color: ${theme.surfaceContent};
              `}
            >
              Honey is Money
            </h5>
            <div
              css={`
                width:${compact ? 'auto' : `${57 * GU}px;`}
                margin-top: ${4 * GU}px;
                line-height: 16px;
                ${textStyle('body2')};
              `}
            >
              <span>
                <Link href="https://blog.1hive.org/honey/">
                  Honey is 1Hive's community currency
                </Link>
                . Similar to Bitcoin or Ether, Honey is issued and distributed
                by an economic protocol, and can be freely exchanged on a
                distributed ledger. When you hold Honey you are betting on the
                Honey economy growing over time, and you can help realize that
                goal by staking your Honey on distribution proposals which
                allocate Honey issuance towards the initiatives that help 1Hive
                thrive.
              </span>
            </div>
          </div>

          <img
            src={honeyIsMoneyIcon}
            width={20 * GU}
            height={20 * GU}
            alt=""
            css={`
              flex-shrink: 0;
            `}
          />
        </div>
        <LineSeparator border={theme.border} />
        <div
          css={`
            display: flex;
            flex-direction: row;
            justify-content: space-between;
          `}
        >
          <img
            src={freeMoneyIcon}
            width={20 * GU}
            height={20 * GU}
            alt=""
            css={`
              flex-shrink: 0;
            `}
          />
          <div>
            <h5
              css={`
                ${textStyle('title3')};
                color: ${theme.surfaceContent};
              `}
            >
              Free Money?
            </h5>
            <div
              css={`
                width:${compact ? 'auto' : `${57 * GU}px;`}
                margin-top: ${4 * GU}px;
                line-height: 16px;
                ${textStyle('body2')};
              `}
            >
              <span>
                This faucet allows you to claim Honey just for being a human and
                showing interest in 1Hive... but if Honey is Money, why would we
                want to just give it out like that? The answer is that having a
                broad and inclusive distribution of Honey is critical for the
                1Hive community to grow and decentralize. In the early days of
                Ethereum and Bitcoin, it was possible to mine Ether and Bitcoin
                on a personal computer and this resulted in a broad and
                inclusive distribution. In principal this faucet operates on the
                same basic premise, but instead of proof of work we rely on
                <Link href="https://www.brightid.org/">BrightID</Link> for sybil
                resistance.
              </span>
            </div>
          </div>
        </div>
        <LineSeparator border={theme.border} />
        <div
          css={`
            display: flex;
            flex-direction: row;
            justify-content: space-between;
          `}
        >
          <div>
            <h5
              css={`
                ${textStyle('title3')};
                color: ${theme.surfaceContent};
              `}
            >
              How it works
            </h5>
            <div
              css={`
                width:${compact ? 'auto' : `${57 * GU}px;`}
                margin-top: ${4 * GU}px;
                line-height: 16px;
                ${textStyle('body2')};
              `}
            >
              <span>
                This faucet is funded through honey distribution proposals,
                anyone can make a proposal to top up the faucet with more honey,
                and if there is sufficient support it will happen. The faucet
                will allocate a portion of its balance to all registered users
                each period, when a user claims their share they will
                automatically be registered for the next periods distribution.
                If you forget to claim your share, it will be forfeited and you
                will need to re-register before claiming again, so be sure to
                check back in and claim your share each period! In order to
                register you'll first need to validate your account using
                BrightID, BrightID is a decentralized protocol for proof of
                uniqueness. If you've never used it before you'll need to
                download it, make a few connections, and get verified. We can
                help! just hop on the{' '}
                <Link href="https://discord.gg/GFWC5c">1Hive Discord</Link> 🍯
                and say Hi!
              </span>
            </div>
          </div>

          <img
            src={howItWorksIcon}
            width={20 * GU}
            height={20 * GU}
            alt=""
            css={`
              flex-shrink: 0;
            `}
          />
        </div>
      </Box>
      <div
        css={`
          margin-left: ${2 * GU}px;
        `}
      >
        <FaucetInfo
          amount={bigNum(0)}
          decimals={0}
          text="Registered users"
          icon={userIcon}
        />
        <FaucetInfo
          amount={bigNum(0)}
          decimals={0}
          text="Total distributed"
          icon={distributionIcon}
        />
        <FaucetInfo
          amount={bigNum(0)}
          decimals={0}
          text="Currently available"
          icon={tokensAvailableIcon}
        />
        <FaucetInfo
          amount={bigNum(0)}
          decimals={0}
          text="Amount paid per user this period"
          icon={tokenIcon}
        />
      </div>
    </div>
  )
})

const LineSeparator = styled.div`
  height: 1px;
  border: 0.5px solid ${({ border }) => border};
  margin: ${6 * GU}px 0;
`

export default MainScreen

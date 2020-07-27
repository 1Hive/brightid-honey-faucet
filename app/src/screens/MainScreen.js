import React from 'react'
import styled from 'styled-components'
import { Box, GU, textStyle, Link, useTheme, useLayout } from '@1hive/1hive-ui'

import honeyIsMoneyIcon from '../assets/honeyIsMoneyIcon.svg'
import freeMoneyIcon from '../assets/freeMoneyIcon.svg'
import howItWorksIcon from '../assets/howItWorksIcon.svg'
import Metrics from '../components/Metrics'

const MainScreen = React.memo(({ isLoading }) => {
  const theme = useTheme()
  const { name: layout } = useLayout()
  const compact = layout === 'small' || layout === 'medium'

  if (isLoading) {
    return null
  }

  return (
    <div
      css={`
        display: grid;
        grid-template-columns: ${compact ? '1fr' : `1fr ${33 * GU}px`};
        grid-gap: ${2 * GU}px;
      `}
    >
      <Box
        css={`
          height: fit-content;
          width: 100%;
        `}
      >
        <Content
          compact={layout === 'small'}
          icon={honeyIsMoneyIcon}
          title="Honey is Money"
          reverse
          text={
            <span>
              <Link href="https://blog.1hive.org/honey/">
                Honey is 1Hive's community currency
              </Link>
              . Similar to Bitcoin or Ether, Honey is issued and distributed by
              an economic protocol, and can be freely exchanged on a distributed
              ledger. When you hold Honey you are betting on the Honey economy
              growing over time, and you can help realize that goal by staking
              your Honey on distribution proposals which allocate Honey issuance
              towards the initiatives that help 1Hive thrive.
            </span>
          }
        />
        <LineSeparator border={theme.border} />

        <Content
          compact={layout === 'small'}
          icon={freeMoneyIcon}
          title="Free Money?"
          text={
            <span>
              This faucet allows you to claim Honey just for being a human and
              showing interest in 1Hive... but if Honey is Money, why would we
              want to just give it out like that? The answer is that having a
              broad and inclusive distribution of Honey is critical for the
              1Hive community to grow and decentralize. In the early days of
              Ethereum and Bitcoin, it was possible to mine Ether and Bitcoin on
              a personal computer and this resulted in a broad and inclusive
              distribution. In principal this faucet operates on the same basic
              premise, but instead of proof of work we rely on
              <Link href="https://www.brightid.org/">BrightID</Link> for sybil
              resistance.
            </span>
          }
        />
        <LineSeparator border={theme.border} />
        <Content
          compact={layout === 'small'}
          icon={howItWorksIcon}
          title="How it works"
          reverse
          text={
            <span>
              This faucet is funded through{' '}
              <Link href="https://1hive.org/#/">
                Honey distribution proposals
              </Link>
              , anyone can make a proposal to top up the faucet with more Honey,
              and if there is sufficient support it will happen. The faucet will
              allocate a portion of its balance to all registered users each
              period, when a user claims their share they will automatically be
              registered for the next periods distribution. If you forget to
              claim your share, it will be forfeited and you will need to
              re-register before claiming again, so be sure to check back in and
              claim your share each period!
              <br />
              <br />
              <span>
                In order to register you'll first need to validate your account
                using BrightID, BrightID is a decentralized protocol for proof
                of uniqueness. If you've never used it before you'll need to
                download it, make a few connections, and get verified. We can
                help! Just hop on the{' '}
                <Link href="https://discord.gg/sBzpmxK">1Hive Discord</Link> 🍯
                and say Hi!
              </span>
            </span>
          }
        />
      </Box>
      <Metrics />
    </div>
  )
})

function Content({ compact, icon, title, text, reverse }) {
  const theme = useTheme()

  return (
    <div
      css={`
        display: flex;
        flex-direction: ${compact
          ? 'column'
          : `row${reverse ? '-reverse' : ''}`};
        justify-content: space-between;
        align-items: ${compact ? 'center' : 'flex-start'};
      `}
    >
      <img
        src={icon}
        width={20 * GU}
        height={20 * GU}
        alt=""
        css={`
          flex-shrink: 0;
          margin: ${compact ? `${3 * GU}px 0` : '0'};
        `}
      />
      <div
        css={`
          ${compact ? '' : `margin-${reverse ? 'left' : 'right'}: ${4 * GU}px`};
        `}
      >
        <h5
          css={`
            ${textStyle('title3')};
            color: ${theme.surfaceContent};
            text-align: ${compact ? 'center' : 'inherit'};
          `}
        >
          {title}
        </h5>
        <div
          css={`
            width: ${compact ? 'auto' : `${57 * GU}px;`};
            margin-top: ${2 * GU}px;
            line-height: ${2 * GU}px;
            ${textStyle('body2')};
          `}
        >
          {text}
        </div>
      </div>
    </div>
  )
}

const LineSeparator = styled.div`
  height: 1px;
  border-bottom: 0.5px solid ${({ border }) => border};
  margin: ${6 * GU}px 0;
`

export default MainScreen

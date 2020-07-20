import { useEffect, useState } from 'react'
import { useContractReadOnly } from './useWeb3Contracts'

import { getNetwork } from '../networks'
import brightIdFaucetAbi from '../abi/BrightIdFaucet.json'

export function useIndividualPayout(currentPeriod) {
  const faucetAddress = getNetwork().faucet
  const faucetContract = useContractReadOnly(faucetAddress, brightIdFaucetAbi)
  const [payout, setPayout] = useState(null)

  useEffect(() => {
    let cancelled = false
    let timeoutId

    if (!faucetContract || !currentPeriod) {
      return
    }

    const pollTokenBalance = async () => {
      try {
        const resultPayout = await faucetContract.getPeriodIndividualPayout(
          currentPeriod
        )

        if (!cancelled) {
          if (!resultPayout.eq(payout)) {
            setPayout(resultPayout)
          }
        }
      } catch (err) {
        console.error(`Error fetching balance: ${err} retrying...`)
      }

      if (!cancelled) {
        setTimeout(pollTokenBalance, 3000)
      }
    }

    pollTokenBalance()

    return () => {
      cancelled = true
      clearTimeout(timeoutId)
    }
  }, [currentPeriod, faucetContract, payout])

  return payout
}

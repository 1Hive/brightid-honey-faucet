import { useEffect, useState } from 'react'
import { bigNum } from '../lib/math-utils'
import { useContractReadOnly } from './useWeb3Contracts'

import tokenAbi from '../abi/ERC20.json'

export function useTokenBalance(account, token) {
  const tokenContract = useContractReadOnly(token?.id, tokenAbi)
  const [balance, setBalance] = useState(bigNum(-1))

  useEffect(() => {
    let cancelled = false
    let timeoutId

    if (!tokenContract) {
      return
    }

    const pollTokenBalance = async () => {
      try {
        const resultBalance = await tokenContract.balanceOf(account)

        if (!cancelled) {
          if (!resultBalance.eq(balance)) {
            setBalance(resultBalance)
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
  }, [account, balance, tokenContract, token])

  return balance
}

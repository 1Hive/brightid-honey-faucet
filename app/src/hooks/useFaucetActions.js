import { useCallback } from 'react'
import { getNetwork } from '../networks'
import { useContract } from './useWeb3Contracts'

import { parseUnits } from '../lib/math-utils'
import { formatBytes32String, sanitizeSignature } from '../lib/web3-utils'
import { CONTEXT_ID } from '../constants'
import brightIdFaucetAbi from '../abi/BrightIdFaucet.json'

const GAS_LIMIT = 500000
const GAS_PRICE = parseUnits('2', 'gwei')

function useFaucetContract() {
  const faucetAddress = getNetwork().faucet
  return useContract(faucetAddress, brightIdFaucetAbi)
}

function useFaucetActions() {
  const faucetContract = useFaucetContract()

  const claimAndOrRegister = useCallback(
    (addrs, timestamp, signature) => {
      const context = formatBytes32String(CONTEXT_ID)
      const sig = sanitizeSignature(signature)

      return faucetContract.claimAndOrRegister(
        context,
        addrs,
        timestamp,
        sig.v,
        sig.r,
        sig.s,
        { gasLimit: GAS_LIMIT, gasPrice: GAS_PRICE }
      )
    },
    [faucetContract]
  )
  const claim = useCallback(() => {
    return faucetContract.claim()
  }, [faucetContract])

  return { claimAndOrRegister, claim }
}

export default useFaucetActions

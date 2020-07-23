import { useCallback } from 'react'
import { getNetwork } from '../networks'
import { useContract } from './useWeb3Contracts'

import { formatBytes32String, sanitizeSignature } from '../lib/web3-utils'
import { CONTEXT_ID } from '../constants'
import brightIdFaucetAbi from '../abi/BrightIdFaucet.json'

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
        { gasLimit: 500000 }
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

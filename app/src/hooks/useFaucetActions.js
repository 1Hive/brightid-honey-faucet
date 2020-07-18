import { useCallback } from 'react'
import { getNetwork } from '../networks'
import { useContract } from './useWeb3Contracts'

import { keccak256, sanitizeSignature } from '../lib/web3-utils'
import { BRIGHTID_CONTEXT } from '../constants'
import brightIdFaucetAbi from '../abi/BrightIdFaucet.json'

function useFaucetContract() {
  const faucetAddress = getNetwork().faucet
  return useContract(faucetAddress, brightIdFaucetAbi)
}

function useFaucetActions() {
  const faucetContract = useFaucetContract()

  const claimAndOrRegister = useCallback(
    (addrs, signature) => {
      const context = keccak256(BRIGHTID_CONTEXT)
      const sig = sanitizeSignature(signature)

      return faucetContract.claimAndOrRegister(
        context,
        addrs,
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

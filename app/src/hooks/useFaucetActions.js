import { useCallback } from 'react'
import { getNetwork } from '../networks'
import { useContract } from './useWeb3Contracts'

import { keccak256 } from '../lib/web3-utils'
import { BRIGHTID_CONTEXT } from '../constants'
import brightIdFaucetAbi from '../abi/BrightIdFaucet.json'

function useFaucetContract() {
  const faucetAddress = getNetwork().faucet
  return useContract(faucetAddress, brightIdFaucetAbi)
}

function useFaucetActions() {
  const faucetContract = useFaucetContract()

  const claimAndOrRegister = useCallback(
    (addrs, v, r, s) => {
      const context = keccak256(BRIGHTID_CONTEXT)
      return faucetContract.claimAndOrRegister(context, addrs, v, r, s)
    },
    [faucetContract]
  )
  const claim = useCallback(() => {
    return faucetContract.claim()
  }, [faucetContract])

  return { claimAndOrRegister, claim }
}

export default useFaucetActions

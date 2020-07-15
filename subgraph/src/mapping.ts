import { Address, BigInt, Bytes } from '@graphprotocol/graph-ts'
import { BrightIdFaucet, Claim as ClaimEvent, Register as RegisterEvent } from '../generated/BrightIdFaucet/BrightIdFaucet'
import { Claim, Claimer, Period, Settings } from '../generated/schema'

export function handleNewClaim(event: ClaimEvent): void {
  let claim = _getClaimEntity(event.params.claimer, event.params.periodNumber)
  claim.amount = event.params.amount
  claim.save()
  
  let claimer = _getClaimerEntity(event.params.claimer)
  claimer.latestClaimPeriod = event.params.periodNumber
  claimer.claims.push(claim.id)

  claimer.save()
}

export function handleNewRegistration(event: RegisterEvent): void {
  let period = _getPeriodEntity(event.params.periodNumber)

  let faucet = BrightIdFaucet.bind(event.address)
  period.individualPayout = faucet.getPeriodIndividualPayout(event.params.periodNumber)
  period.totalRegisteredUsers = period.totalRegisteredUsers.plus(BigInt.fromI32(1))
  period.save()

  let claimerData = faucet.claimers(event.params.sender) 
  let claimer = _getClaimerEntity(event.params.sender)
  claimer.registeredForPeriod = event.params.periodNumber
  claimer.addressVoid = claimerData.value2

  claimer.save()
}

function _getClaimerEntityId(appAddress: Address): string {
  return appAddress.toHexString()
}

function _getClaimerEntity(claimerAddress: Address): Claimer | null {
  let claimerEntityId = _getClaimerEntityId(claimerAddress)

  let claimer = Claimer.load(claimerEntityId)

  if (!claimer) {
    claimer = new Claimer(claimerEntityId)
  }

  return claimer
}

function _getClaimEntityId(claimerAddress: Address, periodNumber: BigInt): string {
  return claimerAddress.toHexString() + periodNumber.toString()
}


function _getClaimEntity(claimerAddress: Address, periodNumber: BigInt): Claim | null {
  let claimEntityId = _getClaimEntityId(claimerAddress, periodNumber)

  let claim = Claim.load(claimEntityId)

  if (!claim) {
    claim = new Claim(claimEntityId)
    claim.claimer = claimerAddress.toHexString()
    claim.period = periodNumber.toString()
  }

  return claim
} 

function _getPeriodEntityId(periodNumber: BigInt): string {
  return periodNumber.toString()
}


function _getPeriodEntity(periodNumber: BigInt): Period | null {
  let periodEntityId = _getPeriodEntityId(periodNumber)

  let period = Period.load(periodEntityId)

  if (!period) {
    period = new Period(periodEntityId)
  }

  return period
}
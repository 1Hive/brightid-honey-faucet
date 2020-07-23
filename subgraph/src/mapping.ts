import { Address, BigInt, Bytes } from '@graphprotocol/graph-ts'
import { BrightIdFaucet, Claim as ClaimEvent, Initialize as InitializeEvent, Register as RegisterEvent } from '../generated/BrightIdFaucet/BrightIdFaucet'
import { ERC20 as ERC20Contract } from '../generated/BrightIdFaucet/ERC20'
import { Claim, Claimer, Config, ERC20, Period } from '../generated/schema'

export function handleInitialized(event: InitializeEvent): void {
  let config = _getConfigEntity(event.address)
  config.firstPeriodStart = event.block.timestamp
  config.periodLength = event.params.periodLength
  config.percentPerPeriod = event.params.percentPerPeriod
  config.minimumEthBalance = event.params.minimumEthBalance

  // Load token
  let tokenAddress = event.params.token
  let token = new ERC20(tokenAddress.toHexString())
  let tokenContract = ERC20Contract.bind(tokenAddress)
  token.name = tokenContract.name()
  token.symbol = tokenContract.symbol()
  token.decimals = tokenContract.decimals()
  token.save()

  config.token = token.id
  config.save()

}

export function handleNewClaim(event: ClaimEvent): void {
  let claim = _getClaimEntity(event.params.claimer, event.params.periodNumber)
  claim.amount = event.params.claimerPayout
  claim.save()

  let config =_getConfigEntity(event.address)
  config.totalDistributed = config.totalDistributed.plus(event.params.claimerPayout)
  config.save()
  
  let claimer = _getClaimerEntity(event.params.claimer)
  claimer.latestClaimPeriod = event.params.periodNumber
  claimer.claims.push(claim.id)

  claimer.save()

  // Load period 
  let period = _getPeriodEntity(event.params.periodNumber)
  if (period.maxPayout.equals(BigInt.fromI32(0))) {
    let faucetContract = BrightIdFaucet.bind(event.address)
    let periodData = faucetContract.periods(event.params.periodNumber)
    period.maxPayout = periodData.value1

    period.save()
  }
}

export function handleNewRegistration(event: RegisterEvent): void {
  let period = _getPeriodEntity(event.params.periodNumber)

  let faucetContract = BrightIdFaucet.bind(event.address)
  period.individualPayout = faucetContract.getPeriodIndividualPayout(event.params.periodNumber)
  period.totalRegisteredUsers = period.totalRegisteredUsers.plus(BigInt.fromI32(1))
  period.save()

  let claimerData = faucetContract.claimers(event.params.sender) 
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
    claimer.latestClaimPeriod = BigInt.fromI32(0)
    claimer.registeredForPeriod = BigInt.fromI32(0)
    claimer.addressVoid = false
    claimer.claims = []
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
    period.totalRegisteredUsers = BigInt.fromI32(0)
    period.maxPayout = BigInt.fromI32(0)
  }

  return period
}

function _getConfigEntity(address: Address): Config | null {

  let configEntityId = address.toHexString()
  let config = Config.load(address.toHexString())

  if (!config) {
    config = new Config(configEntityId)
    config.totalDistributed = BigInt.fromI32(0)
  }

  return config
}
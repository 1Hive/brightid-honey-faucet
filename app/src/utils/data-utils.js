import { bigNum } from '../lib/math-utils'

export function transformConfigData(config) {
  return {
    ...config,
    firstPeriodStart: parseInt(config.firstPeriodStart, 10) * 1000,
    minimumEthBalance: bigNum(config.minimumEthBalance),
    periodLength: parseInt(config.periodLength, 10) * 1000,
    percentPerPeriod: bigNum(config.percentPerPeriod),
    totalDistributed: bigNum(config.totalDistributed),
  }
}

export function transformClaimerData(claimer) {
  return {
    ...claimer,
    registeredForPeriod: parseInt(claimer.registeredForPeriod, 10),
    latestClaimPeriod: parseInt(claimer.latestClaimPeriod, 10),
    claims: claimer.claims.map(claim => ({
      ...claim,
      amount: bigNum(claim.amount),
    })),
  }
}

export function transformPeriodData(period) {
  return {
    ...period,
    totalRegisteredUsers: parseInt(period.totalRegisteredUsers, 10),
    individualPayout: bigNum(period.individualPayout),
    maxPayout: bigNum(period.maxPayout),
  }
}

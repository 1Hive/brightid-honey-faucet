export function getCurrentPeriod(now, firstPeriodStart, periodLength) {
  const periodNumber = Math.floor(
    (now.valueOf() - firstPeriodStart) / periodLength
  )

  const startTime = firstPeriodStart + periodNumber * periodLength
  const endTime = startTime + periodLength - 1

  return { periodNumber, startTime, endTime }
}

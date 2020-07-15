import { useMemo } from 'react'
import { useSubscription } from 'urql'
import { Claimer, Periods, Period, Config } from '../queries'
import {
  transformConfigData,
  transformClaimerData,
  transformPeriodData,
} from '../utils/data-utils'

export function useConfig(appAddress) {
  const [{ data, error }] = useSubscription({
    query: Config,
    variables: { id: appAddress?.toLowerCase() },
    pause: !appAddress,
  })

  const config = useMemo(
    () => (data?.config ? transformConfigData(data.config) : null),
    [data]
  )

  return { config, fetching: !data && !error, error }
}

export function useClaimer(claimerAddress) {
  const [{ data, error }] = useSubscription({
    query: Claimer,
    variables: { id: claimerAddress?.toLowerCase() },
    pause: !claimerAddress,
  })

  const claimer = useMemo(
    () => (data?.claimer ? transformClaimerData(data.claimer) : null),
    [data]
  )

  return { claimer, fetching: !data && !error, error }
}

export function usePeriod(periodNumber) {
  const [{ data, error }] = useSubscription({
    query: Period,
    variables: { id: periodNumber },
  })

  const period = useMemo(
    () => (data?.period ? transformPeriodData(data.period) : null),
    [data]
  )

  return { period, fetching: !data && !error, error }
}

export function usePeriods() {
  const [{ data, error }] = useSubscription({
    query: Periods,
  })

  const periods = useMemo(
    () => (data?.periods ? data.periods.map(transformPeriodData) : null),
    [data]
  )

  return { periods, fetching: !data && !error, error }
}

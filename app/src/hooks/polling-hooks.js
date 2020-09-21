import { useMemo } from 'react'
import { useQuery } from 'urql'
import { Claimer, Periods, Period, Config } from '../queries'
import {
  transformConfigData,
  transformClaimerData,
  transformPeriodData,
} from '../utils/data-utils'

const POLLING_INTERVAL = 4000

export function useConfig(appAddress) {
  const [{ data, error }] = useQuery({
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
  const [{ data, error }] = useQuery({
    query: Claimer,
    variables: { id: claimerAddress?.toLowerCase() },
    pause: !claimerAddress,
    pollInterval: POLLING_INTERVAL,
  })

  const claimer = useMemo(
    () => (data?.claimer ? transformClaimerData(data.claimer) : null),
    [data]
  )

  return { claimer, fetching: claimerAddress && !data && !error, error }
}

export function usePeriod(periodNumber) {
  const [{ data, error }] = useQuery({
    query: Period,
    variables: { id: periodNumber },
    pollInterval: POLLING_INTERVAL,
  })

  const period = useMemo(
    () => (data?.period ? transformPeriodData(data.period) : null),
    [data]
  )

  return { period, fetching: !data && !error, error }
}

export function usePeriods() {
  const [{ data, error }] = useQuery({
    query: Periods,
    pollInterval: POLLING_INTERVAL,
  })

  const periods = useMemo(
    () => (data?.periods ? data.periods.map(transformPeriodData) : null),
    [data]
  )

  return { periods, fetching: !data && !error, error }
}

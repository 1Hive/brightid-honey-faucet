import gql from 'graphql-tag'

export const Config = gql`
  query Config($id: ID!) {
    config(id: $id) {
      firstPeriodStart
      periodLength
      percentPerPeriod
      minimumEthBalance
      totalDistributed
      token {
        id
        name
        symbol
        decimals
      }
    }
  }
`

export const Claimer = gql`
  query Claimer($id: ID!) {
    claimer(id: $id) {
      registeredForPeriod
      latestClaimPeriod
      addressVoid
      claims {
        claimer {
          id
        }
        amount
        period {
          id
        }
      }
    }
  }
`

export const Period = gql`
  query Period($id: ID!) {
    period(id: $id) {
      totalRegisteredUsers
      individualPayout
      maxPayout
    }
  }
`

export const Periods = gql`
  query Periods($limit: Int) {
    periods(first: $limit, orderBy: id, orderDirection: asc) {
      id
      totalRegisteredUsers
      individualPayout
      maxPayout
    }
  }
`

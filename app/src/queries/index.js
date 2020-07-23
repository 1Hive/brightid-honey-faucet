import gql from 'graphql-tag'

export const Config = gql`
  subscription Config($id: ID!) {
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
  subscription Claimer($id: ID!) {
    claimer(id: $id) {
      registeredForPeriod
      latestClaimPeriod
      addressVoid
      claims {
        claimer
        amount
        period {
          id
        }
      }
    }
  }
`

export const Period = gql`
  subscription Period($id: ID!) {
    period(id: $id) {
      totalRegisteredUsers
      individualPayout
      maxPayout
    }
  }
`

export const Periods = gql`
  subscription Periods($limit: Int) {
    periods(first: $limit, orderBy: id, orderDirection: asc) {
      id
      totalRegisteredUsers
      individualPayout
      maxPayout
    }
  }
`

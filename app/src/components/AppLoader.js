import React from 'react'
import { SyncIndicator } from '@1hive/1hive-ui'
import { useAppState } from '../providers/AppState'

export default function AppLoader({ children }) {
  const { config } = useAppState()

  if (!config) {
    return <SyncIndicator />
  }
  return <div>{children}</div>
}

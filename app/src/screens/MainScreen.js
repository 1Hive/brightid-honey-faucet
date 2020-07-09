import React from 'react'

const MainScreen = React.memo(({ isLoading }) => {
  if (isLoading) {
    return null
  }
  return <div />
})

export default MainScreen

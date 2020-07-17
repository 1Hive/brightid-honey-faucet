import { useAppState } from './providers/AppState'
import useFaucetActions from './hooks/useFaucetActions'

// Handles the main logic of the app.
export default function useAppLogic() {
  const { loading } = useAppState()
  const actions = useFaucetActions()

  return { actions, isLoading: loading }
}

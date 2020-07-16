import { useAppState } from './providers/AppState'

// Handles the main logic of the app.
export default function useAppLogic() {
  const { loading } = useAppState()

  return { isLoading: loading }
}

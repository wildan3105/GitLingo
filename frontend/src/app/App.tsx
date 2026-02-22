import { SearchPage } from '../features/search/SearchPage'
import { ErrorBoundary } from '../shared/components/ErrorBoundary'

function App() {
  return (
    <ErrorBoundary>
      <SearchPage />
    </ErrorBoundary>
  )
}

export default App

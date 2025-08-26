import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/app/')({
  component: App,
})

function App() {
  return (
    <div>
      <h1>Welcome to the App!</h1>
    </div>
  )
}

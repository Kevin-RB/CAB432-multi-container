import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(auth)/signup/confirmation')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(auth)/signup/confirmation"!</div>
}

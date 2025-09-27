import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(auth)/auth/mfa-verify')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(auth)/auth/mfa-verify"!</div>
}

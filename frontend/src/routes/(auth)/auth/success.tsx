import { AuthSuccess } from '@/components/auth-success'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(auth)/auth/success')({
    component: RouteComponent,
})

function RouteComponent() {
    return (<AuthSuccess />)
}

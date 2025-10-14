import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'
import type { QueryClient } from '@tanstack/react-query'
import { Devtools } from '@/components/devtools'

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => (
    <>
      {/* <Header /> */}
      <main className="flex-1">
        <Outlet />
      </main>
      <Devtools />
    </>
  ),
})

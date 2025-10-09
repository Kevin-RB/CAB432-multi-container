import { TanstackDevtools } from "@tanstack/react-devtools"
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import TanStackQueryDevtools from '../integrations/tanstack-query/devtools'

export const Devtools = () => {
    const isProduction = import.meta.env.PROD
    if (isProduction) return null
    return (
        <TanstackDevtools
            config={{
                position: 'bottom-left',
            }}
            plugins={[
                {
                    name: 'Tanstack Router',
                    render: <TanStackRouterDevtoolsPanel />,
                },
                TanStackQueryDevtools,
            ]}
        />
    )
}
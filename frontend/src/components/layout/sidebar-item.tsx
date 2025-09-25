import {
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Link, useMatchRoute } from "@tanstack/react-router"

export const SidebarItem = ({ title, url, icon }: { title: string; url: string; icon: React.ReactNode }) => {
    const matchRoute = useMatchRoute()
    const isActive = matchRoute({ to: url, fuzzy: true })


    return (
        <SidebarMenuItem key={title}>
            <SidebarMenuButton asChild isActive={!!isActive}>
                <Link to={url}>
                    <>
                        {icon}
                        <span>{title}</span>
                    </>
                </Link>
            </SidebarMenuButton>
        </SidebarMenuItem>
    )
}
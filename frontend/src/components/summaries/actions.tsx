import { MoreHorizontal } from "lucide-react"
import { Button } from "../ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { useNavigate } from "@tanstack/react-router"

interface TableActionsProps {
    linkTo: string
}

export const TableActions = ({linkTo}: TableActionsProps) => {
    const navigate = useNavigate()
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem className="cursor-pointer"
                    onClick={() => navigate({to: linkTo})}
                >
                    Go to Receipt
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

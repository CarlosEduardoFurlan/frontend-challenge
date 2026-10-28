import { Link } from '@tanstack/react-router'
import { Heart, LogOut, Package, User, Wallet } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { initials } from '@/lib/format'

import type { HeaderUser } from './AppHeader'

interface UserMenuProps {
  user: HeaderUser
  onLogout: () => void
  /** `top` for the mobile bottom bar, `bottom` (default) for the desktop header. */
  side?: 'top' | 'bottom'
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

/** Account dropdown. Loaded lazily: it only matters once a session exists. */
export default function UserMenu({
  user,
  onLogout,
  side = 'bottom',
  open,
  onOpenChange,
}: UserMenuProps) {
  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          aria-label={`Conta de ${user.name}`}
          data-testid="header-user-menu"
        >
          <Avatar className="size-8">
            {user.avatarUrl ? <AvatarImage src={user.avatarUrl} alt="" /> : null}
            <AvatarFallback className="text-xs">{initials(user.name)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side={side} sideOffset={8}>
        <DropdownMenuLabel className="truncate">{user.email}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/account/profile">
            <User aria-hidden="true" /> Dados do perfil
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/account/wallets">
            <Wallet aria-hidden="true" /> Carteiras
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/account/orders">
            <Package aria-hidden="true" /> Atividade
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/favorites">
            <Heart aria-hidden="true" /> Lista de interesse
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={onLogout} destructive data-testid="logout">
          <LogOut aria-hidden="true" /> Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

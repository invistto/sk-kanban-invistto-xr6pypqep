import { Link, Outlet, useLocation } from 'react-router-dom'
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarHeader as SidebarTop,
} from '@/components/ui/sidebar'
import {
  LayoutDashboard,
  KanbanSquare,
  ListTodo,
  CalendarDays,
  Settings,
  Bell,
  Search,
  LogOut,
  Clock,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { TaskDetailSheet } from './TaskDetailSheet'
import { useProject } from '@/store/project-context'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

export default function Layout() {
  const location = useLocation()
  const { members } = useProject()
  const currentUser = members[0] // Mock current user

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Quadro', path: '/', icon: KanbanSquare },
    { name: 'Lista', path: '/list', icon: ListTodo },
    { name: 'Calendário', path: '/calendar', icon: CalendarDays },
    { name: 'Timeline', path: '/timeline', icon: Clock },
    { name: 'Configurações', path: '/settings', icon: Settings },
  ]

  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden bg-background w-full">
        <Sidebar className="border-r border-border/50">
          <SidebarTop className="p-4 flex items-center gap-2 mt-2">
            <div className="bg-primary text-primary-foreground p-1.5 rounded-md">
              <KanbanSquare className="h-5 w-5" />
            </div>
            <span className="font-bold text-lg tracking-tight">K-Board</span>
          </SidebarTop>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Visões
              </SidebarGroupLabel>
              <SidebarMenu>
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path
                  return (
                    <SidebarMenuItem key={item.name}>
                      <SidebarMenuButton asChild isActive={isActive} tooltip={item.name}>
                        <Link to={item.path} className="flex items-center gap-3">
                          <item.icon className="h-4 w-4" />
                          <span>{item.name}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <SidebarInset className="flex flex-col flex-1 overflow-hidden w-full">
          <header className="h-14 shrink-0 flex items-center justify-between px-6 border-b bg-background/95 backdrop-blur z-10 w-full">
            <div className="flex items-center gap-4 w-1/3">
              <div className="relative w-full max-w-sm hidden md:block">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar tarefas..."
                  className="w-full bg-muted/50 pl-9 h-9 border-none focus-visible:ring-1"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full">
                    <Bell className="h-4 w-4 text-muted-foreground" />
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 border border-background"></span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-80 p-0">
                  <div className="p-3 border-b font-medium text-sm">Notificações</div>
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    Você não tem novas notificações.
                  </div>
                </PopoverContent>
              </Popover>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                      <AvatarFallback>US</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{currentUser.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {currentUser.role === 'admin' ? 'Administrador' : 'Membro'}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Configurações da Conta</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600 focus:bg-red-50 focus:text-red-600 dark:focus:bg-red-950">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sair</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          <main className="flex-1 overflow-hidden relative bg-muted/10 w-full">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
      <TaskDetailSheet />
    </SidebarProvider>
  )
}

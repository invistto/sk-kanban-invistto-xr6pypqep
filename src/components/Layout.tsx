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
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/use-auth'
import { useState, useEffect } from 'react'
import pb from '@/lib/pocketbase/client'
import { useRealtime } from '@/hooks/use-realtime'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronsUpDown, PlusCircle, Check } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export default function Layout() {
  const location = useLocation()
  const { user, signOut } = useAuth()
  const [notifications, setNotifications] = useState<any[]>([])

  const loadNotifs = async () => {
    if (!user) return
    const res = await pb
      .collection('notifications')
      .getFullList({ filter: `user_id="${user.id}"`, sort: '-created' })
    setNotifications(res)
  }

  useEffect(() => {
    loadNotifs()
  }, [user])
  useRealtime('notifications', loadNotifs, !!user)

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAsRead = async (id: string) => {
    await pb.collection('notifications').update(id, { read: true })
  }

  const { boards, activeBoardId, setActiveBoardId, createBoard } = useProject()
  const [isCreateBoardOpen, setIsCreateBoardOpen] = useState(false)
  const [newBoardName, setNewBoardName] = useState('')

  const handleCreateBoard = async () => {
    if (newBoardName.trim()) {
      await createBoard(newBoardName)
      setNewBoardName('')
      setIsCreateBoardOpen(false)
    }
  }

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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between px-2 flex items-center gap-2 hover:bg-muted/50 h-auto py-1.5"
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <div className="bg-primary text-primary-foreground p-1.5 rounded-md shrink-0">
                      <KanbanSquare className="h-5 w-5" />
                    </div>
                    <span className="font-bold text-lg tracking-tight truncate">
                      {boards.find((b) => b.id === activeBoardId)?.name || 'K-Board'}
                    </span>
                  </div>
                  <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64" align="start">
                <DropdownMenuLabel>Meus Quadros</DropdownMenuLabel>
                {boards.map((b) => (
                  <DropdownMenuItem
                    key={b.id}
                    onClick={() => setActiveBoardId(b.id)}
                    className="flex items-center justify-between cursor-pointer"
                  >
                    <span className="truncate">{b.name}</span>
                    {b.id === activeBoardId && <Check className="h-4 w-4 shrink-0" />}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={() => setIsCreateBoardOpen(true)}
                  className="cursor-pointer"
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  <span>Criar Novo Quadro</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 border border-background"></span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-80 p-0">
                  <div className="p-3 border-b font-medium text-sm flex justify-between items-center">
                    Notificações
                    {unreadCount > 0 && (
                      <Badge variant="secondary" className="text-[10px]">
                        {unreadCount} não lidas
                      </Badge>
                    )}
                  </div>
                  <div className="max-h-[300px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        Você não tem novas notificações.
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => markAsRead(n.id)}
                          className={`p-3 border-b text-sm cursor-pointer hover:bg-muted/50 ${!n.read ? 'bg-primary/5' : ''}`}
                        >
                          <p className={!n.read ? 'font-medium' : 'text-muted-foreground'}>
                            {n.message}
                          </p>
                          <span className="text-[10px] text-muted-foreground">
                            {format(new Date(n.created), "dd MMM 'às' HH:mm", { locale: ptBR })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </PopoverContent>
              </Popover>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9">
                      <AvatarImage
                        src={
                          user?.avatar
                            ? pb.files.getURL(user, user.avatar)
                            : `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || user?.email}`
                        }
                        alt={user?.name}
                      />
                      <AvatarFallback>
                        {user?.name?.substring(0, 2).toUpperCase() || 'US'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.name || 'Usuário'}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Configurações da Conta</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={signOut}
                    className="text-red-600 focus:bg-red-50 focus:text-red-600 dark:focus:bg-red-950 cursor-pointer"
                  >
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

      <Dialog open={isCreateBoardOpen} onOpenChange={setIsCreateBoardOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Quadro</DialogTitle>
            <DialogDescription>Dê um nome ao seu novo quadro Kanban.</DialogDescription>
          </DialogHeader>
          <Input
            value={newBoardName}
            onChange={(e) => setNewBoardName(e.target.value)}
            placeholder="Ex: Projeto X"
            onKeyDown={(e) => e.key === 'Enter' && handleCreateBoard()}
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsCreateBoardOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateBoard} disabled={!newBoardName.trim()}>
              Criar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  )
}

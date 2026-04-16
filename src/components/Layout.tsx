import { useState } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarHeader,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { useProject } from '@/store/project-context'
import { useAuth } from '@/hooks/use-auth'
import {
  LayoutDashboard,
  Kanban,
  Calendar,
  List,
  Settings,
  Plus,
  Loader2,
  LogOut,
  Clock,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export function Layout() {
  const { boards, activeBoardId, setActiveBoardId, createBoard } = useProject()
  const { user, signOut } = useAuth()
  const { toast } = useToast()
  const location = useLocation()

  const [isCreatingBoard, setIsCreatingBoard] = useState(false)
  const [newBoardName, setNewBoardName] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleCreateBoard = async () => {
    if (!newBoardName.trim()) return
    setIsCreatingBoard(true)
    try {
      await createBoard(newBoardName)
      toast({ title: 'Quadro criado com sucesso!' })
      setNewBoardName('')
      setIsDialogOpen(false)
    } catch (error) {
      toast({ title: 'Erro ao criar quadro', variant: 'destructive' })
    } finally {
      setIsCreatingBoard(false)
    }
  }

  const navItems = [
    { name: 'Quadro', path: '/', icon: Kanban },
    { name: 'Lista', path: '/list', icon: List },
    { name: 'Calendário', path: '/calendar', icon: Calendar },
    { name: 'Timeline', path: '/timeline', icon: Clock },
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Configurações', path: '/settings', icon: Settings },
  ]

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="p-4 flex flex-row items-center gap-2">
          <div className="bg-primary/10 p-2 rounded-lg">
            <Kanban className="w-6 h-6 text-primary" />
          </div>
          <span className="font-bold text-lg">Invistto</span>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Visualizações</SidebarGroupLabel>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.path}>
                    <Link to={item.path}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>

          <SidebarGroup>
            <div className="flex items-center justify-between px-2 mb-2">
              <SidebarGroupLabel className="mb-0">Meus Quadros</SidebarGroupLabel>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <Plus className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Criar Novo Quadro</DialogTitle>
                  </DialogHeader>
                  <div className="py-4">
                    <Input
                      placeholder="Nome do quadro"
                      value={newBoardName}
                      onChange={(e) => setNewBoardName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleCreateBoard()}
                      disabled={isCreatingBoard}
                      autoFocus
                    />
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                      disabled={isCreatingBoard}
                    >
                      Cancelar
                    </Button>
                    <Button onClick={handleCreateBoard} disabled={isCreatingBoard}>
                      {isCreatingBoard && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Criar
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <SidebarMenu>
              {boards.map((board) => (
                <SidebarMenuItem key={board.id}>
                  <SidebarMenuButton
                    isActive={activeBoardId === board.id}
                    onClick={() => setActiveBoardId(board.id)}
                  >
                    <span>{board.name}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback>{user?.email?.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">{user?.name || 'Usuário'}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={signOut} title="Sair">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="flex flex-col flex-1 h-screen overflow-hidden">
        <header className="h-14 border-b flex items-center px-4 gap-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
          <SidebarTrigger />
          <div className="flex-1" />
        </header>
        <main className="flex-1 overflow-auto relative">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

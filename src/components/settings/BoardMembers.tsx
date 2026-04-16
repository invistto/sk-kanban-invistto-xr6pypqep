import { useProject } from '@/store/project-context'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { UserPlus, Trash2 } from 'lucide-react'
import { useState } from 'react'

export function BoardMembers() {
  const { activeBoardId, boards, members, updateBoard } = useProject()
  const { toast } = useToast()
  const [selectedUser, setSelectedUser] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const activeBoard = boards.find((b) => b.id === activeBoardId)
  if (!activeBoard) return null

  const boardMemberIds = activeBoard.members || []
  const boardUsers = members.filter(
    (m) => boardMemberIds.includes(m.id) || m.id === activeBoard.owner_id,
  )
  const availableUsers = members.filter(
    (m) => !boardMemberIds.includes(m.id) && m.id !== activeBoard.owner_id,
  )

  const handleAddMember = async () => {
    if (!selectedUser) return
    setIsSubmitting(true)
    try {
      await updateBoard(activeBoard.id, { members: [...boardMemberIds, selectedUser] })
      setSelectedUser('')
      toast({ title: 'Membro adicionado ao quadro' })
    } catch {
      toast({ title: 'Erro ao adicionar membro', variant: 'destructive' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRemoveMember = async (userId: string) => {
    if (userId === activeBoard.owner_id) {
      toast({ title: 'O dono do quadro não pode ser removido', variant: 'destructive' })
      return
    }
    try {
      await updateBoard(activeBoard.id, { members: boardMemberIds.filter((id) => id !== userId) })
      toast({ title: 'Membro removido do quadro' })
    } catch {
      toast({ title: 'Erro ao remover membro', variant: 'destructive' })
    }
  }

  return (
    <section className="mt-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-xl font-semibold">Membros do Quadro</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie quem tem acesso a este quadro específico.
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select value={selectedUser} onValueChange={setSelectedUser}>
            <SelectTrigger className="w-[200px] sm:w-[250px]">
              <SelectValue placeholder="Selecionar membro" />
            </SelectTrigger>
            <SelectContent>
              {availableUsers.map((u) => (
                <SelectItem key={u.id} value={u.id}>
                  {u.name || u.email}
                </SelectItem>
              ))}
              {availableUsers.length === 0 && (
                <SelectItem value="none" disabled>
                  Nenhum usuário disponível
                </SelectItem>
              )}
            </SelectContent>
          </Select>
          <Button
            onClick={handleAddMember}
            disabled={!selectedUser || isSubmitting}
            className="bg-indigo-500 hover:bg-indigo-600 shrink-0"
          >
            <UserPlus className="h-4 w-4 mr-2" /> Adicionar
          </Button>
        </div>
      </div>

      <div className="border rounded-xl bg-card overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Membro</TableHead>
              <TableHead>Função no Quadro</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {boardUsers.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={u.avatar} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {(u.name || u.email).substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{u.name || u.email}</span>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={u.id === activeBoard.owner_id ? 'default' : 'secondary'}
                    className="font-normal"
                  >
                    {u.id === activeBoard.owner_id ? 'Dono' : 'Membro'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {u.id !== activeBoard.owner_id && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleRemoveMember(u.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  )
}

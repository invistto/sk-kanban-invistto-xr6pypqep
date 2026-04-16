import { useProject, Column } from '@/store/project-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Settings as SettingsIcon, GripVertical, UserPlus, Trash2, Check, Plus } from 'lucide-react'
import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'

function ColumnItem({
  col,
  onUpdate,
  onDelete,
}: {
  col: Column
  onUpdate: (id: string, name: string) => void
  onDelete: (id: string) => void
}) {
  const [name, setName] = useState(col.name)
  const [isEditing, setIsEditing] = useState(false)

  const handleSave = () => {
    if (name.trim() !== col.name) {
      onUpdate(col.id, name)
    }
    setIsEditing(false)
  }

  return (
    <div className="flex items-center gap-3 p-3 bg-muted/30 border rounded-md">
      <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
      <Input
        value={name}
        onChange={(e) => {
          setName(e.target.value)
          setIsEditing(true)
        }}
        onKeyDown={(e) => e.key === 'Enter' && handleSave()}
        onBlur={handleSave}
        className="max-w-sm bg-background"
      />
      {isEditing && (
        <Button variant="ghost" size="icon" className="text-green-600 ml-2" onClick={handleSave}>
          <Check className="h-4 w-4" />
        </Button>
      )}
      <Button
        variant="ghost"
        size="icon"
        className={`text-destructive ${!isEditing ? 'ml-auto' : ''}`}
        onClick={() => onDelete(col.id)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}

export default function Settings() {
  const { columns, members, updateColumn, deleteColumn, addColumn } = useProject()
  const { toast } = useToast()
  const [newColName, setNewColName] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  const handleUpdateColumn = async (id: string, name: string) => {
    try {
      await updateColumn(id, name)
      toast({ title: 'Coluna salva com sucesso', description: `Nome atualizado para "${name}"` })
    } catch (e) {
      toast({ title: 'Erro ao atualizar', variant: 'destructive' })
    }
  }

  const handleDeleteColumn = async (id: string) => {
    try {
      await deleteColumn(id)
      toast({ title: 'Coluna removida' })
    } catch (e) {
      toast({ title: 'Erro ao remover', variant: 'destructive' })
    }
  }

  const handleAddColumn = async () => {
    if (!newColName.trim()) return
    try {
      await addColumn(newColName)
      setNewColName('')
      setIsAdding(false)
      toast({ title: 'Coluna adicionada' })
    } catch (e) {
      toast({ title: 'Erro ao adicionar', variant: 'destructive' })
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8 h-full overflow-y-auto kanban-scrollbar">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-primary/10 p-2 rounded-lg">
          <SettingsIcon className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gestão de Colunas (Workflow)</CardTitle>
          <CardDescription>
            Defina as etapas do seu processo Kanban para o quadro atual. Arraste para reordenar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {columns.length === 0 && (
              <p className="text-sm text-muted-foreground py-2">Nenhuma coluna neste quadro.</p>
            )}

            {columns.map((col) => (
              <ColumnItem
                key={col.id}
                col={col}
                onUpdate={handleUpdateColumn}
                onDelete={handleDeleteColumn}
              />
            ))}

            {isAdding ? (
              <div className="flex items-center gap-3 p-3 bg-muted/10 border border-dashed rounded-md mt-4">
                <Input
                  autoFocus
                  placeholder="Nome da nova coluna"
                  value={newColName}
                  onChange={(e) => setNewColName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddColumn()}
                  className="max-w-sm bg-background"
                />
                <Button onClick={handleAddColumn} size="sm" className="ml-2">
                  Salvar
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setIsAdding(false)}>
                  Cancelar
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                className="mt-4 w-full border-dashed"
                onClick={() => setIsAdding(true)}
              >
                <Plus className="mr-2 h-4 w-4" /> Adicionar Coluna
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Membros da Equipe</CardTitle>
            <CardDescription>Gerencie quem tem acesso ao projeto.</CardDescription>
          </div>
          <Button size="sm">
            <UserPlus className="h-4 w-4 mr-2" /> Convidar Membro
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Membro</TableHead>
                <TableHead>Função</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{member.name}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={member.email.includes('admin') ? 'default' : 'secondary'}>
                      {member.email.includes('admin') ? 'Administrador' : 'Membro'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="text-muted-foreground">
                      Editar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

import { useProject, Column } from '@/store/project-context'
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
import { Settings as SettingsIcon, GripVertical, UserPlus, Trash2, Plus } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'

function ColumnRow({
  col,
  index,
  onUpdate,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop,
}: {
  col: Column
  index: number
  onUpdate: (id: string, name: string) => void
  onDelete: (id: string) => void
  onDragStart: (e: React.DragEvent, index: number) => void
  onDragOver: (e: React.DragEvent, index: number) => void
  onDrop: (e: React.DragEvent) => void
}) {
  const [name, setName] = useState(col.name)

  const handleBlur = () => {
    if (name.trim() !== col.name && name.trim().length > 0) {
      onUpdate(col.id, name.trim())
    } else {
      setName(col.name)
    }
  }

  useEffect(() => {
    setName(col.name)
  }, [col.name])

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDrop={onDrop}
      className="flex items-center gap-4 p-4 mb-3 bg-card border rounded-lg shadow-sm transition-colors hover:border-primary/30 group cursor-default"
    >
      <div className="cursor-grab active:cursor-grabbing text-muted-foreground/50 hover:text-muted-foreground p-1">
        <GripVertical className="h-5 w-5" />
      </div>
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
        className="max-w-md bg-transparent"
      />
      <Button
        variant="ghost"
        size="icon"
        className="text-destructive/70 ml-auto hover:bg-destructive/10 hover:text-destructive transition-colors"
        onClick={() => onDelete(col.id)}
      >
        <Trash2 className="h-5 w-5" />
      </Button>
    </div>
  )
}

export default function Settings() {
  const { columns, members, updateColumn, deleteColumn, addColumn, reorderColumns } = useProject()
  const { toast } = useToast()
  const [newColName, setNewColName] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [localColumns, setLocalColumns] = useState<Column[]>([])
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  useEffect(() => {
    if (draggedIndex === null) {
      setLocalColumns(columns)
    }
  }, [columns, draggedIndex])

  const handleUpdateColumn = async (id: string, name: string) => {
    try {
      await updateColumn(id, name)
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
    } catch (e) {
      toast({ title: 'Erro ao adicionar', variant: 'destructive' })
    }
  }

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', index.toString())
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'

    if (draggedIndex === null || draggedIndex === index) return

    const newCols = [...localColumns]
    const [dragged] = newCols.splice(draggedIndex, 1)
    newCols.splice(index, 0, dragged)

    setLocalColumns(newCols)
    setDraggedIndex(index)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setDraggedIndex(null)

    const reordered = localColumns.map((col, i) => ({ ...col, order: i }))
    try {
      await reorderColumns(reordered)
    } catch (err) {
      toast({ title: 'Erro ao reordenar', variant: 'destructive' })
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-10 h-full overflow-y-auto kanban-scrollbar pb-20">
      <div className="flex items-center gap-3">
        <div className="bg-primary/10 p-2 rounded-lg">
          <SettingsIcon className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
      </div>

      <div className="space-y-10">
        <section>
          <div className="mb-6">
            <h2 className="text-xl font-semibold tracking-tight">Gestão de Colunas (Workflow)</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Defina as etapas do seu processo Kanban para o quadro atual. Arraste para reordenar.
            </p>
          </div>

          <div className="rounded-xl">
            {localColumns.length === 0 && (
              <p className="text-sm text-muted-foreground p-4 text-center border border-dashed rounded-lg mb-4">
                Nenhuma coluna neste quadro.
              </p>
            )}

            <div className="space-y-1">
              {localColumns.map((col, index) => (
                <ColumnRow
                  key={col.id}
                  col={col}
                  index={index}
                  onUpdate={handleUpdateColumn}
                  onDelete={handleDeleteColumn}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                />
              ))}
            </div>

            {isAdding ? (
              <div className="flex items-center gap-3 p-4 bg-muted/10 border border-dashed rounded-lg mt-3">
                <Input
                  autoFocus
                  placeholder="Nome da nova coluna"
                  value={newColName}
                  onChange={(e) => setNewColName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddColumn()}
                  className="max-w-md bg-background"
                />
                <Button onClick={handleAddColumn} className="ml-2">
                  Salvar
                </Button>
                <Button variant="ghost" onClick={() => setIsAdding(false)}>
                  Cancelar
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                className="mt-3 w-full h-12 border-dashed text-muted-foreground hover:text-foreground hover:bg-muted/50"
                onClick={() => setIsAdding(true)}
              >
                <Plus className="mr-2 h-4 w-4" /> Adicionar Coluna
              </Button>
            )}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">Membros da Equipe</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Gerencie quem tem acesso ao projeto.
              </p>
            </div>
            <Button className="bg-indigo-500 hover:bg-indigo-600 text-white border-0">
              <UserPlus className="h-4 w-4 mr-2" /> Convidar Membro
            </Button>
          </div>

          <div className="border rounded-xl bg-card overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[400px]">Membro</TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="flex items-center gap-3 py-4">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {(member.name || member.email || 'US').substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{member.name || member.email}</span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={member.email.includes('admin') ? 'default' : 'secondary'}
                        className="font-normal"
                      >
                        {member.email.includes('admin') ? 'Administrador' : 'Membro'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-foreground"
                      >
                        Editar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>
      </div>
    </div>
  )
}

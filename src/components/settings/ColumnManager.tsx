import { useProject, Column } from '@/store/project-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { GripVertical, Trash2, Plus, Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'
import pb from '@/lib/pocketbase/client'
import { extractFieldErrors, getErrorMessage } from '@/lib/pocketbase/errors'

function ColumnRow({ col, index, onUpdate, onDelete, onDragStart, onDragOver, onDrop }: any) {
  const [name, setName] = useState(col.name)

  const handleBlur = () => {
    if (name.trim() !== col.name && name.trim().length > 0) onUpdate(col.id, name.trim())
    else setName(col.name)
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

export function ColumnManager() {
  const { activeBoardId, columns, updateColumn, deleteColumn, reorderColumns } = useProject()
  const { toast } = useToast()
  const [newColName, setNewColName] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [localColumns, setLocalColumns] = useState<Column[]>([])
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  useEffect(() => {
    if (draggedIndex === null) setLocalColumns(columns)
  }, [columns, draggedIndex])

  const handleAdd = async () => {
    if (!newColName.trim()) return
    if (!activeBoardId) {
      toast({
        title: 'Erro de Validação',
        description: 'O ID do quadro não pode estar vazio. Nenhum quadro selecionado.',
        variant: 'destructive',
      })
      return
    }
    setIsSubmitting(true)
    try {
      const currentOrders = localColumns.map((c) => (typeof c.order === 'number' ? c.order : 0))
      const order = currentOrders.length > 0 ? Math.max(...currentOrders) + 1 : 1

      if (typeof order !== 'number' || isNaN(order)) {
        toast({
          title: 'Erro de Cálculo',
          description: 'Falha ao determinar a ordem da coluna.',
          variant: 'destructive',
        })
        setIsSubmitting(false)
        return
      }

      await pb.collection('columns').create({
        board_id: activeBoardId,
        name: newColName.trim(),
        order,
      })

      setNewColName('')
      setIsAdding(false)
      toast({ title: 'Coluna criada com sucesso!' })
    } catch (error) {
      const fieldErrors = extractFieldErrors(error)
      const errorMessage = getErrorMessage(error)
      toast({
        title: 'Erro ao criar coluna',
        description: fieldErrors.name || fieldErrors.order || fieldErrors.board_id || errorMessage,
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setDraggedIndex(null)
    const reordered = localColumns.map((col, i) => ({ ...col, order: i + 1 }))
    try {
      await reorderColumns(reordered)
      toast({ title: 'Colunas reordenadas com sucesso!' })
    } catch {
      toast({ title: 'Erro ao reordenar colunas', variant: 'destructive' })
    }
  }

  return (
    <section className="mt-10">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Gestão de Colunas (Workflow)</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Defina as etapas do seu processo Kanban. Arraste para reordenar.
        </p>
      </div>

      {localColumns.length === 0 && (
        <p className="text-sm text-muted-foreground p-4 text-center border border-dashed rounded-lg mb-4">
          Nenhuma coluna neste quadro.
        </p>
      )}

      <div className="space-y-1">
        {localColumns.map((col, i) => (
          <ColumnRow
            key={col.id}
            col={col}
            index={i}
            onUpdate={updateColumn}
            onDelete={deleteColumn}
            onDragStart={(e: any) => {
              setDraggedIndex(i)
              e.dataTransfer.effectAllowed = 'move'
            }}
            onDragOver={(e: any) => {
              e.preventDefault()
              if (draggedIndex === null || draggedIndex === i) return
              const newCols = [...localColumns]
              const [dragged] = newCols.splice(draggedIndex, 1)
              newCols.splice(i, 0, dragged)
              setLocalColumns(newCols)
              setDraggedIndex(i)
            }}
            onDrop={handleDrop}
          />
        ))}
      </div>

      {isAdding ? (
        <div className="flex items-center gap-3 p-4 bg-muted/10 border border-dashed rounded-lg mt-3">
          <Input
            autoFocus
            placeholder="Nome da coluna"
            value={newColName}
            onChange={(e) => setNewColName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            disabled={isSubmitting}
            className="max-w-md bg-background"
          />
          <Button onClick={handleAdd} disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salvar'}
          </Button>
          <Button variant="ghost" onClick={() => setIsAdding(false)} disabled={isSubmitting}>
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
    </section>
  )
}

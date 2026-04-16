import { useState } from 'react'
import { useProject } from '@/store/project-context'
import { TaskCard } from '@/components/TaskCard'
import { Button } from '@/components/ui/button'
import { Plus, MoreHorizontal } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useToast } from '@/hooks/use-toast'
import pb from '@/lib/pocketbase/client'
import { extractFieldErrors, getErrorMessage } from '@/lib/pocketbase/errors'
import { useRealtime } from '@/hooks/use-realtime'
import { useEffect } from 'react'

export default function Index() {
  const {
    boards,
    activeBoardId,
    tasks: contextTasks,
    columns,
    moveTask,
    addTask,
    addColumn,
    reorderColumns,
    setSelectedTaskId,
  } = useProject()
  const [tasks, setTasks] = useState(contextTasks)

  useEffect(() => {
    setTasks(contextTasks)
  }, [contextTasks])

  useRealtime('tasks', (e) => {
    const mapRecordToTask = (rec: any) => ({
      ...rec,
      columnId: rec.column_id || rec.columnId,
      deadline: rec.due_date || rec.deadline,
      assigneeId: rec.responsible_id || rec.assigneeId,
      subtasks: rec.subtasks || [],
    })

    if (e.action === 'create') {
      setTasks((prev) => {
        if (prev.find((t) => t.id === e.record.id)) return prev
        return [...prev, mapRecordToTask(e.record) as any]
      })
    } else if (e.action === 'update') {
      setTasks((prev) =>
        prev.map((m) => (m.id === e.record.id ? { ...m, ...mapRecordToTask(e.record) } : m)),
      )
    } else if (e.action === 'delete') {
      setTasks((prev) => prev.filter((m) => m.id !== e.record.id))
    }
  })

  const [addingToColumn, setAddingToColumn] = useState<string | null>(null)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [isAddingColumn, setIsAddingColumn] = useState(false)
  const [newColumnName, setNewColumnName] = useState('')
  const [isSubmittingColumn, setIsSubmittingColumn] = useState(false)
  const [isSubmittingTask, setIsSubmittingTask] = useState(false)
  const { toast } = useToast()

  const activeBoard = boards.find((b) => b.id === activeBoardId)

  const handleDrop = (e: React.DragEvent, columnId: string, dropColIndex: number) => {
    e.preventDefault()
    const taskId = e.dataTransfer.getData('taskId')
    const colIndexStr = e.dataTransfer.getData('colIndex')

    if (taskId) {
      moveTask(taskId, columnId).catch(() => {
        toast({ title: 'Erro ao mover tarefa', variant: 'destructive' })
      })
    } else if (colIndexStr) {
      const dragIndex = parseInt(colIndexStr, 10)
      if (dragIndex !== dropColIndex && !isNaN(dragIndex)) {
        const newCols = [...columns]
        const [dragged] = newCols.splice(dragIndex, 1)
        newCols.splice(dropColIndex, 0, dragged)
        const reordered = newCols.map((c, i) => ({ ...c, order: i + 1 }))
        reorderColumns(reordered)
          .then(() => toast({ title: 'Colunas reordenadas com sucesso!' }))
          .catch(() => toast({ title: 'Erro ao reordenar colunas', variant: 'destructive' }))
      }
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleAddTask = async (columnId: string) => {
    if (newTaskTitle.trim()) {
      setIsSubmittingTask(true)
      try {
        const res = await addTask(columnId, newTaskTitle)
        setNewTaskTitle('')
        setAddingToColumn(null)
        toast({ title: 'Tarefa adicionada com sucesso!' })

        if (res && res.id) {
          setSelectedTaskId(res.id)
        } else {
          try {
            const latestTask = await pb
              .collection('tasks')
              .getFirstListItem(`column_id="${columnId}"`, { sort: '-created' })
            if (latestTask && latestTask.id) {
              setSelectedTaskId(latestTask.id)
            }
          } catch (_) {}
        }
      } catch (error) {
        toast({ title: 'Erro ao adicionar tarefa', variant: 'destructive' })
      } finally {
        setIsSubmittingTask(false)
      }
    }
  }

  const handleAddColumn = async () => {
    if (newColumnName.trim()) {
      if (!activeBoardId) {
        toast({ title: 'Erro', description: 'Nenhum quadro selecionado.', variant: 'destructive' })
        return
      }
      setIsSubmittingColumn(true)
      try {
        await addColumn(newColumnName.trim())
        setNewColumnName('')
        setIsAddingColumn(false)
        toast({ title: 'Coluna criada com sucesso!' })
      } catch (error) {
        const fieldErrors = extractFieldErrors(error)
        const errorMessage = getErrorMessage(error)
        console.error(error)
        toast({
          title: 'Erro ao criar coluna',
          description:
            fieldErrors.name || fieldErrors.order || fieldErrors.board_id || errorMessage,
          variant: 'destructive',
        })
      } finally {
        setIsSubmittingColumn(false)
      }
    }
  }

  const handleColDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('colIndex', index.toString())
    e.dataTransfer.effectAllowed = 'move'
  }

  if (!activeBoardId) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground flex-col gap-4">
        <p>Selecione ou crie um quadro na barra lateral para começar.</p>
      </div>
    )
  }

  return (
    <div className="h-full w-full flex flex-col">
      <div className="px-6 py-4 flex-shrink-0 flex items-center justify-between border-b bg-background/50">
        <h1 className="text-2xl font-bold tracking-tight">{activeBoard?.name || 'Quadro'}</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            Filtros
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto kanban-scrollbar p-6">
        <div className="flex h-full items-start gap-6 pb-4">
          {columns.map((column, index) => {
            const columnTasks = tasks.filter((t) => t.columnId === column.id)

            return (
              <div
                key={column.id}
                draggable
                onDragStart={(e) => handleColDragStart(e, index)}
                className="flex h-full w-[320px] shrink-0 flex-col rounded-xl bg-muted/40"
                onDrop={(e) => handleDrop(e, column.id, index)}
                onDragOver={handleDragOver}
              >
                <div className="flex items-center justify-between p-3 px-4 cursor-grab active:cursor-grabbing">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm">{column.name}</h3>
                    <span className="flex h-5 items-center justify-center rounded-full bg-muted-foreground/20 px-2 text-xs font-medium text-muted-foreground">
                      {columnTasks.length}
                    </span>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Renomear coluna</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        Excluir coluna
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex-1 overflow-y-auto kanban-scrollbar p-3 pt-0 flex flex-col gap-3">
                  {columnTasks.map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}

                  {addingToColumn === column.id ? (
                    <div className="mt-2 flex flex-col gap-2 bg-card p-3 rounded-lg border shadow-sm animate-in fade-in zoom-in-95">
                      <Input
                        autoFocus
                        placeholder="O que precisa ser feito?"
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddTask(column.id)}
                        className="text-sm h-8"
                      />
                      <div className="flex items-center gap-2 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setAddingToColumn(null)}
                          disabled={isSubmittingTask}
                        >
                          Cancelar
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleAddTask(column.id)}
                          disabled={isSubmittingTask}
                        >
                          {isSubmittingTask ? 'Adicionando...' : 'Adicionar'}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      className="mt-2 w-full justify-start text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                      onClick={() => setAddingToColumn(column.id)}
                    >
                      <Plus className="mr-2 h-4 w-4" /> Adicionar Tarefa
                    </Button>
                  )}
                </div>
              </div>
            )
          })}

          {isAddingColumn ? (
            <div className="w-[320px] shrink-0 p-3 bg-muted/40 rounded-xl flex flex-col gap-2">
              <Input
                autoFocus
                value={newColumnName}
                onChange={(e) => setNewColumnName(e.target.value)}
                placeholder="Nome da coluna"
                onKeyDown={(e) => e.key === 'Enter' && handleAddColumn()}
                className="bg-card text-sm h-9"
              />
              <div className="flex gap-2 justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsAddingColumn(false)}
                  disabled={isSubmittingColumn}
                >
                  Cancelar
                </Button>
                <Button size="sm" onClick={handleAddColumn} disabled={isSubmittingColumn}>
                  {isSubmittingColumn ? 'Adicionando...' : 'Adicionar'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="w-[320px] shrink-0 pt-0">
              <Button
                variant="outline"
                className="w-full justify-start h-12 bg-muted/10 border-dashed hover:bg-muted/30"
                onClick={() => setIsAddingColumn(true)}
              >
                <Plus className="mr-2 h-4 w-4" /> Adicionar Coluna
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

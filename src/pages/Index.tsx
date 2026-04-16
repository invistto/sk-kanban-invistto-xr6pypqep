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

export default function Index() {
  const { tasks, columns, moveTask, addTask, addColumn } = useProject()
  const [addingToColumn, setAddingToColumn] = useState<string | null>(null)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [isAddingColumn, setIsAddingColumn] = useState(false)
  const [newColumnName, setNewColumnName] = useState('')
  const [isSubmittingColumn, setIsSubmittingColumn] = useState(false)
  const [isSubmittingTask, setIsSubmittingTask] = useState(false)

  const handleDrop = (e: React.DragEvent, columnId: string) => {
    e.preventDefault()
    const taskId = e.dataTransfer.getData('taskId')
    if (taskId) {
      moveTask(taskId, columnId)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleAddTask = async (columnId: string) => {
    if (newTaskTitle.trim()) {
      setIsSubmittingTask(true)
      try {
        await addTask(columnId, newTaskTitle)
        setNewTaskTitle('')
        setAddingToColumn(null)
      } finally {
        setIsSubmittingTask(false)
      }
    }
  }

  const handleAddColumn = async () => {
    if (newColumnName.trim()) {
      setIsSubmittingColumn(true)
      try {
        await addColumn(newColumnName)
        setNewColumnName('')
        setIsAddingColumn(false)
      } catch (error) {
        console.error(error)
      } finally {
        setIsSubmittingColumn(false)
      }
    }
  }

  return (
    <div className="h-full w-full flex flex-col">
      <div className="px-6 py-4 flex-shrink-0 flex items-center justify-between border-b bg-background/50">
        <h1 className="text-2xl font-bold tracking-tight">Quadro Principal</h1>
        <div className="flex items-center gap-2">
          {/* Filters would go here */}
          <Button variant="outline" size="sm">
            Filtros
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto kanban-scrollbar p-6">
        <div className="flex h-full items-start gap-6 pb-4">
          {columns.map((column) => {
            const columnTasks = tasks.filter((t) => t.columnId === column.id)

            return (
              <div
                key={column.id}
                className="flex h-full w-[320px] shrink-0 flex-col rounded-xl bg-muted/40"
                onDrop={(e) => handleDrop(e, column.id)}
                onDragOver={handleDragOver}
              >
                <div className="flex items-center justify-between p-3 px-4">
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

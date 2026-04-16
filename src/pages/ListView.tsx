import { useProject } from '@/store/project-context'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { format, isPast, isToday } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { priorityColors, priorityLabels } from '@/components/TaskCard'
import { useRealtime } from '@/hooks/use-realtime'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { CreateTaskDialog } from '@/components/CreateTaskDialog'

export default function ListView() {
  const { tasks: contextTasks, columns, members, setSelectedTaskId } = useProject()
  const [tasks, setTasks] = useState(contextTasks)

  useEffect(() => setTasks(contextTasks), [contextTasks])

  useRealtime('tasks', (e) => {
    const mapRecord = (rec: any) => ({
      ...rec,
      columnId: rec.column_id || rec.columnId,
      deadline: rec.due_date || rec.deadline,
      assigneeId: rec.responsible_id || rec.assigneeId,
      subtasks: rec.subtasks || [],
    })
    if (e.action === 'create') {
      setTasks((prev) =>
        prev.find((t) => t.id === e.record.id) ? prev : [...prev, mapRecord(e.record) as any],
      )
    } else if (e.action === 'update') {
      setTasks((prev) =>
        prev.map((m) => (m.id === e.record.id ? { ...m, ...mapRecord(e.record) } : m)),
      )
    } else if (e.action === 'delete') {
      setTasks((prev) => prev.filter((m) => m.id !== e.record.id))
    }
  })

  const [isCreatingTask, setIsCreatingTask] = useState(false)

  const sortedTasks = [...tasks].sort(
    (a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime(),
  )

  return (
    <div className="p-6 h-full flex flex-col">
      <CreateTaskDialog open={isCreatingTask} onOpenChange={setIsCreatingTask} />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Lista de Tarefas</h1>
        <Button onClick={() => setIsCreatingTask(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Tarefa
        </Button>
      </div>

      <div className="rounded-md border bg-card flex-1 overflow-auto kanban-scrollbar">
        <Table>
          <TableHeader className="sticky top-0 bg-muted/80 backdrop-blur z-10">
            <TableRow>
              <TableHead className="w-[400px]">Tarefa</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Prioridade</TableHead>
              <TableHead>Responsável</TableHead>
              <TableHead>Prazo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTasks.map((task) => {
              const column = columns.find((c) => c.id === task.columnId)
              const assignee = members.find((m) => m.id === task.assigneeId)
              const isOverdue =
                isPast(new Date(task.deadline)) &&
                !isToday(new Date(task.deadline)) &&
                task.columnId !== 'col4'

              return (
                <TableRow
                  key={task.id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => setSelectedTaskId(task.id)}
                >
                  <TableCell className="font-medium">
                    <div className="flex flex-col gap-1">
                      <span>{task.title}</span>
                      <div className="flex gap-1">
                        {task.tags.map((tag) => (
                          <span key={tag} className="text-[10px] text-muted-foreground">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-normal">
                      {column?.title}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={priorityColors[task.priority]}>
                      {priorityLabels[task.priority]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {assignee ? (
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={assignee.avatar} />
                          <AvatarFallback>US</AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-muted-foreground">{assignee.name}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground italic">Não atribuído</span>
                    )}
                  </TableCell>
                  <TableCell className={isOverdue ? 'text-red-500 font-medium' : ''}>
                    {format(new Date(task.deadline), 'dd MMM, yyyy', { locale: ptBR })}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

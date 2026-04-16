import { useState } from 'react'
import { useProject } from '@/store/project-context'
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isToday,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { priorityColors } from '@/components/TaskCard'
import { useRealtime } from '@/hooks/use-realtime'
import { useEffect } from 'react'
import { Plus } from 'lucide-react'
import { CreateTaskDialog } from '@/components/CreateTaskDialog'

export default function CalendarView() {
  const { tasks: contextTasks, setSelectedTaskId } = useProject()
  const [tasks, setTasks] = useState(contextTasks)
  const [currentDate, setCurrentDate] = useState(new Date())

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

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(monthStart)
  const startDate = startOfWeek(monthStart)
  const endDate = endOfWeek(monthEnd)

  const dateFormat = 'MMMM yyyy'
  const days = eachDayOfInterval({ start: startDate, end: endDate })

  const [isCreatingTask, setIsCreatingTask] = useState(false)
  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

  return (
    <div className="p-6 h-full flex flex-col bg-background">
      <CreateTaskDialog open={isCreatingTask} onOpenChange={setIsCreatingTask} />
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold tracking-tight">Calendário</h1>
          <Button size="sm" onClick={() => setIsCreatingTask(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Tarefa
          </Button>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-lg font-semibold capitalize w-40 text-center">
            {format(currentDate, dateFormat, { locale: ptBR })}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 border rounded-lg overflow-hidden flex flex-col bg-card">
        <div className="grid grid-cols-7 border-b bg-muted/50">
          {weekDays.map((day) => (
            <div
              key={day}
              className="p-2 text-center text-sm font-semibold text-muted-foreground border-r last:border-r-0"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="flex-1 grid grid-cols-7 grid-rows-5">
          {days.map((day, idx) => {
            const dayTasks = tasks.filter((t) => isSameDay(new Date(t.deadline), day))

            return (
              <div
                key={day.toString()}
                className={cn(
                  'border-b border-r p-2 min-h-[100px] transition-colors hover:bg-muted/10',
                  !isSameMonth(day, monthStart) && 'bg-muted/30 text-muted-foreground opacity-50',
                  idx % 7 === 6 && 'border-r-0',
                  idx >= 28 && 'border-b-0',
                )}
              >
                <div className="flex justify-between items-start mb-1">
                  <span
                    className={cn(
                      'text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full',
                      isToday(day) ? 'bg-primary text-primary-foreground' : '',
                    )}
                  >
                    {format(day, 'd')}
                  </span>
                </div>
                <div className="flex flex-col gap-1 overflow-y-auto max-h-[80px] kanban-scrollbar">
                  {dayTasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => setSelectedTaskId(task.id)}
                      className={cn(
                        'text-[10px] truncate px-1.5 py-0.5 rounded cursor-pointer border',
                        priorityColors[task.priority],
                      )}
                      title={task.title}
                    >
                      {task.title}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

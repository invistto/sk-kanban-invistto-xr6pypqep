import { Task } from '@/lib/mock-data'
import { useProject } from '@/store/project-context'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { CalendarIcon, CheckSquare } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, isPast, isToday } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface TaskCardProps {
  task: Task
}

export const priorityColors = {
  baixa: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300',
  media: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/50 dark:text-blue-300',
  alta: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/50 dark:text-orange-300',
  urgente: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/50 dark:text-red-300',
}

export const priorityLabels = {
  baixa: 'Baixa',
  media: 'Média',
  alta: 'Alta',
  urgente: 'Urgente',
}

export function TaskCard({ task }: TaskCardProps) {
  const { members, setSelectedTaskId } = useProject()
  const assignee = members.find((m) => m.id === task.assigneeId)
  const completedSubtasks = task.subtasks.filter((s) => s.completed).length

  const isOverdue = isPast(new Date(task.deadline)) && !isToday(new Date(task.deadline))

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('taskId', task.id)
  }

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={() => setSelectedTaskId(task.id)}
      className="group relative flex cursor-grab flex-col gap-3 rounded-lg border bg-card p-4 shadow-sm transition-all hover:shadow-md active:cursor-grabbing animate-in fade-in"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap gap-1">
          <Badge
            variant="outline"
            className={cn(
              'px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider',
              priorityColors[task.priority],
            )}
          >
            {priorityLabels[task.priority]}
          </Badge>
          {task.tags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="secondary" className="px-2 py-0.5 text-[10px] font-normal">
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      <h4 className="font-medium text-sm leading-tight text-foreground">{task.title}</h4>

      <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'flex items-center gap-1',
              isOverdue && task.columnId !== 'col4' ? 'text-red-500 font-medium' : '',
            )}
          >
            <CalendarIcon className="h-3.5 w-3.5" />
            <span>{format(new Date(task.deadline), 'd MMM', { locale: ptBR })}</span>
          </div>

          {task.subtasks.length > 0 && (
            <div className="flex items-center gap-1">
              <CheckSquare className="h-3.5 w-3.5" />
              <span>
                {completedSubtasks}/{task.subtasks.length}
              </span>
            </div>
          )}
        </div>

        {assignee && (
          <Avatar className="h-6 w-6 border border-background shadow-sm">
            <AvatarImage src={assignee.avatar} alt={assignee.name} />
            <AvatarFallback className="text-[10px]">
              {assignee.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    </div>
  )
}

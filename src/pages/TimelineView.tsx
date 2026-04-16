import { useProject } from '@/store/project-context'
import { differenceInDays, format, addDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function TimelineView() {
  const { tasks, columns, setSelectedTaskId } = useProject()

  // Sort tasks by creation date
  const sortedTasks = [...tasks].sort(
    (a, b) => new Date(a.created).getTime() - new Date(b.created).getTime(),
  )

  if (sortedTasks.length === 0) return <div className="p-6">Nenhuma tarefa encontrada.</div>

  const minDate = new Date(sortedTasks[0].created)
  const maxDateRaw = new Date(Math.max(...sortedTasks.map((t) => new Date(t.deadline).getTime())))
  const maxDate = addDays(maxDateRaw, 5) // Add buffer

  const totalDays = Math.max(15, differenceInDays(maxDate, minDate))

  return (
    <div className="p-6 h-full flex flex-col">
      <h1 className="text-2xl font-bold tracking-tight mb-6">Timeline</h1>

      <div className="flex-1 overflow-auto kanban-scrollbar bg-card border rounded-lg p-6 relative">
        <div className="relative min-w-[800px]">
          {/* Header / Grid lines */}
          <div className="flex border-b pb-2 mb-4 relative" style={{ marginLeft: '250px' }}>
            {Array.from({ length: Math.ceil(totalDays / 3) }).map((_, i) => {
              const date = addDays(minDate, i * 3)
              return (
                <div
                  key={i}
                  className="flex-1 text-xs text-muted-foreground border-l pl-1"
                  style={{ minWidth: '60px' }}
                >
                  {format(date, 'dd MMM', { locale: ptBR })}
                </div>
              )
            })}
          </div>

          {/* Tasks */}
          <div className="space-y-4">
            {sortedTasks.map((task) => {
              const startDiff = Math.max(0, differenceInDays(new Date(task.created), minDate))
              const duration = Math.max(
                1,
                differenceInDays(new Date(task.deadline), new Date(task.created)),
              )
              const col = columns.find((c) => c.id === task.columnId)

              // Calculate width and left offset based on totalDays grid
              const leftPercent = (startDiff / totalDays) * 100
              const widthPercent = (duration / totalDays) * 100

              return (
                <div key={task.id} className="flex items-center relative group">
                  <div className="w-[240px] shrink-0 pr-4 truncate font-medium text-sm border-r">
                    {task.title}
                    <div className="text-[10px] text-muted-foreground font-normal">
                      {col?.title}
                    </div>
                  </div>

                  <div className="flex-1 relative h-8 ml-2">
                    {/* Background grid lines for reference */}
                    <div className="absolute inset-0 flex border-b border-border/20"></div>

                    <div
                      onClick={() => setSelectedTaskId(task.id)}
                      className="absolute top-1 bottom-1 rounded-md bg-primary/20 border border-primary/50 cursor-pointer hover:bg-primary/30 transition-colors flex items-center px-2 overflow-hidden"
                      style={{ left: `${leftPercent}%`, width: `${Math.max(2, widthPercent)}%` }}
                    >
                      <span className="text-[10px] text-primary-foreground font-medium truncate opacity-0 group-hover:opacity-100 transition-opacity">
                        {duration} dias
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

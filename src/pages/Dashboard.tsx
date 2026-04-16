import { useProject } from '@/store/project-context'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts'
import { format, isPast, isToday, isThisWeek } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, CheckCircle2, Clock, ListTodo } from 'lucide-react'

export default function Dashboard() {
  const { tasks, columns, members, setSelectedTaskId, boards, activeBoardId } = useProject()

  const totalTasks = tasks.length
  const completedTasks = tasks.filter((t) => t.columnId === 'col4').length
  const overdueTasks = tasks.filter(
    (t) => isPast(new Date(t.deadline)) && !isToday(new Date(t.deadline)) && t.columnId !== 'col4',
  )
  const thisWeekTasks = tasks.filter(
    (t) => isThisWeek(new Date(t.deadline)) && t.columnId !== 'col4',
  )

  const statusData = columns
    .map((col, index) => ({
      name: col.title,
      value: tasks.filter((t) => t.columnId === col.id).length,
      fill: `hsl(var(--chart-${(index % 5) + 1}))`,
    }))
    .filter((d) => d.value > 0)

  const activeBoard = boards.find((b) => b.id === activeBoardId)
  const boardMemberIds = activeBoard?.members || []
  const boardUsers = members.filter(
    (m) => boardMemberIds.includes(m.id) || m.id === activeBoard?.owner_id,
  )

  const memberLoadData = boardUsers.map((m) => ({
    name: (m.name || m.email).split(' ')[0],
    tarefas: tasks.filter((t) => t.assigneeId === m.id && t.columnId !== 'col4').length,
  }))

  const chartConfig = {
    tarefas: { label: 'Tarefas', color: 'hsl(var(--primary))' },
  }

  return (
    <div className="p-6 h-full overflow-y-auto kanban-scrollbar space-y-6">
      <h1 className="text-2xl font-bold tracking-tight mb-2">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Tarefas
            </CardTitle>
            <ListTodo className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTasks}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Concluídas</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTasks}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {Math.round((completedTasks / totalTasks) * 100 || 0)}% de progresso
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Atrasadas</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{overdueTasks.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Entregas na Semana
            </CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{thisWeekTasks.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Carga por Pessoa</CardTitle>
            <CardDescription>Tarefas ativas atribuídas por membro da equipe.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ChartContainer config={chartConfig} className="h-full w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={memberLoadData}
                  margin={{ top: 20, right: 0, left: -20, bottom: 0 }}
                >
                  <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis tickLine={false} axisLine={false} fontSize={12} />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                  <Bar dataKey="tarefas" fill="var(--color-tarefas)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Status das Tarefas</CardTitle>
            <CardDescription>Distribuição atual no quadro.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ChartContainer config={{}} className="h-full w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
            <div className="flex flex-wrap justify-center gap-3 mt-4">
              {statusData.map((entry, index) => (
                <div key={index} className="flex items-center gap-1.5 text-sm">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: entry.fill }}
                  ></div>
                  <span className="text-muted-foreground">{entry.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Atenção: Atrasadas ou Próximas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...overdueTasks, ...thisWeekTasks].slice(0, 5).map((task) => (
              <div
                key={task.id}
                onClick={() => setSelectedTaskId(task.id)}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
              >
                <div>
                  <p className="font-medium text-sm">{task.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Prazo: {format(new Date(task.deadline), 'dd/MM/yyyy')}
                  </p>
                </div>
                <Badge
                  variant={
                    isPast(new Date(task.deadline)) && !isToday(new Date(task.deadline))
                      ? 'destructive'
                      : 'secondary'
                  }
                >
                  {isPast(new Date(task.deadline)) && !isToday(new Date(task.deadline))
                    ? 'Atrasada'
                    : 'Esta Semana'}
                </Badge>
              </div>
            ))}
            {[...overdueTasks, ...thisWeekTasks].length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhuma tarefa crítica no momento. Ótimo trabalho!
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

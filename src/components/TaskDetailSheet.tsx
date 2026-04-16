import { useProject } from '@/store/project-context'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CalendarIcon, Clock, MessageSquare, Tag, User } from 'lucide-react'
import { priorityColors, priorityLabels } from './TaskCard'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/hooks/use-auth'
import { useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'

export function TaskDetailSheet() {
  const {
    tasks,
    columns,
    members,
    selectedTaskId,
    setSelectedTaskId,
    updateTask,
    updateSubtask,
    addComment,
  } = useProject()
  const { user } = useAuth()
  const [newComment, setNewComment] = useState('')

  const task = tasks.find((t) => t.id === selectedTaskId)
  const column = columns.find((c) => c.id === task?.columnId)

  if (!task) return null

  const toggleSubtask = (subtaskId: string, current: boolean) => {
    updateSubtask(subtaskId, !current)
  }

  const handleAddComment = () => {
    if (!newComment.trim()) return
    addComment(task.id, newComment)
    setNewComment('')
  }

  return (
    <Sheet open={!!selectedTaskId} onOpenChange={(open) => !open && setSelectedTaskId(null)}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto kanban-scrollbar p-0">
        <div className="p-6 pb-2">
          <SheetHeader className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="font-normal">
                {column?.title}
              </Badge>
              <Badge variant="outline" className={priorityColors[task.priority]}>
                {priorityLabels[task.priority]}
              </Badge>
            </div>
            <SheetTitle className="text-xl font-bold leading-tight">{task.title}</SheetTitle>
          </SheetHeader>

          <div className="grid gap-6 mt-6">
            <div className="grid grid-cols-4 items-center gap-4">
              <div className="text-sm text-muted-foreground flex items-center gap-2 col-span-1">
                <User className="h-4 w-4" /> Responsável
              </div>
              <div className="col-span-3">
                <Select
                  value={task.assigneeId || 'none'}
                  onValueChange={(val) => updateTask(task.id, { assigneeId: val })}
                >
                  <SelectTrigger className="w-full h-8 bg-transparent border-transparent hover:bg-muted/50 px-2 -ml-2">
                    <SelectValue placeholder="Sem responsável" />
                  </SelectTrigger>
                  <SelectContent>
                    {members.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-5 w-5">
                            <AvatarImage src={m.avatar} />
                            <AvatarFallback>US</AvatarFallback>
                          </Avatar>
                          {m.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <div className="text-sm text-muted-foreground flex items-center gap-2 col-span-1">
                <CalendarIcon className="h-4 w-4" /> Prazo
              </div>
              <div className="col-span-3 text-sm px-2 -ml-2 font-medium">
                {format(new Date(task.deadline), "dd 'de' MMMM, yyyy", { locale: ptBR })}
              </div>
            </div>

            {task.description && (
              <div className="mt-2">
                <h4 className="text-sm font-semibold mb-2">Descrição</h4>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap bg-muted/30 p-3 rounded-md border">
                  {task.description}
                </p>
              </div>
            )}

            {task.subtasks.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold">Subtarefas</h4>
                  <span className="text-xs text-muted-foreground">
                    {task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length}{' '}
                    concluídas
                  </span>
                </div>
                <div className="space-y-2">
                  {task.subtasks.map((sub) => (
                    <div
                      key={sub.id}
                      className="flex items-center gap-3 p-2 rounded hover:bg-muted/50 transition-colors"
                    >
                      <Checkbox
                        id={sub.id}
                        checked={sub.completed}
                        onCheckedChange={() => toggleSubtask(sub.id, sub.completed)}
                      />
                      <label
                        htmlFor={sub.id}
                        className={`text-sm cursor-pointer flex-1 ${sub.completed ? 'line-through text-muted-foreground' : ''}`}
                      >
                        {sub.title}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <Separator className="my-2" />

        <div className="p-6 pt-2 bg-muted/10 h-full min-h-[200px]">
          <h4 className="text-sm font-semibold flex items-center gap-2 mb-4">
            <MessageSquare className="h-4 w-4" /> Comentários
          </h4>

          <div className="space-y-4 mb-4">
            {task.comments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhum comentário ainda.
              </p>
            ) : (
              task.comments.map((comment) => {
                const author = members.find((m) => m.id === comment.user_id)
                return (
                  <div key={comment.id} className="flex gap-3">
                    <Avatar className="h-8 w-8 mt-0.5">
                      <AvatarFallback>
                        {author?.name?.substring(0, 2).toUpperCase() || 'US'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 bg-background border rounded-lg p-3 shadow-sm">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{author?.name || 'Usuário'}</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(comment.created), 'dd MMM HH:mm', { locale: ptBR })}
                        </span>
                      </div>
                      <p className="text-sm text-foreground">{comment.content}</p>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          <div className="flex gap-3">
            <Avatar className="h-8 w-8 mt-0.5">
              <AvatarFallback>{user?.name?.substring(0, 2).toUpperCase() || 'ME'}</AvatarFallback>
            </Avatar>
            <div className="flex-1 flex flex-col gap-2">
              <textarea
                className="w-full min-h-[80px] text-sm rounded-md border bg-background px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                placeholder="Adicione um comentário... (Use @ para mencionar)"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <div className="flex justify-end">
                <Button size="sm" onClick={handleAddComment}>
                  Comentar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

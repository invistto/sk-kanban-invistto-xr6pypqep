import { useProject } from '@/store/project-context'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  CalendarIcon,
  Clock,
  MessageSquare,
  Tag,
  User,
  Edit2,
  Image as ImageIcon,
  X,
  Paperclip,
  ZoomIn,
  ZoomOut,
  RefreshCcw,
  File as FileIcon,
} from 'lucide-react'
import { priorityColors, priorityLabels } from './TaskCard'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/hooks/use-auth'
import { useState, useEffect } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import pb from '@/lib/pocketbase/client'
import { extractFieldErrors } from '@/lib/pocketbase/errors'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

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
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Preview Image State
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [zoomLevel, setZoomLevel] = useState(1)

  const task = tasks.find((t) => t.id === selectedTaskId)
  const column = columns.find((c) => c.id === task?.columnId)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'baixa',
    deadline: new Date().toISOString(),
    tags: [] as string[],
    responsible_id: 'none',
  })
  const [tagInput, setTagInput] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [filesToRemove, setFilesToRemove] = useState<string[]>([])

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'baixa',
        deadline: task.deadline || task.due_date || new Date().toISOString(),
        tags: task.tags || [],
        responsible_id: task.responsible_id || task.assigneeId || 'none',
      })
      setFiles([])
      setFilesToRemove([])
      setErrors({})
    } else {
      setIsEditing(false)
    }
  }, [task])

  // Reset zoom when opening/closing preview
  useEffect(() => {
    if (!previewImage) setZoomLevel(1)
  }, [previewImage])

  // Global Paste Event Listener
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      if (!selectedTaskId) return
      if (!e.clipboardData || e.clipboardData.files.length === 0) return

      const pastedFiles = Array.from(e.clipboardData.files)
      if (pastedFiles.length === 0) return

      e.preventDefault()

      const MAX_FILE_SIZE = 5 * 1024 * 1024
      const invalidFiles = pastedFiles.filter((f) => f.size > MAX_FILE_SIZE)
      if (invalidFiles.length > 0) {
        toast.error(`Arquivo(s) excede(m) o limite de 5MB.`)
        return
      }

      if (isEditing) {
        setFiles((prev) => [...prev, ...pastedFiles])
        toast.success(`${pastedFiles.length} arquivo(s) adicionado(s) à lista.`)
      } else {
        try {
          toast.info(`Anexando ${pastedFiles.length} arquivo(s)...`)
          const pbData = new FormData()

          // Keep existing files
          const existingFiles = (task as any)?.files || []
          existingFiles.forEach((f: string) => pbData.append('files', f))

          // Add new pasted files
          pastedFiles.forEach((f) => pbData.append('files', f))

          const pbRecord = await pb.collection('tasks').update(selectedTaskId, pbData)

          updateTask(selectedTaskId, {
            files: pbRecord.files,
          })
          toast.success('Arquivo(s) anexado(s) com sucesso!')
        } catch (err: any) {
          console.error('Error pasting files:', err)
          const errors = extractFieldErrors(err)
          if (errors.files) {
            toast.error(`Erro: ${errors.files}`)
          } else {
            toast.error('Erro ao anexar arquivo(s). Verifique o formato e o tamanho.')
          }
        }
      }
    }

    if (selectedTaskId) {
      document.addEventListener('paste', handlePaste)
    }
    return () => {
      document.removeEventListener('paste', handlePaste)
    }
  }, [selectedTaskId, isEditing, updateTask, task])

  if (!task) return null

  const toggleSubtask = (subtaskId: string, current: boolean) => {
    updateSubtask(subtaskId, !current)
  }

  const handleAddComment = () => {
    if (!newComment.trim()) return
    addComment(task.id, newComment)
    setNewComment('')
  }

  const handleAddTag = (e: React.KeyboardEvent | React.MouseEvent) => {
    if (('key' in e && e.key === 'Enter') || e.type === 'click') {
      e.preventDefault()
      if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
        setFormData((prev) => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }))
      }
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tagToRemove) }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      const MAX_FILE_SIZE = 5 * 1024 * 1024
      const validFiles = newFiles.filter((f) => f.size <= MAX_FILE_SIZE)
      const invalidFiles = newFiles.filter((f) => f.size > MAX_FILE_SIZE)

      if (invalidFiles.length > 0) {
        toast.error(
          `${invalidFiles.length} arquivo(s) excede(m) o limite de 5MB e não foram adicionados.`,
        )
      }

      if (validFiles.length > 0) {
        setFiles((prev) => [...prev, ...validFiles])
      }
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    setErrors({})
    try {
      if (!formData.title.trim()) {
        setErrors({ title: 'O título não pode estar vazio.' })
        setIsSaving(false)
        return
      }

      const pbData = new FormData()
      pbData.append('title', formData.title)
      pbData.append('description', formData.description)
      pbData.append('priority', formData.priority)
      pbData.append('due_date', formData.deadline)
      pbData.append('tags', JSON.stringify(formData.tags))
      if (formData.responsible_id && formData.responsible_id !== 'none') {
        pbData.append('responsible_id', formData.responsible_id)
      } else {
        pbData.append('responsible_id', '')
      }

      pbData.append('board_id', (task as any).board_id || task.boardId || '')
      pbData.append('column_id', (task as any).column_id || task.columnId || '')

      // PocketBase requires passing all files we want to KEEP as strings, plus the NEW files.
      const filesToKeep = ((task as any).files || []).filter(
        (f: string) => !filesToRemove.includes(f),
      )
      filesToKeep.forEach((f: string) => pbData.append('files', f))
      files.forEach((f) => pbData.append('files', f))

      let pbRecord
      try {
        pbRecord = await pb.collection('tasks').update(task.id, pbData)
      } catch (err: any) {
        if (err.status === 404) {
          console.warn('Tarefa não encontrada no PocketBase. Atualizando apenas localmente.')
        } else {
          throw err
        }
      }

      updateTask(task.id, {
        title: formData.title,
        description: formData.description,
        priority: formData.priority as any,
        deadline: formData.deadline,
        due_date: formData.deadline,
        tags: formData.tags,
        assigneeId: formData.responsible_id !== 'none' ? formData.responsible_id : undefined,
        responsible_id: formData.responsible_id !== 'none' ? formData.responsible_id : undefined,
        ...(pbRecord?.files ? { files: pbRecord.files } : {}),
      })

      setIsEditing(false)
      setFiles([])
      setFilesToRemove([])
      toast.success('Tarefa atualizada com sucesso.')
    } catch (error) {
      console.error(error)
      setErrors(extractFieldErrors(error))
      toast.error('Erro ao atualizar tarefa.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      <Dialog open={!!selectedTaskId} onOpenChange={(open) => !open && setSelectedTaskId(null)}>
        <DialogContent className="sm:max-w-2xl p-0 overflow-hidden flex flex-col max-h-[90vh]">
          <div className="px-6 py-4 border-b shrink-0 bg-background z-10 relative">
            {!isEditing ? (
              <DialogHeader className="flex flex-row items-start justify-between space-y-0 pr-6">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="font-normal">
                      {column?.title}
                    </Badge>
                    <Badge variant="outline" className={priorityColors[task.priority]}>
                      {priorityLabels[task.priority]}
                    </Badge>
                  </div>
                  <DialogTitle className="text-xl font-bold leading-tight text-left">
                    {task.title}
                  </DialogTitle>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="shrink-0 mt-0"
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              </DialogHeader>
            ) : (
              <DialogHeader>
                <DialogTitle>Editar Tarefa</DialogTitle>
              </DialogHeader>
            )}
          </div>

          <div className="flex-1 overflow-y-auto kanban-scrollbar">
            <div className="p-6">
              {!isEditing ? (
                <>
                  <div className="grid gap-6">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <div className="text-sm text-muted-foreground flex items-center gap-2 col-span-1">
                        <User className="h-4 w-4" /> Responsável
                      </div>
                      <div className="col-span-3">
                        <Select
                          value={task.responsible_id || task.assigneeId || 'none'}
                          onValueChange={async (val) => {
                            const responsible = val === 'none' ? null : val
                            try {
                              await pb
                                .collection('tasks')
                                .update(task.id, { responsible_id: responsible })
                              updateTask(task.id, {
                                assigneeId: responsible,
                                responsible_id: responsible,
                              })
                            } catch (e) {
                              console.error(e)
                            }
                          }}
                        >
                          <SelectTrigger className="w-full h-8 bg-transparent border-transparent hover:bg-muted/50 px-2 -ml-2">
                            <SelectValue placeholder="Sem responsável" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Sem responsável</SelectItem>
                            {members.map((m) => (
                              <SelectItem key={m.id} value={m.id}>
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-5 w-5">
                                    <AvatarImage
                                      src={m.avatar ? pb.files.getURL(m, m.avatar) : undefined}
                                    />
                                    <AvatarFallback>
                                      {m.name?.substring(0, 2).toUpperCase() || 'US'}
                                    </AvatarFallback>
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
                        {task.deadline || task.due_date
                          ? format(new Date(task.deadline || task.due_date), "dd 'de' MMMM, yyyy", {
                              locale: ptBR,
                            })
                          : 'Sem prazo'}
                      </div>
                    </div>

                    {task.tags && task.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {task.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="px-2 py-0.5 text-xs font-normal"
                          >
                            <Tag className="w-3 h-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {task.description && (
                      <div className="mt-2">
                        <h4 className="text-sm font-semibold mb-2">Descrição</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap bg-muted/30 p-3 rounded-md border">
                          {task.description}
                        </p>
                      </div>
                    )}

                    {/* Readonly Files & Images */}
                    {(task as any).files?.length > 0 && (
                      <div className="mt-2">
                        <h4 className="text-sm font-semibold flex items-center gap-2 mb-3">
                          <Paperclip className="h-4 w-4" /> Anexos
                        </h4>
                        <div className="flex flex-wrap gap-3">
                          {(task as any).files.map((filename: string, i: number) => {
                            const fileUrl = (task as any).collectionId
                              ? pb.files.getURL(task as any, filename)
                              : `https://img.usecurling.com/p/200/200?q=document&seed=${i}`
                            const isImage = filename.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i)

                            if (isImage) {
                              return (
                                <button
                                  key={i}
                                  type="button"
                                  onClick={() => setPreviewImage(fileUrl)}
                                  className="block relative group rounded-md border overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                                >
                                  <img
                                    src={fileUrl}
                                    alt="Anexo"
                                    className="w-24 h-24 object-cover"
                                  />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <ZoomIn className="h-6 w-6 text-white" />
                                  </div>
                                </button>
                              )
                            } else {
                              return (
                                <a
                                  key={i}
                                  href={fileUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="flex items-center gap-2 p-2 rounded-md border shadow-sm hover:shadow-md transition-shadow bg-muted/20 w-48 h-24 overflow-hidden"
                                >
                                  <div className="bg-primary/10 p-2 rounded-md">
                                    <FileIcon className="h-6 w-6 text-primary" />
                                  </div>
                                  <span
                                    className="text-xs truncate flex-1 font-medium"
                                    title={filename}
                                  >
                                    {filename}
                                  </span>
                                </a>
                              )
                            }
                          })}
                        </div>
                      </div>
                    )}

                    {task.subtasks.length > 0 && (
                      <div className="mt-2">
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
                </>
              ) : (
                <>
                  <div className="space-y-5">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">
                        Título <span className="text-red-500">*</span>
                      </label>
                      <Input
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Ex: Desenvolver nova funcionalidade"
                      />
                      {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Descrição</label>
                      <Textarea
                        className="min-h-[100px]"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Adicione detalhes sobre esta tarefa..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-1.5 block">Prioridade</label>
                        <Select
                          value={formData.priority}
                          onValueChange={(v) => setFormData({ ...formData, priority: v })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="baixa">Baixa</SelectItem>
                            <SelectItem value="media">Média</SelectItem>
                            <SelectItem value="alta">Alta</SelectItem>
                            <SelectItem value="urgente">Urgente</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-1.5 block">Responsável</label>
                        <Select
                          value={formData.responsible_id}
                          onValueChange={(v) => setFormData({ ...formData, responsible_id: v })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Sem responsável" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Sem responsável</SelectItem>
                            {members.map((m) => (
                              <SelectItem key={m.id} value={m.id}>
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-5 w-5">
                                    <AvatarImage
                                      src={m.avatar ? pb.files.getURL(m, m.avatar) : undefined}
                                    />
                                    <AvatarFallback>
                                      {m.name?.substring(0, 2).toUpperCase() || 'US'}
                                    </AvatarFallback>
                                  </Avatar>
                                  {m.name}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-1.5 block">Prazo</label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                'w-full justify-start text-left font-normal',
                                !formData.deadline && 'text-muted-foreground',
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {formData.deadline
                                ? format(new Date(formData.deadline), 'dd MMM yyyy', {
                                    locale: ptBR,
                                  })
                                : 'Selecionar data'}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={new Date(formData.deadline)}
                              onSelect={(date) =>
                                date && setFormData({ ...formData, deadline: date.toISOString() })
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        {errors.due_date && (
                          <p className="text-xs text-red-500 mt-1">{errors.due_date}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Tags</label>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {formData.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="flex items-center gap-1.5 px-2 py-1"
                          >
                            {tag}
                            <X
                              className="h-3 w-3 cursor-pointer hover:text-red-500"
                              onClick={() => removeTag(tag)}
                            />
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={handleAddTag}
                          placeholder="Adicionar tag e pressionar Enter"
                        />
                        <Button type="button" variant="secondary" onClick={handleAddTag}>
                          Adicionar
                        </Button>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-1.5 block">
                        Anexos (Arquivos e Imagens)
                      </label>
                      <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center bg-muted/20 text-center hover:bg-muted/50 transition-colors relative cursor-pointer group">
                        <Paperclip className="h-8 w-8 text-muted-foreground mb-2 group-hover:text-primary transition-colors" />
                        <p className="text-sm font-medium text-foreground mb-1">
                          Clique ou cole (Ctrl+V) para fazer upload
                        </p>
                        <span className="text-xs text-muted-foreground">
                          Qualquer tipo de arquivo (Max. 5MB)
                        </span>
                        <Input
                          type="file"
                          multiple
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          onChange={handleFileChange}
                        />
                      </div>

                      {(files.length > 0 ||
                        ((task as any).files &&
                          (task as any).files.length > 0 &&
                          (task as any).files.filter((f: string) => !filesToRemove.includes(f))
                            .length > 0)) && (
                        <div className="flex flex-wrap gap-3 mt-4">
                          {/* Existing files */}
                          {(task as any).files
                            ?.filter((f: string) => !filesToRemove.includes(f))
                            .map((filename: string, i: number) => {
                              const fileUrl = (task as any).collectionId
                                ? pb.files.getURL(task as any, filename)
                                : `https://img.usecurling.com/p/100/100?q=doc&seed=${i}`
                              const isImage = filename.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i)
                              return (
                                <div
                                  key={`existing-${i}`}
                                  className="relative group rounded-md border overflow-hidden shadow-sm flex items-center justify-center bg-muted/20"
                                  style={{ width: '64px', height: '64px' }}
                                >
                                  {isImage ? (
                                    <div
                                      className="w-full h-full cursor-pointer relative"
                                      onClick={() => setPreviewImage(fileUrl)}
                                    >
                                      <img
                                        src={fileUrl}
                                        className="w-full h-full object-cover"
                                        alt="Anexo existente"
                                      />
                                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <ZoomIn className="h-4 w-4 text-white" />
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center cursor-default">
                                      <FileIcon className="h-6 w-6 text-muted-foreground" />
                                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none flex items-center justify-center">
                                        <span className="text-[10px] text-white truncate max-w-[50px] px-1">
                                          {filename}
                                        </span>
                                      </div>
                                    </div>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => setFilesToRemove((prev) => [...prev, filename])}
                                    className="absolute top-1 right-1 bg-background/80 text-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground z-10"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </div>
                              )
                            })}
                          {/* New files pending upload */}
                          {files.map((f, i) => {
                            const isImage = f.type.startsWith('image/')
                            const objectUrl = isImage ? URL.createObjectURL(f) : ''
                            return (
                              <div
                                key={i}
                                className="relative group rounded-md border overflow-hidden shadow-sm flex items-center justify-center bg-muted/20"
                                style={{ width: '64px', height: '64px' }}
                              >
                                {isImage ? (
                                  <div
                                    className="w-full h-full cursor-pointer relative"
                                    onClick={() => setPreviewImage(objectUrl)}
                                  >
                                    <img
                                      src={objectUrl}
                                      className="w-full h-full object-cover"
                                      alt="Novo anexo"
                                    />
                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                      <ZoomIn className="h-4 w-4 text-white" />
                                    </div>
                                  </div>
                                ) : (
                                  <FileIcon className="h-8 w-8 text-muted-foreground" />
                                )}
                                <button
                                  type="button"
                                  onClick={() => setFiles(files.filter((_, idx) => idx !== i))}
                                  className="absolute top-1 right-1 bg-background/80 text-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground z-10"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                                {!isImage && (
                                  <div className="absolute bottom-0 inset-x-0 bg-primary/80 py-0.5 px-1 z-10">
                                    <p className="text-[8px] text-primary-foreground text-center truncate">
                                      {f.name}
                                    </p>
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      )}
                      {errors.files && <p className="text-xs text-red-500 mt-1">{errors.files}</p>}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Comments section - Only shown in read-only mode */}
            {!isEditing && (
              <>
                <Separator />
                <div className="p-6 bg-muted/10 min-h-[200px]">
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
                                <span className="text-sm font-medium">
                                  {author?.name || 'Usuário'}
                                </span>
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {format(new Date(comment.created), 'dd MMM HH:mm', {
                                    locale: ptBR,
                                  })}
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
                      <AvatarFallback>
                        {user?.name?.substring(0, 2).toUpperCase() || 'ME'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 flex flex-col gap-2">
                      <Textarea
                        className="min-h-[80px] text-sm resize-none"
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
              </>
            )}
          </div>

          {isEditing && (
            <DialogFooter className="p-4 border-t bg-muted/50 sm:justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                Cancelar
              </Button>
              <Button type="button" onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      {/* Image Previewer Dialog */}
      <Dialog open={!!previewImage} onOpenChange={(open) => !open && setPreviewImage(null)}>
        <DialogContent className="max-w-[95vw] h-[95vh] p-0 bg-transparent border-none shadow-none flex flex-col [&>button]:hidden">
          <DialogHeader className="sr-only">
            <DialogTitle>Visualizar Imagem</DialogTitle>
          </DialogHeader>
          <div className="absolute top-0 right-0 z-50 flex items-center gap-2 bg-black/60 p-2 rounded-bl-xl text-white">
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.max(0.5, z - 0.25))}
              className="p-1.5 hover:bg-white/20 rounded-md transition-colors"
              title="Menos Zoom"
            >
              <ZoomOut className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel(1)}
              className="p-1.5 hover:bg-white/20 rounded-md transition-colors"
              title="Tamanho Real"
            >
              <RefreshCcw className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.min(5, z + 0.25))}
              className="p-1.5 hover:bg-white/20 rounded-md transition-colors"
              title="Mais Zoom"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
            <div className="w-px h-5 bg-white/30 mx-1" />
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="p-1.5 hover:bg-destructive rounded-md transition-colors"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div
            className="flex-1 w-full h-full flex items-center justify-center overflow-auto kanban-scrollbar relative"
            onClick={() => setPreviewImage(null)}
            onWheel={(e) => {
              const delta = e.deltaY < 0 ? 0.1 : -0.1
              setZoomLevel((z) => Math.min(Math.max(0.5, z + delta), 5))
            }}
          >
            <div
              style={{
                width: `${zoomLevel * 100}%`,
                height: `${zoomLevel * 100}%`,
                minWidth: '100%',
                minHeight: '100%',
              }}
              className="flex items-center justify-center transition-all duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={previewImage || ''}
                alt="Preview Completo"
                className="object-contain max-w-full max-h-full"
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

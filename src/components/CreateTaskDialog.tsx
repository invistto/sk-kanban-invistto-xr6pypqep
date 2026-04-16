import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Badge } from '@/components/ui/badge'
import { CalendarIcon, Image as ImageIcon, X } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { useProject } from '@/store/project-context'
import pb from '@/lib/pocketbase/client'
import { extractFieldErrors } from '@/lib/pocketbase/errors'
import { useToast } from '@/hooks/use-toast'
import { ScrollArea } from '@/components/ui/scroll-area'

export function CreateTaskDialog({
  open,
  onOpenChange,
  defaultColumnId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultColumnId?: string
}) {
  const { activeBoardId, tasks, columns } = useProject()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'baixa',
    deadline: new Date().toISOString(),
    columnId: defaultColumnId || (columns.length > 0 ? columns[0].id : ''),
    tags: [] as string[],
  })

  useEffect(() => {
    if (open) {
      setFormData((prev) => ({
        ...prev,
        columnId: defaultColumnId || (columns.length > 0 ? columns[0].id : prev.columnId),
        title: '',
        description: '',
        priority: 'baixa',
        deadline: new Date().toISOString(),
        tags: [],
      }))
      setFiles([])
      setErrors({})
    }
  }, [open, defaultColumnId, columns])

  const [tagInput, setTagInput] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleAddTag = (e: React.KeyboardEvent | React.MouseEvent) => {
    if (('key' in e && e.key === 'Enter') || e.type === 'click') {
      e.preventDefault()
      const trimmed = tagInput.trim()
      if (trimmed && !formData.tags.includes(trimmed)) {
        setFormData((prev) => ({ ...prev, tags: [...prev.tags, trimmed] }))
      }
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tagToRemove) }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files!)])
    }
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
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

      if (!formData.columnId) {
        setErrors({ columnId: 'Selecione uma coluna.' })
        setIsSaving(false)
        return
      }

      const pbData = new FormData()
      pbData.append('board_id', activeBoardId || '')
      pbData.append('column_id', formData.columnId)
      pbData.append('title', formData.title)
      pbData.append('description', formData.description)
      pbData.append('priority', formData.priority)
      pbData.append('due_date', formData.deadline)
      pbData.append('tags', JSON.stringify(formData.tags))
      pbData.append('order', String(tasks.filter((t) => t.columnId === formData.columnId).length))

      files.forEach((f) => pbData.append('files', f))

      await pb.collection('tasks').create(pbData)

      toast({ title: 'Tarefa criada com sucesso!' })
      onOpenChange(false)
    } catch (error) {
      console.error(error)
      setErrors(extractFieldErrors(error))
      toast({ title: 'Erro ao criar tarefa', variant: 'destructive' })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl p-0 overflow-hidden flex flex-col max-h-[90vh]">
        <ScrollArea className="flex-1 kanban-scrollbar">
          <div className="p-6">
            <DialogHeader className="mb-6">
              <DialogTitle>Criar Nova Tarefa</DialogTitle>
            </DialogHeader>
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
                  <label className="text-sm font-medium mb-1.5 block">Status (Coluna)</label>
                  <Select
                    value={formData.columnId}
                    onValueChange={(v) => setFormData({ ...formData, columnId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {columns.map((col) => (
                        <SelectItem key={col.id} value={col.id}>
                          {col.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.columnId && (
                    <p className="text-xs text-red-500 mt-1">{errors.columnId}</p>
                  )}
                </div>

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
                          ? format(new Date(formData.deadline), 'dd MMM yyyy', { locale: ptBR })
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
                <label className="text-sm font-medium mb-1.5 block">Imagens (Anexos)</label>
                <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center bg-muted/20 text-center hover:bg-muted/50 transition-colors relative cursor-pointer">
                  <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm font-medium text-foreground mb-1">
                    Clique para fazer upload
                  </p>
                  <span className="text-xs text-muted-foreground">PNG, JPG, WEBP (Max. 5MB)</span>
                  <Input
                    type="file"
                    multiple
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handleFileChange}
                  />
                </div>

                {files.length > 0 && (
                  <div className="flex flex-wrap gap-3 mt-4">
                    {files.map((f, i) => (
                      <div
                        key={i}
                        className="relative group rounded-md border overflow-hidden shadow-sm"
                      >
                        <img
                          src={URL.createObjectURL(f)}
                          className="w-16 h-16 object-cover"
                          alt="Novo anexo"
                        />
                        <button
                          type="button"
                          onClick={() => removeFile(i)}
                          className="absolute top-1 right-1 bg-background/80 text-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {errors.files && <p className="text-xs text-red-500 mt-1">{errors.files}</p>}
              </div>
            </div>
          </div>
        </ScrollArea>
        <DialogFooter className="p-4 border-t bg-muted/50 sm:justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Salvando...' : 'Criar Tarefa'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

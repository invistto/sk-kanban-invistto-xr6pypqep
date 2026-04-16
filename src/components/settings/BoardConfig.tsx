import { useProject } from '@/store/project-context'
import { Input } from '@/components/ui/input'
import { useState, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'
import { ColumnManager } from './ColumnManager'
import { BoardMembers } from './BoardMembers'

export function BoardConfig() {
  const { activeBoardId, boards, updateBoard } = useProject()
  const { toast } = useToast()
  const activeBoard = boards.find((b) => b.id === activeBoardId)

  const [name, setName] = useState(activeBoard?.name || '')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (activeBoard) setName(activeBoard.name)
  }, [activeBoard])

  if (!activeBoard) {
    return (
      <div className="p-8 text-center text-muted-foreground border border-dashed rounded-xl mt-4">
        Selecione ou crie um quadro primeiro.
      </div>
    )
  }

  const handleSaveName = async () => {
    if (name.trim() === activeBoard.name || !name.trim()) return
    setIsSaving(true)
    try {
      await updateBoard(activeBoard.id, { name: name.trim() })
      toast({ title: 'Nome do quadro atualizado' })
    } catch {
      toast({ title: 'Erro ao atualizar nome', variant: 'destructive' })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="animate-fade-in pb-10">
      <section className="bg-card p-6 border rounded-xl shadow-sm">
        <h2 className="text-lg font-medium mb-4">Nome do Quadro</h2>
        <div className="flex items-center gap-3">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={handleSaveName}
            onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
            className="max-w-md bg-background"
          />
          {isSaving && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
        </div>
      </section>

      <ColumnManager />
      <BoardMembers />
    </div>
  )
}

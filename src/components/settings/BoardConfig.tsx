import { useProject } from '@/store/project-context'
import { Input } from '@/components/ui/input'
import { useState, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Copy } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ColumnManager } from './ColumnManager'
import { BoardMembers } from './BoardMembers'
import { useAuth } from '@/hooks/use-auth'

export function BoardConfig() {
  const { user } = useAuth()
  const { activeBoardId, setActiveBoardId, boards, updateBoard } = useProject()
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
    <div className="animate-fade-in pb-10 space-y-6">
      <section className="bg-card p-6 border rounded-xl shadow-sm">
        <div className="mb-6 border-b pb-6">
          <label className="text-sm font-medium mb-2 block text-muted-foreground">
            Quadro Selecionado
          </label>
          <Select value={activeBoardId || ''} onValueChange={setActiveBoardId}>
            <SelectTrigger className="w-full max-w-md bg-background">
              <SelectValue placeholder="Selecione um quadro..." />
            </SelectTrigger>
            <SelectContent>
              {boards.map((b) => (
                <SelectItem key={b.id} value={b.id}>
                  {b.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-lg font-medium">Nome do Quadro</h2>
          {user?.is_admin && activeBoard && (
            <div className="flex items-center gap-1 bg-muted px-2 py-1 rounded">
              <span className="text-xs font-normal text-muted-foreground font-mono select-all">
                ID: {activeBoard.id}
              </span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(activeBoard.id)
                  toast({ title: 'ID copiado!' })
                }}
                className="text-muted-foreground hover:text-foreground ml-1"
                title="Copiar ID"
              >
                <Copy className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
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

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Settings as SettingsIcon } from 'lucide-react'
import { BoardConfig } from '@/components/settings/BoardConfig'
import { GlobalTeam } from '@/components/settings/GlobalTeam'

export default function Settings() {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8 h-full overflow-y-auto kanban-scrollbar pb-20">
      <div className="flex items-center gap-3">
        <div className="bg-primary/10 p-2 rounded-lg">
          <SettingsIcon className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
      </div>

      <Tabs defaultValue="board" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8 max-w-md bg-muted/50 p-1">
          <TabsTrigger value="board" className="rounded-md data-[state=active]:shadow-sm">
            Quadro Atual
          </TabsTrigger>
          <TabsTrigger value="team" className="rounded-md data-[state=active]:shadow-sm">
            Equipe Global
          </TabsTrigger>
        </TabsList>

        <TabsContent value="board" className="focus-visible:outline-none">
          <BoardConfig />
        </TabsContent>

        <TabsContent value="team" className="focus-visible:outline-none">
          <GlobalTeam />
        </TabsContent>
      </Tabs>
    </div>
  )
}

import { useProject } from '@/store/project-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Settings as SettingsIcon, GripVertical, UserPlus, Trash2 } from 'lucide-react'

export default function Settings() {
  const { columns, members } = useProject()

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8 h-full overflow-y-auto kanban-scrollbar">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-primary/10 p-2 rounded-lg">
          <SettingsIcon className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gestão de Colunas (Workflow)</CardTitle>
          <CardDescription>
            Defina as etapas do seu processo Kanban. Arraste para reordenar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {columns.map((col) => (
              <div
                key={col.id}
                className="flex items-center gap-3 p-3 bg-muted/30 border rounded-md"
              >
                <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                <Input defaultValue={col.title} className="max-w-sm bg-background" />
                <Button variant="ghost" size="icon" className="text-destructive ml-auto">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button variant="outline" className="mt-4">
              Adicionar Coluna
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Membros da Equipe</CardTitle>
            <CardDescription>Gerencie quem tem acesso ao projeto.</CardDescription>
          </div>
          <Button size="sm">
            <UserPlus className="h-4 w-4 mr-2" /> Convidar Membro
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Membro</TableHead>
                <TableHead>Função</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{member.name}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={member.role === 'admin' ? 'default' : 'secondary'}>
                      {member.role === 'admin' ? 'Administrador' : 'Membro'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="text-muted-foreground">
                      Editar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

import { useProject } from '@/store/project-context'
import { Button } from '@/components/ui/button'
import pb from '@/lib/pocketbase/client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { UserPlus, Mail } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useState } from 'react'
import { Input } from '@/components/ui/input'

export function GlobalTeam() {
  const { members } = useProject()
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [isInviting, setIsInviting] = useState(false)

  const handleInvite = async () => {
    if (!email) return
    setIsInviting(true)
    try {
      await pb.collection('users').create({
        email,
        password: 'TemporaryPassword123!',
        passwordConfirm: 'TemporaryPassword123!',
        name: email.split('@')[0],
      })
      toast({
        title: 'Usuário adicionado!',
        description: `O usuário ${email} foi adicionado à equipe global.`,
      })
      setEmail('')
    } catch (err: any) {
      console.error(err)
      toast({ title: 'Erro ao adicionar usuário', variant: 'destructive' })
    } finally {
      setIsInviting(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card p-6 border rounded-xl shadow-sm">
        <div>
          <h2 className="text-xl font-semibold">Equipe Global</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie todos os usuários cadastrados na plataforma e envie novos convites.
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Input
            placeholder="Email do novo membro"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full sm:w-[250px]"
            type="email"
          />
          <Button
            onClick={handleInvite}
            disabled={!email || isInviting}
            className="bg-indigo-500 hover:bg-indigo-600 shrink-0"
          >
            <UserPlus className="h-4 w-4 mr-2" /> Convidar
          </Button>
        </div>
      </div>

      <div className="border rounded-xl bg-card overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Usuário</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((m) => (
              <TableRow key={m.id}>
                <TableCell className="flex items-center gap-3 py-4">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={m.avatar} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {(m.name || m.email).substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{m.name || m.email}</span>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" /> {m.email}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className="font-normal text-emerald-600 bg-emerald-50 hover:bg-emerald-50 border-emerald-200"
                  >
                    Ativo
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

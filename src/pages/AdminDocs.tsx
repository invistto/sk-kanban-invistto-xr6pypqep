import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import pb from '@/lib/pocketbase/client'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import { EndpointsTab } from '@/components/admin/EndpointsTab'
import { BoardsTab } from '@/components/admin/BoardsTab'
import { UsersTab } from '@/components/admin/UsersTab'

export default function AdminDocs() {
  const { user } = useAuth()
  const [boards, setBoards] = useState<any[]>([])
  const [columns, setColumns] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [b, c, u] = await Promise.all([
          pb.collection('boards').getFullList({ sort: '-created' }),
          pb.collection('columns').getFullList({ sort: 'order' }),
          pb.collection('users').getFullList({ sort: '-created' }),
        ])
        setBoards(b)
        setColumns(c)
        setUsers(u)
      } catch (error) {
        console.error(error)
        toast.error('Failed to load data')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="p-8 flex justify-center text-muted-foreground">Loading documentation...</div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">API Documentation</h1>
          <p className="text-muted-foreground">
            Internal reference for external tool integrations.
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 dark:bg-green-950/50 dark:text-green-400 rounded-lg border border-green-200 dark:border-green-800/50">
          <ShieldCheck className="h-5 w-5" />
          <span className="font-semibold text-sm">Admin Access: Verified</span>
        </div>
      </div>

      <Tabs defaultValue="endpoints" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="endpoints">API Endpoints</TabsTrigger>
          <TabsTrigger value="boards">Boards & Columns</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        <TabsContent value="endpoints">
          <EndpointsTab boards={boards} columns={columns} users={users} />
        </TabsContent>

        <TabsContent value="boards">
          <BoardsTab boards={boards} columns={columns} />
        </TabsContent>

        <TabsContent value="users">
          <UsersTab users={users} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

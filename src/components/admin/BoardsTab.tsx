import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Copy } from 'lucide-react'
import { toast } from 'sonner'

interface BoardsTabProps {
  boards: any[]
  columns: any[]
}

export function BoardsTab({ boards, columns }: BoardsTabProps) {
  const copyToClipboard = (text: string, description: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${description} copied to clipboard`)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Boards</CardTitle>
          <CardDescription>List of all boards and their IDs.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Board Name</TableHead>
                <TableHead>Board ID</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {boards.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground py-6">
                    No boards found.
                  </TableCell>
                </TableRow>
              ) : (
                boards.map((board) => (
                  <TableRow key={board.id}>
                    <TableCell className="font-medium">{board.name}</TableCell>
                    <TableCell>
                      <code className="bg-muted px-1.5 py-0.5 rounded text-xs">{board.id}</code>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(board.id, 'Board ID')}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Columns</CardTitle>
          <CardDescription>
            List of all columns, their parent boards, and their IDs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Column Name</TableHead>
                <TableHead>Board</TableHead>
                <TableHead>Column ID</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {columns.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                    No columns found.
                  </TableCell>
                </TableRow>
              ) : (
                columns.map((column) => {
                  const board = boards.find((b) => b.id === column.board_id)
                  return (
                    <TableRow key={column.id}>
                      <TableCell className="font-medium">{column.name}</TableCell>
                      <TableCell>{board?.name || 'Unknown Board'}</TableCell>
                      <TableCell>
                        <code className="bg-muted px-1.5 py-0.5 rounded text-xs">{column.id}</code>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(column.id, 'Column ID')}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

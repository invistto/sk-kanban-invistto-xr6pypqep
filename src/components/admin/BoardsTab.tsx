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

  if (boards.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          No boards found.
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {boards.map((board) => (
        <Card key={board.id}>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{board.name}</CardTitle>
                <CardDescription className="mt-1">
                  Board ID:{' '}
                  <code className="bg-muted px-1.5 py-0.5 rounded text-foreground">{board.id}</code>
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(board.id, 'Board ID')}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy ID
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Column Name</TableHead>
                  <TableHead>Column ID</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {columns
                  .filter((c) => c.board_id === board.id)
                  .map((column) => (
                    <TableRow key={column.id}>
                      <TableCell className="font-medium">{column.name}</TableCell>
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
                  ))}
                {columns.filter((c) => c.board_id === board.id).length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground py-6">
                      No columns found for this board
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

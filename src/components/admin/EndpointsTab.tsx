import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Copy } from 'lucide-react'
import { toast } from 'sonner'

interface EndpointsTabProps {
  boards: any[]
  columns: any[]
  users: any[]
}

export function EndpointsTab({ boards, columns, users }: EndpointsTabProps) {
  const copyToClipboard = (text: string, description: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${description} copied to clipboard`)
  }

  const examplePayload = {
    board_id: boards[0]?.id || 'BOARD_ID_HERE',
    column_id: columns[0]?.id || 'COLUMN_ID_HERE',
    title: 'Task Title',
    description: 'Task Description',
    priority: 'media',
    responsible_id: users[0]?.id || 'USER_ID_HERE',
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create Task</CardTitle>
          <CardDescription>POST /api/collections/tasks/records</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-medium mb-2 text-sm">Headers</h4>
            <div className="relative group">
              <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto">
                <code>{`Content-Type: application/json\nAuthorization: Bearer YOUR_ADMIN_TOKEN`}</code>
              </pre>
              <Button
                size="icon"
                variant="secondary"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() =>
                  copyToClipboard(
                    'Content-Type: application/json\nAuthorization: Bearer YOUR_ADMIN_TOKEN',
                    'Headers',
                  )
                }
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-2 text-sm">Request Body Schema</h4>
            <div className="relative group">
              <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto">
                <code>
                  {JSON.stringify(
                    {
                      board_id: 'string (required)',
                      column_id: 'string (required)',
                      title: 'string (required)',
                      description: 'string',
                      priority: 'string (baixa|media|alta|urgente)',
                      responsible_id: 'string',
                    },
                    null,
                    2,
                  )}
                </code>
              </pre>
              <Button
                size="icon"
                variant="secondary"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() =>
                  copyToClipboard(
                    JSON.stringify(
                      {
                        board_id: 'string (required)',
                        column_id: 'string (required)',
                        title: 'string (required)',
                        description: 'string',
                        priority: 'string (baixa|media|alta|urgente)',
                        responsible_id: 'string',
                      },
                      null,
                      2,
                    ),
                    'Schema',
                  )
                }
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-2 text-sm">Example Payload</h4>
            <div className="relative group">
              <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto">
                <code>{JSON.stringify(examplePayload, null, 2)}</code>
              </pre>
              <Button
                size="icon"
                variant="secondary"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() =>
                  copyToClipboard(JSON.stringify(examplePayload, null, 2), 'Example Payload')
                }
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>List Boards</CardTitle>
          <CardDescription>GET /api/collections/boards/records</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative group">
            <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto">
              <code>{`GET /api/collections/boards/records\nAuthorization: Bearer YOUR_ADMIN_TOKEN`}</code>
            </pre>
            <Button
              size="icon"
              variant="secondary"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() =>
                copyToClipboard('GET /api/collections/boards/records', 'List Boards Endpoint')
              }
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>List Columns</CardTitle>
          <CardDescription>GET /api/collections/columns/records</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative group">
            <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto">
              <code>{`GET /api/collections/columns/records?filter=(board_id='YOUR_BOARD_ID')\nAuthorization: Bearer YOUR_ADMIN_TOKEN`}</code>
            </pre>
            <Button
              size="icon"
              variant="secondary"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() =>
                copyToClipboard(
                  "GET /api/collections/columns/records?filter=(board_id='YOUR_BOARD_ID')",
                  'List Columns Endpoint',
                )
              }
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

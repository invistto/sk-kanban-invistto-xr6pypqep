import React, { createContext, useContext, useState, useEffect } from 'react'
import pb from '@/lib/pocketbase/client'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'

export interface User {
  id: string
  name: string
  avatar: string
  email: string
}
export interface Board {
  id: string
  name: string
  owner_id: string
}
export interface Column {
  id: string
  board_id: string
  name: string
  order: number
}
export interface Checklist {
  id: string
  task_id: string
  title: string
  completed: boolean
}
export interface Comment {
  id: string
  task_id: string
  user_id: string
  content: string
  created: string
}
export interface TaskRecord {
  id: string
  column_id: string
  board_id: string
  title: string
  description: string
  responsible_id: string
  priority: 'baixa' | 'media' | 'alta' | 'urgente'
  due_date: string
  tags: string[]
  order: number
  created: string
}

export interface Task extends Omit<TaskRecord, 'due_date' | 'column_id' | 'board_id'> {
  columnId: string
  boardId: string
  deadline: string
  assigneeId: string
  subtasks: Checklist[]
  comments: Comment[]
}

interface ProjectContextType {
  tasks: Task[]
  columns: Column[]
  members: User[]
  selectedTaskId: string | null
  setSelectedTaskId: (id: string | null) => void
  moveTask: (taskId: string, targetColumnId: string) => void
  updateTask: (taskId: string, updates: Partial<Task>) => void
  addTask: (columnId: string, title: string) => void
  updateSubtask: (subtaskId: string, completed: boolean) => void
  addComment: (taskId: string, content: string) => void
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined)

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [board, setBoard] = useState<Board | null>(null)
  const [columns, setColumns] = useState<Column[]>([])
  const [tasksRaw, setTasksRaw] = useState<TaskRecord[]>([])
  const [checklists, setChecklists] = useState<Checklist[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [members, setMembers] = useState<User[]>([])
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)

  const loadData = async () => {
    if (!user) return
    try {
      const boards = await pb.collection('boards').getFullList<Board>()
      const currentBoard = boards[0]
      if (!currentBoard) return
      setBoard(currentBoard)

      const [cols, tsks, chks, cmmts, users] = await Promise.all([
        pb
          .collection('columns')
          .getFullList<Column>({ filter: `board_id="${currentBoard.id}"`, sort: 'order' }),
        pb
          .collection('tasks')
          .getFullList<TaskRecord>({ filter: `board_id="${currentBoard.id}"`, sort: 'order' }),
        pb.collection('checklists').getFullList<Checklist>(),
        pb.collection('comments').getFullList<Comment>({ sort: 'created' }),
        pb.collection('users').getFullList<User>(),
      ])

      setColumns(cols)
      setTasksRaw(tsks)
      setChecklists(chks)
      setComments(cmmts)
      setMembers(users)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadData()
  }, [user])

  useRealtime('columns', loadData, !!user)
  useRealtime('tasks', loadData, !!user)
  useRealtime('checklists', loadData, !!user)
  useRealtime('comments', loadData, !!user)

  const tasks: Task[] = tasksRaw.map((t) => ({
    ...t,
    columnId: t.column_id,
    boardId: t.board_id,
    deadline: t.due_date,
    assigneeId: t.responsible_id,
    subtasks: checklists.filter((c) => c.task_id === t.id),
    comments: comments.filter((c) => c.task_id === t.id),
  }))

  const moveTask = async (taskId: string, targetColumnId: string) => {
    await pb.collection('tasks').update(taskId, { column_id: targetColumnId })
  }

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    const payload: any = { ...updates }
    if (updates.deadline) payload.due_date = updates.deadline
    if (updates.assigneeId !== undefined) payload.responsible_id = updates.assigneeId
    if (updates.columnId) payload.column_id = updates.columnId

    delete payload.subtasks
    delete payload.comments
    delete payload.columnId
    delete payload.boardId
    delete payload.assigneeId
    delete payload.deadline

    await pb.collection('tasks').update(taskId, payload)
  }

  const updateSubtask = async (subtaskId: string, completed: boolean) => {
    await pb.collection('checklists').update(subtaskId, { completed })
  }

  const addTask = async (columnId: string, title: string) => {
    if (!board) return
    await pb.collection('tasks').create({
      board_id: board.id,
      column_id: columnId,
      title,
      priority: 'baixa',
      due_date: new Date(Date.now() + 7 * 86400000).toISOString(),
      order: tasksRaw.filter((t) => t.column_id === columnId).length,
      tags: [],
    })
  }

  const addComment = async (taskId: string, content: string) => {
    if (!user) return
    await pb.collection('comments').create({
      task_id: taskId,
      user_id: user.id,
      content,
    })
  }

  return (
    <ProjectContext.Provider
      value={{
        tasks,
        columns,
        members,
        selectedTaskId,
        setSelectedTaskId,
        moveTask,
        updateTask,
        addTask,
        updateSubtask,
        addComment,
      }}
    >
      {children}
    </ProjectContext.Provider>
  )
}

export function useProject() {
  const context = useContext(ProjectContext)
  if (!context) throw new Error('useProject must be used within ProjectProvider')
  return context
}

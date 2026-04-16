import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
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
  members?: string[]
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
  boards: Board[]
  activeBoardId: string | null
  setActiveBoardId: (id: string) => void
  createBoard: (name: string) => Promise<Board>
  updateBoard: (id: string, data: Partial<Board>) => Promise<void>

  tasks: Task[]
  columns: Column[]
  members: User[]
  selectedTaskId: string | null
  setSelectedTaskId: (id: string | null) => void
  moveTask: (taskId: string, targetColumnId: string) => Promise<void>
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>
  addTask: (columnId: string, title: string) => Promise<void>
  updateSubtask: (subtaskId: string, completed: boolean) => Promise<void>
  addComment: (taskId: string, content: string) => Promise<void>

  addColumn: (name: string) => Promise<void>
  updateColumn: (id: string, name: string) => Promise<void>
  deleteColumn: (id: string) => Promise<void>
  reorderColumns: (reorderedCols: Column[]) => Promise<void>
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined)

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [boards, setBoards] = useState<Board[]>([])
  const [activeBoardId, setActiveBoardIdState] = useState<string | null>(() => {
    return localStorage.getItem('kanban_active_board') || null
  })

  const setActiveBoardId = (id: string) => {
    setActiveBoardIdState(id)
    localStorage.setItem('kanban_active_board', id)
  }

  const [columns, setColumns] = useState<Column[]>([])
  const [tasksRaw, setTasksRaw] = useState<TaskRecord[]>([])
  const [checklists, setChecklists] = useState<Checklist[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [members, setMembers] = useState<User[]>([])
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)

  const loadBoards = async () => {
    if (!user) return
    try {
      const fetchedBoards = await pb.collection('boards').getFullList<Board>({ sort: 'created' })
      setBoards(fetchedBoards)
      if (fetchedBoards.length > 0) {
        const savedId = localStorage.getItem('kanban_active_board')
        if (savedId && fetchedBoards.some((b) => b.id === savedId)) {
          if (!activeBoardId) setActiveBoardIdState(savedId)
        } else if (!activeBoardId) {
          setActiveBoardId(fetchedBoards[0].id)
        }
      }
    } catch (e) {
      console.error(e)
    }
  }

  const loadBoardData = useCallback(async (boardId: string) => {
    if (!boardId) return
    try {
      const [cols, tsks, chks, cmmts, users] = await Promise.all([
        pb
          .collection('columns')
          .getFullList<Column>({ filter: `board_id="${boardId}"`, sort: 'order' }),
        pb
          .collection('tasks')
          .getFullList<TaskRecord>({ filter: `board_id="${boardId}"`, sort: 'order' }),
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
      console.error('Failed to load board data:', e)
    }
  }, [])

  useEffect(() => {
    loadBoards()
  }, [user])

  useEffect(() => {
    if (activeBoardId) {
      setColumns([])
      setTasksRaw([])
      setChecklists([])
      setComments([])
      loadBoardData(activeBoardId)
    } else {
      setColumns([])
      setTasksRaw([])
      setChecklists([])
      setComments([])
    }
  }, [activeBoardId, loadBoardData])

  const handleRealtimeUpdate = useCallback(() => {
    if (activeBoardId) loadBoardData(activeBoardId)
  }, [activeBoardId, loadBoardData])

  useRealtime('boards', loadBoards, !!user)
  useRealtime('columns', handleRealtimeUpdate, !!activeBoardId)
  useRealtime('tasks', handleRealtimeUpdate, !!activeBoardId)
  useRealtime('checklists', handleRealtimeUpdate, !!activeBoardId)
  useRealtime('comments', handleRealtimeUpdate, !!activeBoardId)
  useRealtime(
    'users',
    () => {
      if (activeBoardId) loadBoardData(activeBoardId)
    },
    !!activeBoardId,
  )

  const tasks: Task[] = tasksRaw.map((t) => ({
    ...t,
    columnId: t.column_id,
    boardId: t.board_id,
    deadline: t.due_date,
    assigneeId: t.responsible_id,
    subtasks: checklists.filter((c) => c.task_id === t.id),
    comments: comments.filter((c) => c.task_id === t.id),
  }))

  const createBoard = async (name: string) => {
    if (!user) throw new Error('Unauthenticated')
    const newBoard = await pb.collection('boards').create<Board>({
      name,
      owner_id: user.id,
      members: [user.id], // Auto-add creator as member
    })

    try {
      const defaultCols = ['A Fazer', 'Em Progresso', 'Concluído']
      await Promise.all(
        defaultCols.map((colName, i) =>
          pb.collection('columns').create({
            board_id: newBoard.id,
            name: colName,
            order: i,
          }),
        ),
      )
    } catch (e) {
      console.error('Failed creating default cols, skipping error toast as board exists', e)
    }

    setActiveBoardId(newBoard.id)
    return newBoard
  }

  const updateBoard = async (id: string, data: Partial<Board>) => {
    await pb.collection('boards').update(id, data)
    await loadBoards()
  }

  const addColumn = async (name: string) => {
    if (!activeBoardId) throw new Error('Nenhum quadro ativo selecionado.')
    await pb.collection('columns').create({
      board_id: activeBoardId,
      name,
      order: columns.length,
    })
  }

  const updateColumn = async (id: string, name: string) => {
    await pb.collection('columns').update(id, { name })
  }

  const deleteColumn = async (id: string) => {
    await pb.collection('columns').delete(id)
  }

  const reorderColumns = async (reorderedCols: Column[]) => {
    setColumns(reorderedCols)
    try {
      await Promise.all(
        reorderedCols.map((col) =>
          pb.collection('columns').update(col.id, {
            order: col.order,
            name: col.name,
            board_id: col.board_id,
          }),
        ),
      )
    } catch (e) {
      if (activeBoardId) loadBoardData(activeBoardId)
      throw e
    }
  }

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

  const addTask = async (columnId: string, title: string) => {
    if (!activeBoardId) return
    await pb.collection('tasks').create({
      board_id: activeBoardId,
      column_id: columnId,
      title,
      priority: 'baixa',
      due_date: new Date(Date.now() + 7 * 86400000).toISOString(),
      order: tasksRaw.filter((t) => t.column_id === columnId).length,
      tags: [],
    })
  }

  const updateSubtask = async (subtaskId: string, completed: boolean) => {
    await pb.collection('checklists').update(subtaskId, { completed })
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
        boards,
        activeBoardId,
        setActiveBoardId,
        createBoard,
        updateBoard,
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
        addColumn,
        updateColumn,
        deleteColumn,
        reorderColumns,
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

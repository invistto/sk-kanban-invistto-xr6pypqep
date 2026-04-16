import React, { createContext, useContext, useState } from 'react'
import { Task, Column, Member, MOCK_TASKS, MOCK_COLUMNS, MOCK_MEMBERS } from '@/lib/mock-data'

interface ProjectContextType {
  tasks: Task[]
  columns: Column[]
  members: Member[]
  selectedTaskId: string | null
  setSelectedTaskId: (id: string | null) => void
  moveTask: (taskId: string, targetColumnId: string) => void
  updateTask: (taskId: string, updates: Partial<Task>) => void
  addTask: (columnId: string, title: string) => void
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined)

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS)
  const [columns] = useState<Column[]>(MOCK_COLUMNS)
  const [members] = useState<Member[]>(MOCK_MEMBERS)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)

  const moveTask = (taskId: string, targetColumnId: string) => {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, columnId: targetColumnId } : t)))
  }

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, ...updates } : t)))
  }

  const addTask = (columnId: string, title: string) => {
    const newTask: Task = {
      id: `t-${Date.now()}`,
      title,
      description: '',
      columnId,
      priority: 'baixa',
      deadline: new Date(Date.now() + 7 * 86400000).toISOString(),
      createdAt: new Date().toISOString(),
      tags: [],
      subtasks: [],
      comments: [],
    }
    setTasks((prev) => [...prev, newTask])
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

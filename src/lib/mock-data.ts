export type Priority = 'baixa' | 'media' | 'alta' | 'urgente'

export interface Subtask {
  id: string
  title: string
  completed: boolean
}
export interface Comment {
  id: string
  authorId: string
  text: string
  createdAt: string
}

export interface Task {
  id: string
  title: string
  description: string
  columnId: string
  assigneeId?: string
  priority: Priority
  deadline: string
  createdAt: string
  tags: string[]
  subtasks: Subtask[]
  comments: Comment[]
}

export interface Column {
  id: string
  title: string
  order: number
}
export interface Member {
  id: string
  name: string
  avatar: string
  role: 'admin' | 'member'
}

const today = new Date()
const addDays = (days: number) => new Date(today.getTime() + days * 86400000).toISOString()
const subDays = (days: number) => new Date(today.getTime() - days * 86400000).toISOString()

export const MOCK_MEMBERS: Member[] = [
  {
    id: 'u1',
    name: 'Ana Silva',
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=female&seed=1',
    role: 'admin',
  },
  {
    id: 'u2',
    name: 'Carlos Costa',
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=2',
    role: 'member',
  },
  {
    id: 'u3',
    name: 'Mariana Santos',
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=female&seed=3',
    role: 'member',
  },
  {
    id: 'u4',
    name: 'João Pedro',
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=4',
    role: 'member',
  },
]

export const MOCK_COLUMNS: Column[] = [
  { id: 'col1', title: 'A Fazer', order: 0 },
  { id: 'col2', title: 'Em Progresso', order: 1 },
  { id: 'col3', title: 'Em Revisão', order: 2 },
  { id: 'col4', title: 'Concluído', order: 3 },
]

export const MOCK_TASKS: Task[] = [
  {
    id: 't1',
    title: 'Pesquisa de Mercado',
    description: 'Analisar concorrentes diretos no setor de SaaS.',
    columnId: 'col4',
    assigneeId: 'u1',
    priority: 'media',
    deadline: subDays(2),
    createdAt: subDays(10),
    tags: ['Pesquisa', 'Marketing'],
    subtasks: [{ id: 's1', title: 'Levantar 5 concorrentes', completed: true }],
    comments: [],
  },
  {
    id: 't2',
    title: 'Design do Dashboard',
    description: 'Criar wireframes e UI final para o novo dashboard.',
    columnId: 'col2',
    assigneeId: 'u3',
    priority: 'alta',
    deadline: addDays(2),
    createdAt: subDays(5),
    tags: ['Design', 'UI/UX'],
    subtasks: [
      { id: 's2', title: 'Wireframes', completed: true },
      { id: 's3', title: 'UI Final', completed: false },
    ],
    comments: [],
  },
  {
    id: 't3',
    title: 'Implementar Autenticação',
    description: 'Integrar login social e JWT.',
    columnId: 'col2',
    assigneeId: 'u2',
    priority: 'urgente',
    deadline: subDays(1),
    createdAt: subDays(3),
    tags: ['Backend', 'Segurança'],
    subtasks: [],
    comments: [
      {
        id: 'c1',
        authorId: 'u2',
        text: 'Tive um problema com o OAuth, terminando amanhã.',
        createdAt: subDays(1),
      },
    ],
  },
  {
    id: 't4',
    title: 'Revisão de Textos (App)',
    description: 'Revisar todo o copywriting do aplicativo para Pt-BR.',
    columnId: 'col1',
    assigneeId: 'u4',
    priority: 'baixa',
    deadline: addDays(10),
    createdAt: today.toISOString(),
    tags: ['Conteúdo'],
    subtasks: [],
    comments: [],
  },
  {
    id: 't5',
    title: 'Otimização de Banco de Dados',
    description: 'Adicionar índices nas tabelas principais para melhorar a performance.',
    columnId: 'col3',
    assigneeId: 'u2',
    priority: 'alta',
    deadline: addDays(1),
    createdAt: subDays(4),
    tags: ['Infra', 'Backend'],
    subtasks: [
      { id: 's4', title: 'Tabela Users', completed: true },
      { id: 's5', title: 'Tabela Tasks', completed: true },
    ],
    comments: [],
  },
  {
    id: 't6',
    title: 'Campanha de Lançamento',
    description: 'Preparar materiais para as redes sociais.',
    columnId: 'col1',
    assigneeId: 'u1',
    priority: 'media',
    deadline: addDays(5),
    createdAt: subDays(1),
    tags: ['Marketing'],
    subtasks: [],
    comments: [],
  },
]

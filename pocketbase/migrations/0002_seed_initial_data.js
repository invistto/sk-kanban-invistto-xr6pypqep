migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')

    let user
    try {
      user = app.findAuthRecordByEmail('_pb_users_auth_', 'marcelo.sturm@gmail.com')
    } catch (_) {
      user = new Record(users)
      user.setEmail('marcelo.sturm@gmail.com')
      user.setPassword('Skip@Pass')
      user.setVerified(true)
      user.set('name', 'Marcelo Sturm')
      app.save(user)
    }

    const boards = app.findCollectionByNameOrId('boards')
    let board
    try {
      board = app.findFirstRecordByData('boards', 'name', 'Projeto Principal')
    } catch (_) {
      board = new Record(boards)
      board.set('name', 'Projeto Principal')
      board.set('owner_id', user.id)
      app.save(board)

      const cols = app.findCollectionByNameOrId('columns')
      const c1 = new Record(cols)
      c1.set('board_id', board.id)
      c1.set('name', 'A Fazer')
      c1.set('order', 1)
      app.save(c1)
      const c2 = new Record(cols)
      c2.set('board_id', board.id)
      c2.set('name', 'Em Progresso')
      c2.set('order', 2)
      app.save(c2)
      const c3 = new Record(cols)
      c3.set('board_id', board.id)
      c3.set('name', 'Revisão')
      c3.set('order', 3)
      app.save(c3)
      const c4 = new Record(cols)
      c4.set('board_id', board.id)
      c4.set('name', 'Concluído')
      c4.set('order', 4)
      app.save(c4)

      const tasks = app.findCollectionByNameOrId('tasks')
      const t1 = new Record(tasks)
      t1.set('board_id', board.id)
      t1.set('column_id', c1.id)
      t1.set('title', 'Configurar Ambiente Skip')
      t1.set(
        'description',
        'Configurar o ambiente de desenvolvimento usando Skip Cloud e Pocketbase.',
      )
      t1.set('responsible_id', user.id)
      t1.set('priority', 'alta')
      t1.set('due_date', new Date(Date.now() + 86400000).toISOString())
      t1.set('tags', JSON.stringify(['dev', 'setup']))
      t1.set('order', 1)
      app.save(t1)

      const checklists = app.findCollectionByNameOrId('checklists')
      const ch1 = new Record(checklists)
      ch1.set('task_id', t1.id)
      ch1.set('title', 'Instalar Node')
      ch1.set('completed', true)
      app.save(ch1)
      const ch2 = new Record(checklists)
      ch2.set('task_id', t1.id)
      ch2.set('title', 'Testar conexão')
      ch2.set('completed', false)
      app.save(ch2)
    }
  },
  (app) => {},
)

onRecordAfterCreateSuccess((e) => {
  const content = e.record.getString('content')
  if (!content.includes('@')) return e.next()

  const words = content.split(' ')
  const mentions = words.filter((w) => w.startsWith('@')).map((w) => w.slice(1).toLowerCase())

  if (mentions.length === 0) return e.next()

  const users = $app.findRecordsByFilter('_pb_users_auth_', '1=1', '', 1000, 0)
  const mentionedUsers = users.filter((u) =>
    mentions.some((m) => u.getString('name').toLowerCase().includes(m)),
  )

  const notifications = $app.findCollectionByNameOrId('notifications')
  for (const u of mentionedUsers) {
    if (u.id === e.record.getString('user_id')) continue

    const notif = new Record(notifications)
    notif.set('user_id', u.id)
    notif.set('message', 'Você foi mencionado em um comentário.')
    notif.set('read', false)
    notif.set('task_id', e.record.getString('task_id'))
    $app.save(notif)
  }

  return e.next()
}, 'comments')

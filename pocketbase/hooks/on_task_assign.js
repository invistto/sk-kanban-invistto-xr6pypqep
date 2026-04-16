onRecordAfterUpdateSuccess((e) => {
  const oldResponsible = e.record.original().getString('responsible_id')
  const newResponsible = e.record.getString('responsible_id')

  if (newResponsible && oldResponsible !== newResponsible) {
    const notifications = $app.findCollectionByNameOrId('notifications')
    const notif = new Record(notifications)
    notif.set('user_id', newResponsible)
    notif.set('message', `Você foi atribuído à tarefa: ${e.record.getString('title')}`)
    notif.set('read', false)
    notif.set('task_id', e.record.id)
    $app.save(notif)
  }
  return e.next()
}, 'tasks')

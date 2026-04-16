migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('tasks')

    if (!col.fields.getByName('files')) {
      col.fields.add(
        new FileField({
          name: 'files',
          maxSelect: 10,
          maxSize: 5242880,
          mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
        }),
      )
    }

    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('tasks')
    col.fields.removeByName('files')
    app.save(col)
  },
)

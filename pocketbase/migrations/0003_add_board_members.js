migrate(
  (app) => {
    const boards = app.findCollectionByNameOrId('boards')

    // Add relation field for board members
    boards.fields.add(
      new RelationField({
        name: 'members',
        collectionId: '_pb_users_auth_',
        cascadeDelete: false,
        maxSelect: 999999, // Allows multiple members
      }),
    )

    app.save(boards)
  },
  (app) => {
    const boards = app.findCollectionByNameOrId('boards')
    boards.fields.removeByName('members')
    app.save(boards)
  },
)

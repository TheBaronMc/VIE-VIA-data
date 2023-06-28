const { client } = require('../sources/db')

const { DATABASE_NAME } = require('../sources/keys')

const main = async () => {
    await client.connect()

    const database = client.db(DATABASE_NAME)

    process.stdout.write('\x1b[91m=========================== DELETE DATA ===========================\x1b[0m\n')

    process.stdout.write(`Dropping ${DATABASE_NAME}: `)
    await database.dropDatabase()
    process.stdout.write('\x1b[92mOK\x1b[0m\n')

    await client.close()
}

main()

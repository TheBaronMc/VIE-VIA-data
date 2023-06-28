const { loadDataset } = require('../sources/dataset')
const { loadLocations } = require('../sources/locations')
const { loadEnterprises } = require('../sources/enterprise')
const { loadOffers } = require('../sources/offers')
const { client } = require('../sources/db')

const { DATABASE_NAME } = require('../sources/keys')

async function main() {
    
    try {
        const database = client.db(DATABASE_NAME)

        process.stdout.write('\x1b[91m========================== LOADING DATA ===========================\x1b[0m\n')
    
        await loadDataset(database)
        await loadLocations(database)
        await loadEnterprises(database)
        await loadOffers(database)
    } finally {
        await client.close()
    }
}

main().catch(process.stderr)

const { loadDataset } = require('../sources/dataset')
const { loadLocations } = require('../sources/locations')
const { loadEnterprises } = require('../sources/enterprise')
const { loadOffers } = require('../sources/offers')
const { client } = require('../sources/db')
const { Output } = require('../sources/output')

const keys = require('../sources/keys')

async function main() {
    let output = new Output()
    let section;
    
    section = output.add(keys.DATASET_SECTION)
    section.add(keys.STUDY_LEVEL_PROGRESS_BAR)
    section.add(keys.MISSION_TYPES_PROGRESS_BAR)
    section.add(keys.ENTREPRISE_TYPES_PROGRESS_BAR)
    section.add(keys.ACTIVITY_SECTORS_PROGRESS_BAR)
    section.add(keys.SPECIALIZATIONS_PROGRESS_BAR)
    section = output.add(keys.LOCATIONS_SECTION)
    section.add(keys.GEOGRAPHIC_ZONES_PROGRESS_BAR)
    section.add(keys.COUNTRIES_PROGRESS_BAR)
    section.add(keys.CITIES_PROGRESS_BAR)
    section = output.add(keys.ENTERPRISES_SECTION)
    section.add(keys.ENTERPRISES_PROGRESS_BAR)
    section = output.add(keys.OFFERS_SECTION)
    section.add(keys.OFFERS_PROGRESS_BAR)
    
    const database = client.db(keys.DATABASE_NAME)

    process.stdout.write('\x1b[91m========================== LOADING DATA ===========================\x1b[0m\n')

    output.print()

    return await Promise.all(
        [loadDataset, loadLocations, loadEnterprises, loadOffers]
        .map(promise => promise(database, output))
    ).catch(console.err)
}

main()
.catch(console.err)
.finally(async () => {
    await client.close()
})

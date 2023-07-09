const { updateDataset } = require('../sources/dataset')
const { updateLocations } = require('../sources/locations')
const { updateEnterprises } = require('../sources/enterprise')
const { updateOffers } = require('../sources/offers')
const { client } = require('../sources/db')
const { Output } = require('../sources/output')

const keys = require('../sources/keys')

async function main() {
    let output = new Output()
    let section;
    
    section = output.add(keys.DATASET_UPDATE_SECTION)
    section.add(keys.STUDY_LEVEL_UPDATE_PROGRESS_BAR)
    section.add(keys.MISSION_TYPES_UPDATE_PROGRESS_BAR)
    section.add(keys.ENTREPRISE_TYPES_UPDATE_PROGRESS_BAR)
    section.add(keys.ACTIVITY_SECTORS_UPDATE_PROGRESS_BAR)
    section.add(keys.SPECIALIZATIONS_UPDATE_PROGRESS_BAR)
    section = output.add(keys.LOCATIONS_UPDATE_SECTION)
    section.add(keys.GEOGRAPHIC_ZONES_UPDATE_PROGRESS_BAR)
    section.add(keys.COUNTRIES_UPDATE_PROGRESS_BAR)
    section.add(keys.CITIES_UPDATE_PROGRESS_BAR)
    section = output.add(keys.ENTERPRISES_UPDATE_SECTION)
    section.add(keys.ENTERPRISES_UPDATE_PROGRESS_BAR)
    section = output.add(keys.OFFERS_UPDATE_SECTION)
    section.add(keys.OFFERS_UPDATE_PROGRESS_BAR)
    
    const database = client.db(keys.DATABASE_NAME)

    process.stdout.write('\x1b[91m========================== UPDATE DATA ===========================\x1b[0m\n')

    output.print()

    return await Promise.all(
        [updateDataset, updateLocations, updateEnterprises, updateOffers]
        .map(promise => promise(database, output))
    ).catch(console.err)
}

main()
.catch(console.err)
.finally(async () => {
    await client.close()
})

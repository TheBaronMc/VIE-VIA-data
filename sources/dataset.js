const axios = require('axios')
const keys = require('./keys')

const DATASET_STUDY_LEVELS = "studyLevels"
const DATASET_MISSION_TYPES = "missionTypes"
const DATASET_ENTREPRISE_TYPES = "entrepriseTypes"
const DATASET_ACTIVITY_SECTORS = "activitySectors"
const DATASET_SPECIALIZATIONS = "specializations"

async function fetchDataset() {
    const config = {
        method: 'get',
        url: 'https://civiweb-api-prd.azurewebsites.net/api/Offers/repository/search/dataset',
        headers: {}
    };
      
    let response = await axios(config)
    return response.data
}

async function loadDataset(database) {
    process.stdout.write("\x1b[94m# Loading dataset\x1b[0m\n")
    
    // Récupération des données
    process.stdout.write(`Fetching dataset: `)
    const data = await fetchDataset();
    process.stdout.write('\x1b[92mOK\x1b[0m\n')
    
    // Enregistrement des niveaux d'études
    process.stdout.write(`Inserting study levels: `)
    const study_level_collection = await database.createCollection(keys.DATABASE_STUDY_LEVEL_COLLECTION)
    await study_level_collection.insertMany(data[DATASET_STUDY_LEVELS])
    process.stdout.write('\x1b[92mOK\x1b[0m\n')

    // Enregistrement des types de missions
    process.stdout.write(`Inserting mission types: `)
    const mission_types_collection = await database.createCollection(keys.DATABASE_MISSION_TYPES_COLLECTION)
    await mission_types_collection.insertMany(data[DATASET_MISSION_TYPES])
    process.stdout.write('\x1b[92mOK\x1b[0m\n')

    // Enregistrement des types d'entreprises
    process.stdout.write(`Inserting enterprise types: `)
    const enterprise_types_collection = await database.createCollection(keys.DATABASE_ENTREPRISE_TYPES_COLLECTION)
    await enterprise_types_collection.insertMany(data[DATASET_ENTREPRISE_TYPES])
    process.stdout.write('\x1b[92mOK\x1b[0m\n')

    // Enregistrement des secteurs d'activités
    process.stdout.write(`Inserting activity sectors: `)
    const activity_sectors_collection = await database.createCollection(keys.DATABASE_ACTIVITY_SECTORS_COLLECTION)
    await activity_sectors_collection.insertMany(data[DATASET_ACTIVITY_SECTORS])
    process.stdout.write('\x1b[92mOK\x1b[0m\n')

    // Enregistrement des spécialisations
    process.stdout.write(`Inserting specilizations: `)
    const specializations_collection = await database.createCollection(keys.DATABASE_SPECIALIZATIONS_COLLECTION)
    await specializations_collection.insertMany(data[DATASET_SPECIALIZATIONS])
    process.stdout.write('\x1b[92mOK\x1b[0m\n')
}

module.exports = { loadDataset }
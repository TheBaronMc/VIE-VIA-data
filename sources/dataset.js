const keys = require('./keys')
const network = require('./network')

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
      
    let response = await network.request(config)
    return response.data
}

async function loadDataset(database, output) {
    // Récupération des données
    const data = await fetchDataset();
    
    // Enregistrement des niveaux d'études
    const study_level_collection = await database.createCollection(keys.DATABASE_STUDY_LEVEL_COLLECTION)
    await study_level_collection.insertMany(data[DATASET_STUDY_LEVELS])
    output.updateProgressBar(keys.STUDY_LEVEL_PROGRESS_BAR, 100)

    // Enregistrement des types de missions
    const mission_types_collection = await database.createCollection(keys.DATABASE_MISSION_TYPES_COLLECTION)
    await mission_types_collection.insertMany(data[DATASET_MISSION_TYPES])
    output.updateProgressBar(keys.MISSION_TYPES_PROGRESS_BAR, 100)

    // Enregistrement des types d'entreprises
    const enterprise_types_collection = await database.createCollection(keys.DATABASE_ENTREPRISE_TYPES_COLLECTION)
    await enterprise_types_collection.insertMany(data[DATASET_ENTREPRISE_TYPES])
    output.updateProgressBar(keys.ENTREPRISE_TYPES_PROGRESS_BAR, 100)

    // Enregistrement des secteurs d'activités
    const activity_sectors_collection = await database.createCollection(keys.DATABASE_ACTIVITY_SECTORS_COLLECTION)
    await activity_sectors_collection.insertMany(data[DATASET_ACTIVITY_SECTORS])
    output.updateProgressBar(keys.ACTIVITY_SECTORS_PROGRESS_BAR, 100)

    // Enregistrement des spécialisations
    const specializations_collection = await database.createCollection(keys.DATABASE_SPECIALIZATIONS_COLLECTION)
    await specializations_collection.insertMany(data[DATASET_SPECIALIZATIONS])
    output.updateProgressBar(keys.SPECIALIZATIONS_PROGRESS_BAR, 100)
}

async function updateDataset(database, output) {
    // Récupération des données
    const data = await fetchDataset();

    // Enregistrement de nouveaux niveaux d'études
    const study_level_collection = await database.collection(keys.DATABASE_STUDY_LEVEL_COLLECTION)
    for (let studyLevel of data[DATASET_STUDY_LEVELS]) {
    const cursor = await study_level_collection.findOne({ studyLevelId: studyLevel.studyLevelId })
        if (!cursor) {
            await specializations_collection.insertOne(studyLevel)
        }
        output.updateProgressBar(keys.STUDY_LEVEL_UPDATE_PROGRESS_BAR, data[DATASET_STUDY_LEVELS].indexOf(studyLevel)*100/data[DATASET_STUDY_LEVELS].length)
    }
    output.updateProgressBar(keys.STUDY_LEVEL_UPDATE_PROGRESS_BAR, 100)

    // Enregistrement des types de missions
    const mission_types_collection = await database.collection(keys.DATABASE_MISSION_TYPES_COLLECTION)
    for (let missionType of data[DATASET_MISSION_TYPES]) {
        const cursor = await mission_types_collection.findOne({ missionTypeId: missionType.missionTypeId })
        if (!cursor) {
            await mission_types_collection.insertOne(missionType)
        }
        output.updateProgressBar(keys.MISSION_TYPES_UPDATE_PROGRESS_BAR, data[DATASET_MISSION_TYPES].indexOf(missionType)*100/data[DATASET_MISSION_TYPES].length)
    }
    output.updateProgressBar(keys.MISSION_TYPES_UPDATE_PROGRESS_BAR, 100)

    // Enregistrement des types d'entreprises
    const enterprise_types_collection = await database.collection(keys.DATABASE_ENTREPRISE_TYPES_COLLECTION)
    for (let entrepriseType of data[DATASET_ENTREPRISE_TYPES]) {
        const cursor = await enterprise_types_collection.findOne({ entrepriseTypeId: entrepriseType.entrepriseTypeId })
        if (!cursor) {
            await enterprise_types_collection.insertOne(entrepriseType)
        }
        output.updateProgressBar(keys.ENTREPRISE_TYPES_UPDATE_PROGRESS_BAR, data[DATASET_ENTREPRISE_TYPES].indexOf(entrepriseType)*100/data[DATASET_ENTREPRISE_TYPES].length)
    }
    output.updateProgressBar(keys.ENTREPRISE_TYPES_UPDATE_PROGRESS_BAR, 100)

    // Enregistrement des secteurs d'activités
    const activity_sectors_collection = await database.collection(keys.DATABASE_ACTIVITY_SECTORS_COLLECTION)
    for (let activitySector of data[DATASET_ACTIVITY_SECTORS]) {
        const cursor = await activity_sectors_collection.findOne({ sectorId: activitySector.sectorId })
        if (!cursor) {
            await activity_sectors_collection.insertOne(activitySector)
        }
        output.updateProgressBar(keys.ACTIVITY_SECTORS_UPDATE_PROGRESS_BAR, data[DATASET_ACTIVITY_SECTORS].indexOf(activitySector)*100/data[DATASET_ACTIVITY_SECTORS].length)
    }
    output.updateProgressBar(keys.ACTIVITY_SECTORS_UPDATE_PROGRESS_BAR, 100)

    // Enregistrement des spécialisations
    const specializations_collection = await database.collection(keys.DATABASE_SPECIALIZATIONS_COLLECTION)
    for (let specialization of data[DATASET_SPECIALIZATIONS]) {
        const cursor = await specializations_collection.findOne({ specializationId: specialization.specializationId })
        if (!cursor) {
            await specializations_collection.insertOne(specialization)
        }
        output.updateProgressBar(keys.SPECIALIZATIONS_UPDATE_PROGRESS_BAR, data[DATASET_SPECIALIZATIONS].indexOf(specialization)*100/data[DATASET_SPECIALIZATIONS].length)
    }
    output.updateProgressBar(keys.SPECIALIZATIONS_UPDATE_PROGRESS_BAR, 100)
    
}

module.exports = { loadDataset, updateDataset }
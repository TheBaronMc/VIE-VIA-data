const axios = require('axios');
const { DATABASE_OFFERS_COLLECTION, DATABASE_SPECIALIZATIONS_COLLECTION } = require('./keys')

const SPECIALIZATIONS_FIELD = 'specializations'

async function fetchOffers(step, skip) {
    const data = JSON.stringify({
        "limit": step,
        "skip": skip,
        "sort": [
            "0"
        ],
        "activitySectorId": [],
        "missionsTypesIds": [],
        "missionsDurations": [],
        "gerographicZones": [],
        "countriesIds": [],
        "studiesLevelId": [],
        "companiesSizes": [],
        "specializationsIds": [],
        "entreprisesIds": [
            0
        ],
        "missionStartDate": null,
        "query": null
    });
      
    const config = {
        method: 'post',
        url: 'https://civiweb-api-prd.azurewebsites.net/api/Offers/search',
        headers: { 'Content-Type': 'application/json' },
        data : data
    };
      
    let response = await axios(config)
    return response.data
}

async function fetchOfferDetails(id) {      
    const config = {
        method: 'get',
        url: `https://civiweb-api-prd.azurewebsites.net/api/Offers/details/${id}`,
        headers: { 'Content-Type': 'application/json' },
        data : {}
    };
      
    let response = await axios(config)
    return response.data
}

async function loadOffers(database) {
    process.stdout.write("\x1b[94m# Loading offers\x1b[0m\n")

    const offers_collection = await database.createCollection(DATABASE_OFFERS_COLLECTION)
    const specializations_collection = database.collection(DATABASE_SPECIALIZATIONS_COLLECTION)

    let specializations = await specializations_collection.find({}).toArray()

    const step = 50
    let limit = step
    let count = step + 1 

    while (limit < count) {
        let data = await fetchOffers(step, limit-step)

        let offers = data['result']

        // Mise à jour du compteur
        count = data["count"]

        let i = 1
        for (let offer of offers) {
            let details = await fetchOfferDetails(offer.id)

            // Update offers fields
            for (let key of Object.keys(details)) {
                offer[key] = details[key]
            }

            // Fetch new spezializations
            if (offer[SPECIALIZATIONS_FIELD]) {
                for (let specialization of offer[SPECIALIZATIONS_FIELD]) {
                    if (!specializations.find(spe => spe.specializationId == specialization.specializationId)) {
                        specializations.push(specialization)
                    }
                }
            }

            i++;
            process.stdout.write(`\rProcessing offer: ${offer.id} (${limit-step+i}/${count})`)
        }


        await offers_collection.insertMany(offers)
        process.stdout.write(`\rInserting offers: ${limit}/${count}`)

        // Mise à jour de la limite
        limit += step
    }

    process.stdout.clearLine()
    process.stdout.write('\rInserting offers: \x1b[92mOK\x1b[0m\n')

    // Updating specializations
    for (let specialization of specializations) {
        if ((await specializations_collection.find({ "specializationId": specialization.specializationId }).toArray()).length == 0) {
            await specializations_collection.insertOne(specialization)
        }
    }
}

module.exports = {
    loadOffers
}
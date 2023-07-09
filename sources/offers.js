const keys = require('./keys')
const network = require('./network')

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
      
    let response = await network.request(config)
    return response.data
}

async function fetchOfferDetails(id) {      
    const config = {
        method: 'get',
        url: `https://civiweb-api-prd.azurewebsites.net/api/Offers/details/${id}`,
        headers: { 'Content-Type': 'application/json' },
        data : {}
    };
      
    let response = await network.request(config)
    return response.data
}

async function loadOffers(database, output) {
    const offers_collection = await database.createCollection(keys.DATABASE_OFFERS_COLLECTION)
    const specializations_collection = database.collection(keys.DATABASE_SPECIALIZATIONS_COLLECTION)

    let specializations = await specializations_collection.find({}).toArray()

    const step = 20
    let limit = step
    let count = step + 1

    let processedOfferCount = 0

    while (limit < count) {
        let data = await fetchOffers(step, limit-step)

        const offers = data['result']

        // Mise à jour du compteur
        count = data["count"]

        const fetchOfferDetailsP = offers.map(async offer => {
            try {
                const details = await fetchOfferDetails(offer.id)

                for (let key of Object.keys(details)) {
                    offer[key] = details[key]
                }

                processedOfferCount++
                output.updateProgressBar(keys.OFFERS_PROGRESS_BAR, processedOfferCount*100/count)

                if (offer[SPECIALIZATIONS_FIELD]) {
                    for (let specialization of offer[SPECIALIZATIONS_FIELD]) {
                        if (!specializations.find(spe => spe.specializationId == specialization.specializationId)) {
                            await specializations_collection.insertOne(specialization)
                            specializations.push(specialization)
                        }
                    }
                }

                return offer
            } catch {
                /*
                Il est possible de tomber sur une erreur ou l'offre n'existe plus 
                entre le moment de la recherche et la récupération des détails
                RES:
                    data: {
                        message: 'Object reference not set to an instance of an object.'
                    }
                */
                return undefined
            }
        })

        await offers_collection.insertMany(
            (await Promise.all(fetchOfferDetailsP)).filter(offer => offer != undefined)
        )

        // Mise à jour de la limite
        limit += step
    }

    output.updateProgressBar(keys.OFFERS_PROGRESS_BAR, 100)
}


async function updateOffers(database, output) {
    const offers_collection = await database.collection(keys.DATABASE_OFFERS_COLLECTION)
    const specializations_collection = database.collection(keys.DATABASE_SPECIALIZATIONS_COLLECTION)

    let specializations = await specializations_collection.find({}).toArray()

    const step = 50
    let limit = step
    let count = step + 1

    let processedOfferCount = 0

    while (limit < count) {
        const data = await fetchOffers(step, limit-step)
        const offers = data['result']

        // Mise à jour du compteur
        count = data["count"]

        const fetchOfferDetailsP = offers.map(async offer => {
            const details = await fetchOfferDetails(offer.id)

            for (let key of Object.keys(details)) {
                offer[key] = details[key]
            }

            const filter = { id: offer.id }
            await offers_collection.replaceOne(filter, offer)

            processedOfferCount++
            output.updateProgressBar(keys.OFFERS_UPDATE_PROGRESS_BAR, processedOfferCount*100/count)

            if (offer[SPECIALIZATIONS_FIELD]) {
                for (let specialization of offer[SPECIALIZATIONS_FIELD]) {
                    if (!specializations.find(spe => spe.specializationId == specialization.specializationId)) {
                        await specializations_collection.insertOne(specialization)
                        specializations.push(specialization)
                    }
                }
            }

            return offer
        })

        await Promise.all(fetchOfferDetailsP)

        // Mise à jour de la limite
        limit += step
    }

    output.updateProgressBar(keys.OFFERS_UPDATE_PROGRESS_BAR, 100)
}

module.exports = {
    loadOffers,
    updateOffers
}
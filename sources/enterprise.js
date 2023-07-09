const keys = require('./keys')
const network = require('./network')

async function fetchEnterprises(step, skip) {
    const data = JSON.stringify({
        "limit": step,
        "skip": skip,
        "sort": [
            "0"
        ]
    });
      
    const config = {
        method: 'post',
        url: 'https://civiweb-api-prd.azurewebsites.net/api/Companies/search',
        headers: { 'Content-Type': 'application/json' },
        data : data
    };
      
    let response = await network.request(config)
    return response.data
}

async function fetchEnterpriseDetails(id) {      
    const config = {
        method: 'get',
        url: `https://civiweb-api-prd.azurewebsites.net/api/Companies/details/${id}`,
        headers: { 'Content-Type': 'application/json' },
        data : {}
    };
      
    let response = await network.request(config)
    return response.data
}

async function loadEnterprises(database, output) {
    const collection = await database.createCollection(keys.DATABASE_ENTERPRISES_COLLECTION)

    const step = 20
    let limit = step
    let count = step + 1 

    let processedEnterpriseCount = 0

    while (limit < count) {
        let data = await fetchEnterprises(step, limit-step)

        let enterprises = data['result']

        // Mise à jour du compteur
        count = data["count"]

        const fetchEnterpriseDetailsP = enterprises.map(async enterprise => {
            let details = await fetchEnterpriseDetails(enterprise.id)

            // Update keys
            for (let key of Object.keys(details)) {
                enterprise[key] = details[key]
            }

            processedEnterpriseCount++
            output.updateProgressBar(keys.ENTERPRISES_PROGRESS_BAR, processedEnterpriseCount*100/count)

            return enterprise
        });

        await collection.insertMany(await Promise.all(fetchEnterpriseDetailsP))

        // Mise à jour de la limite
        limit += step
    }
    output.updateProgressBar(keys.ENTERPRISES_PROGRESS_BAR, 100)
}

async function updateEnterprises(database, output) {
    const collection = database.collection(keys.DATABASE_ENTERPRISES_COLLECTION)

    const step = 50
    let limit = step
    let count = step + 1

    let processedEnterpriseCount = 0

    while (limit < count) {
        const data = await fetchEnterprises(step, limit-step)
        let enterprises = data['result']

        // Mise à jour du compteur
        count = data["count"]
        
        const fetchEnterpriseDetailsP = enterprises.map(async enterprise => {
            const details = await fetchEnterpriseDetails(enterprise.id)
            
            for (let key of Object.keys(details)) {
                enterprise[key] = details[key]
            }

            const filter = { id: enterprise.id }
            await collection.replaceOne(filter, enterprise)

            processedEnterpriseCount++
            output.updateProgressBar(keys.ENTERPRISES_UPDATE_PROGRESS_BAR, processedEnterpriseCount*100/count)

            return enterprise
        })

        await Promise.all(fetchEnterpriseDetailsP)

        // Mise à jour de la limite
        limit += step
    }

    output.updateProgressBar(keys.ENTERPRISES_UPDATE_PROGRESS_BAR, 100)
}

module.exports = {
    loadEnterprises,
    updateEnterprises
}
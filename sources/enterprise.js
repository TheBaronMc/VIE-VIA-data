const axios = require('axios');
const { DATABASE_ENTERPRISES_COLLECTION } = require('./keys')

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
      
    let response = await axios(config)
    return response.data
}

async function fetchEnterpriseDetails(id) {      
    const config = {
        method: 'get',
        url: `https://civiweb-api-prd.azurewebsites.net/api/Companies/details/${id}`,
        headers: { 'Content-Type': 'application/json' },
        data : {}
    };
      
    let response = await axios(config)
    return response.data
}

async function loadEnterprises(database) {
    process.stdout.write("\x1b[94m# Loading enterprises\x1b[0m\n")

    const collection = await database.createCollection(DATABASE_ENTERPRISES_COLLECTION)

    const step = 20
    let limit = step
    let count = step + 1 

    while (limit < count) {
        let data = await fetchEnterprises(step, limit-step)

        let enterprises = data['result']

        // Mise à jour du compteur
        count = data["count"]

        let i = 1
        for (let enterprise of enterprises) {
            let details = await fetchEnterpriseDetails(enterprise.id)

            // Update keys
            for (let key of Object.keys(details)) {
                enterprise[key] = details[key]
            }

            i++;
            process.stdout.write(`\rProcessing enterprise: ${limit-step+i}/${count}`)
        }


        await collection.insertMany(enterprises)
        process.stdout.write(`\rInserting enterprise: ${limit}/${count}`)

        // Mise à jour de la limite
        limit += step
    }

    process.stdout.clearLine()
    process.stdout.write('\rInserting enterprise: \x1b[92mOK\x1b[0m\n')
}

module.exports = {
    loadEnterprises
}
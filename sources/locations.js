const axios = require('axios')
const keys = require('./keys')

const COUNTRY_ID_KEY = 'countryId'

async function fetchGeographicZones() {
    const config = {
        method: 'get',
        url: 'https://civiweb-api-prd.azurewebsites.net/api/Offers/repository/geographic-zones',
        headers: { 'Content-Type': 'application/json'  }
    };
      
    let response = await axios(config)
    return response.data
}

async function fetchCountries() {
    const data = JSON.stringify([]);
    const config = {
        method: 'post',
        url: 'https://civiweb-api-prd.azurewebsites.net/api/Offers/repository/geographic-zones/countries',
        headers: { 'Content-Type': 'application/json' },
        data
    };
      
    let response = await axios(config)
    return response.data
}

async function fetchCities(countryId) {
    const config = {
        method: 'get',
        url: `https://civiweb-api-prd.azurewebsites.net/api/Offers/repository/cities?countryId=${countryId}`,
        headers: { 'Content-Type': 'application/json'  }
    };
      
    let response = await axios(config)
    return response.data
}

async function loadLocations(database) {
    process.stdout.write("\x1b[94m# Loading locations\x1b[0m\n")

    const geographicZonesCollection = await database.createCollection(keys.DATABASE_GEOGRAPHIC_ZONES_COLLECTION)
    const countriesCollection = await database.createCollection(keys.DATABASE_COUNTRIES_COLLECTION)
    const citiesCollection = await database.createCollection(keys.DATABASE_CITIES_COLLECTION)

    // Load geographic zones
    process.stdout.write(`Inserting geographic zones: `)
    let dataGeographicZones = await fetchGeographicZones()
    let geographicZones = dataGeographicZones['result']
    await geographicZonesCollection.insertMany(geographicZones)
    process.stdout.write(`\x1b[92mOK\x1b[0m\n`)

    // Load countries
    process.stdout.write(`Inserting countries: `)
    let countries = await fetchCountries()
    await countriesCollection.insertMany(countries)
    process.stdout.write(`\x1b[92mOK\x1b[0m\n`)

    // Load cities
    process.stdout.write(`Inserting cities: ${0}/${countries.length}`)
    for (let i = 0; i < countries.length; i++) {
        let dataCities = await fetchCities(countries[i][COUNTRY_ID_KEY])
        let cities = dataCities['result'][0] ? dataCities['result'][0]['cities'] : undefined
        if (cities) {
            await citiesCollection.insertMany(cities)
        }
        process.stdout.write(`\rInserting cities: ${i+1}/${countries.length}`)
    }
    process.stdout.clearLine()
    process.stdout.write(`\rInserting cities: \x1b[92mOK\x1b[0m\n`)
}

module.exports = {
    loadLocations
}
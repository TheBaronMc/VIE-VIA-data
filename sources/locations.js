const keys = require('./keys')
const network = require('./network')

const COUNTRY_ID_KEY = 'countryId'

async function fetchGeographicZones() {
    const config = {
        method: 'get',
        url: 'https://civiweb-api-prd.azurewebsites.net/api/Offers/repository/geographic-zones',
        headers: { 'Content-Type': 'application/json'  }
    };
      
    let response = await network.request(config)
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
      
    let response = await network.request(config)
    return response.data
}

async function fetchCities(countryId) {
    const config = {
        method: 'get',
        url: `https://civiweb-api-prd.azurewebsites.net/api/Offers/repository/cities?countryId=${countryId}`,
        headers: { 'Content-Type': 'application/json'  }
    };
      
    let response = await network.request(config)
    return response.data
}

async function loadLocations(database, output) {
    const geographicZonesCollection = await database.createCollection(keys.DATABASE_GEOGRAPHIC_ZONES_COLLECTION)
    const countriesCollection = await database.createCollection(keys.DATABASE_COUNTRIES_COLLECTION)
    const citiesCollection = await database.createCollection(keys.DATABASE_CITIES_COLLECTION)

    // Load geographic zones
    let dataGeographicZones = await fetchGeographicZones()
    let geographicZones = dataGeographicZones['result']
    await geographicZonesCollection.insertMany(geographicZones)
    output.updateProgressBar(keys.GEOGRAPHIC_ZONES_PROGRESS_BAR, 100)

    // Load countries
    let countries = await fetchCountries()
    await countriesCollection.insertMany(countries)
    output.updateProgressBar(keys.COUNTRIES_PROGRESS_BAR, 100)

    // Load cities
    for (let i = 0; i < countries.length; i++) {
        let dataCities = await fetchCities(countries[i][COUNTRY_ID_KEY])
        let cities = dataCities['result'][0] ? dataCities['result'][0]['cities'] : undefined
        if (cities) {
            await citiesCollection.insertMany(cities)
        }
        output.updateProgressBar(keys.CITIES_PROGRESS_BAR, i+1/countries.length*100)
    }
    output.updateProgressBar(keys.CITIES_PROGRESS_BAR, 100)
}

async function updateLocations(database, output) {
    const geographicZonesCollection = await database.collection(keys.DATABASE_GEOGRAPHIC_ZONES_COLLECTION)
    const countriesCollection = await database.collection(keys.DATABASE_COUNTRIES_COLLECTION)
    const citiesCollection = await database.collection(keys.DATABASE_CITIES_COLLECTION)

    // Load geographic zones
    let dataGeographicZones = await fetchGeographicZones()
    let geographicZones = dataGeographicZones['result']
    for (let geographicZone of geographicZones) {
        const cursor = await geographicZonesCollection.findOne({ geographicZoneId: geographicZone.geographicZoneId })
        if (!cursor) {
            await geographicZonesCollection.insertOne(geographicZone)
        }
        output.updateProgressBar(keys.GEOGRAPHIC_ZONES_UPDATE_PROGRESS_BAR, geographicZones.indexOf(geographicZone)*100/geographicZones.length)
    }
    output.updateProgressBar(keys.GEOGRAPHIC_ZONES_UPDATE_PROGRESS_BAR, 100)

    // Load countries
    let countries = await fetchCountries()
    for (let country of countries) {
        const cursor = await countriesCollection.findOne({ countryId: country.countryId })
        if (!cursor) {
            await countriesCollection.insertOne(country)
        }
        output.updateProgressBar(keys.COUNTRIES_UPDATE_PROGRESS_BAR, countries.indexOf(country)*100/countries.length)
    }
    output.updateProgressBar(keys.COUNTRIES_UPDATE_PROGRESS_BAR, 100)

    // Load cities
    for (let i = 0; i < countries.length; i++) {
        let dataCities = await fetchCities(countries[i][COUNTRY_ID_KEY])
        let cities = dataCities['result'][0] ? dataCities['result'][0]['cities'] : undefined
        if (cities) {
            for (let city of cities) {
                const cursor = await citiesCollection.findOne({ id: city.id })
                if (!cursor) {
                    await citiesCollection.insertOne(city)
                }
            }
        }
        output.updateProgressBar(keys.CITIES_UPDATE_PROGRESS_BAR, i+1/countries.length*100)
    }
    output.updateProgressBar(keys.CITIES_UPDATE_PROGRESS_BAR, 100)
}

module.exports = {
    loadLocations,
    updateLocations
}
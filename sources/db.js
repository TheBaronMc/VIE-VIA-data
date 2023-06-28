const { MongoClient, ServerApiVersion } = require("mongodb")

require('dotenv').config()

const username = encodeURIComponent(process.env.MONGO_USER)
const password = encodeURIComponent(process.env.MONG_PASS)

const uri = `mongodb://${username}:${password}@${process.env.MONGO_ADDRESS}:${process.env.MONGO_PORT}/?authMechanism=DEFAULT`

const client = new MongoClient(uri);

module.exports = {
    client
}
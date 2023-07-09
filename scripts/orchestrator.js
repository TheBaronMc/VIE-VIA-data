const { Worker } = require('worker_threads')

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function launchUpdate() {
    const updateScript = new Worker('./scripts/update_data.js')
    updateScript.on('exit', async () => {
        await sleep(1)
        launchUpdate()
    })
}

const loadScript = new Worker('./scripts/load_data.js')
loadScript.on('exit', async (exitCode) => {
    await sleep(1)
    launchUpdate()
})
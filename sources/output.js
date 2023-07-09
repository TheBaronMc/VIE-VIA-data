const readline = require('readline')

class Output {
    constructor() {
        this.sections = []
        this.initialization = true
    }

    print() {
        // Print sections
        if (!this.initialization) {
            for (let section of this.sections) {
                section.clear()
            }
        }

        // Print sections
        for (let section of this.sections) {
            section.print()
        }

        if (this.initialization) {
            this.initialization = false
        }
    }

    updateProgressBar(name, pct) {
        for (let section of this.sections) {
            let progress = section.find(name)
            if (progress) {
                progress.setPct(pct)
            }
        }

        this.print()
    }

    add(name) {
        let section = new Section(name)

        this.sections.push(section)

        return section
    }
}

class Section {
    constructor(name) {
        this.name = name
        this.progressBars = []
    }

    add(name) {
        this.progressBars.push(new ProgressBar(name));
    }

    find(name) {
        return this.progressBars.find(pb => pb.getName() == name)
    }

    print() {
        process.stdout.write(`\x1b[94m#${this.name}\x1b[0m\n`)

        for (let progressBar of this.progressBars) {
            //process.stdout.clearLine()
            readline.clearLine(process.stdout)
            process.stdout.write(`${progressBar.getName()}: ${progressBar.getPct()}\n`)
        }
    }

    clear() {
        process.stdout.write('\x1b[F')

        for (let i=0; i<this.progressBars.length; i++) {
            process.stdout.write('\x1b[F')
        }
    }
}

class ProgressBar {
    constructor(name) {
        this.name = name
        this.pct  = 0
    }

    getName() {
        return this.name
    }

    getPct() {
        return this.pct >= 100 ? '\x1b[92mOK\x1b[0m' : `${Math.round(this.pct*100)/100}%`
    }

    setPct(pct) {
        this.pct = pct
    }
}

module.exports = {
    Output
} 
const chalk = require('chalk')
var fetch = require('node-fetch')
var crypto = require('crypto')
var Mam = require('./mam.node.js')
var IOTA = require('iota.lib.js')
const powboxPatch = require('@iota/powbox.patch')

var iota = new IOTA({ provider: `https://nodes.testnet.iota.org:443/` })
powboxPatch(iota, 'https://powbox.testnet.iota.org')

// Random Key Generator
const keyGen = length => {
    var charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ9'
    var values = crypto.randomBytes(length)
    var result = new Array(length)
    for (var i = 0; i < length; i++) {
    result[i] = charset[values[i] % charset.length]
    }
    return result.join('')
}

// Generate seed
let seed = "JJQUOSFBMRFNWSQZLSTAVPLCBKVXCLIRJ9UCBAY9PLAKGGQYRFCUOHHXWM9YJOTLLYTIOJPSYHIDILMTI"//keyGen(81)

// Initialise MAM State
let mamState = Mam.init(iota, seed)
//let mamKey = keyGen(81) // Set initial key

console.log (chalk.red.bold("seed: " + seed))
//console.log (chalk.red.bold.bgYellow("key: " + mamKey))


// Publish to tangle
const publish = async packet => {
    // Set channel mode & update key
    //mamState = Mam.changeMode(mamState, 'restricted', mamKey)
    // Create Trytes
    var trytes = iota.utils.toTrytes(JSON.stringify(packet))
    // Get MAM payload
    var message = Mam.create(mamState, trytes)
    // Save new mamState
    mamState = message.state
    // Attach the payload.
    await Mam.attach(message.payload, message.address)
    console.log(chalk.green("Root: " + message.root))
    console.log(chalk.green("Address: " + message.address))

}

var stdin = process.openStdin();
console.log("Now you can start typing...")

stdin.addListener("data", function(d) {
    // note:  d is an object, and when converted to a string it will
    // end with a linefeed.  so we (rather crudely) account for that  
    // with toString() and then trim() 
    var data = {
        time: Date.now(),
        data: {
            text: d.toString().trim()
        }
    }
    
    console.log("you entered: [" +  d.toString().trim() + "], sending...");

    publish(data)
  });
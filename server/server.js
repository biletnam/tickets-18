const express = require('express')
const app = express()
const bodyParser = require('body-parser');
const fs = require('fs')

/**
 * Body parser for POST
 */
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

/**
 * Request headers
 */
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', 'http://localhost:8080')
    res.header('Access-Control-Allow-Headers', 'Origin, Accept, Content-Type, Access-Control-Allow-Origin')
    next()
})

/**
 * Get all tickets
 */
app.get('/', function (req, res) {
    let data = require(__dirname + '/tickets.json')
    res.json(data)
})

/**
 * Add a new ticket
 */
app.post('/server/add', function (req, res) {
    let data = require(__dirname + '/tickets.json')
    let find = data.filter(function (ticket) {
        return ticket.id === req.body.id
    })
    if (find.length === 0) {
        data.push({
            id: req.body.id,
            name: req.body.name,
            content: req.body.content
        })
        data = JSON.stringify(data)
        fs.writeFile(__dirname + '/tickets.json', data)
        res.end(data)
    }
    res.json(data)
})

/**
 * Delete a ticket
 */
app.post('/server/delete', function (req, res) {

})

/**
 * Launch server
 */
app.listen(3000, function () {
    console.log(`Server running at http://localhost:3000/`)
})
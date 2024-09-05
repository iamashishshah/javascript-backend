require('dotenv').config()
const express = require('express')
const PORT = 3000
const app = express()
// console.log(process.env)

app.get('/', (req, res) =>{
    return res.send(`You're on home page`)
})

app.get('/x', (req, res) =>{
    return res.send('<a href="https://x.com/thisisashishah">click here</a>')
})

app.get('/home', (req, res) =>{
    return res.send(`Welcome to Home`)
})

app.get('/login', (req, res) =>{
    return res.send(`First log-in buddy`)
})

app.listen(process.env.PORT, () => console.log(`Server started...`))
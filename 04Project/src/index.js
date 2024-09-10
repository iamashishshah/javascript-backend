// require('dotenv').config({path: './env'})

import dotenv from 'dotenv'
import connectDB from './db/index.js'
import app from './app.js'


dotenv.config({
    path: './env'
})

connectDB()
    .then(() =>{

        app.on('error', (error) =>{
            console.log(`Database can't talk to server, ERROR ${error}`)
            throw new ServerConnectionError(`Got error`)
        })

        app.listen(process.env.PORT || 8000, () =>{
            console.log(`Server is running at port: http://localhost:${process.env.PORT}`)
        })
    })
    .catch((error) => {
        console.log(`MONGODB CONNECTION FAILED!!!: ${error}`)
    })







/* 
 way 1 of connecting database using normal function or IIFE function but it is not great way


import express from 'express'
const app = express();
    // function connectDB(){}  // write some business logic here and your database is connected now
    // connectDB()

    ; (async () => {
        try {
            await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
            app.on('error', (error) =>{
                console.log("Database can't talk to server: ", error)
                throw error
            })

            app.listen(process.env.PORT, () =>{
                console.log(`server started at port: http://localhost:${process.env.PORT}`)
            })

        } catch (error) {
            console.error(`ERROR: ${error}`)
            throw error
        }
    })()

*/
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'  // CRUD operation on cookie of user browser
const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credential: true,
    optionsSuccessStatus: 200,
}))

app.use(express.json({ limit: '16kb' }))
app.use(express.urlencoded({extended: true, limit: '16kb'}))
app.use(express.static("public"))
app.use(cookieParser())


// import routes

import userRouter from './routes/user.routes.js'



// routes declartion
app.use('/api/v1/users', userRouter)


//http://localhost:4000/api/v1/users/(variable path)



export default app
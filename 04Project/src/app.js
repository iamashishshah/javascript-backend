import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'  // CRUD operation on cookie of user browser

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credential: true,
    optionsSuccessStatus: 200,
}))

app.use(express.json({ limit: '16kb' }))
app.use(express.urlencoded({extended: true, limit: '16kb'}))
app.use(express.static("public"))
app.use(cookieParser())


const app = express();

export default app
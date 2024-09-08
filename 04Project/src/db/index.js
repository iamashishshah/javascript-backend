import mongoose from 'mongoose'
import { DB_NAME } from '../constants.js'

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${ process.env.MONGODB_URI }/${ process.env.PORT }}`)
        // console.log(connectionInstance)
        console.log(`Database connected! DB HOST: ${connectionInstance.connection.host}`);
        
    } catch (error) {
        console.log(`mongoDB connection failed error: ${error}`)
        process.exit(1)
    }
}

export default connectDB
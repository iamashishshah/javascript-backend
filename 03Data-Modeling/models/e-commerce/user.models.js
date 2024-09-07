import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: false,
            lowercase: false
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true
        },
        password: {
            type: String,
            required: true,
            unique: false,
            min: [6, 'min password length should be 6 characters'],
            max: [12, 'password can not exceed 12 characters']
        }
    }, { timestamps: true })

export const User = mongoose.model('User', userSchema)
import mongoose from 'mongoose'

const hospitalSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        addressLine1: {
            type: String,
            required: true
        },
        addressLine2: {
            type: String,
            required: false
        },
        city: {
            type: String,
            required: false
        },
        pincode: {
            type: String,
            required: false
        },
        specializedIn: [
            {
                type: String,
                required: true
            }
        ]
    }, { timestamps: true })

export const Hospital = mongoose.model('Hospital', hospitalSchema)
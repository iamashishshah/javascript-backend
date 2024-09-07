import mongoose, { mongo } from 'mongoose'

const patientSchema = mongoose.Schema(
    {
        name: {
            type: String, 
            required: true
        },
        diagonsedWith: {
            type: String,
            required: true
        },
        address: {
            type: String,
            required: false
        },
        age: {
            type: Number,
            required: false
        },
        bloodGroup: {
            type: String,
            enum: ["O +v", "O -ve", "A", "B", "AB"],
            required: false
        },
        gender: {
            type: String,
            enum: ["Male", "Female", "Other"],
            required: false
        },
        addmitedIn: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Hospital"
        }
    }, {timestamps: true})

export const Patient = mongoose.model('Patient', patientSchema)
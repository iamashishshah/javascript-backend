import mongoose, { mongo } from 'mongoose'

const doctorSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        salary: {
            type: Number,
            required: true
        },
        qualification: {
            type: Number,
            required: true
        },
        experience: {
            type: Number,
            default: 0,
            required: false
        },
        worksInhospitals: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Hospital"
            }
        ]
    }, { timestamps: true })

export const Doctor = mongoose.model('Doctor', doctorSchema)
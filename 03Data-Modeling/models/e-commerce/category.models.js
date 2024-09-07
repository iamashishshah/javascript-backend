import mongoose from 'mongoose'

const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: [true, 'already this category exist']
        }
    },
    { timestamps: true })

export const Category = mongoose.model('Category', categorySchema)
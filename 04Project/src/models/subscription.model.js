import mongoose from 'mongoose'
import { Schema } from 'mongoose'

const subscriptionSchema = new Schema(
    {
        subscriber: {
            // one who is subscribing 
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        // one to whom subscriber is subscribing
        channel: {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    },
    {timestamps: true})

export const Subscription = mongoose.model('Subscription', subscriptionSchema)
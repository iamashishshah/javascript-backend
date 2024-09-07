import mongoose from 'mongoose'

const orderItemSchema = mongoose.Schema({
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product"
    },
    quantity: {
        type: Number,
        required: true,
    }
  })
  

const orderSchema = new mongoose.Schema(
    {
        orderPrice: {
            type: Number,
            required: true
        },
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        orderItems: {
            type: [orderItemSchema]
        },
        //TODO: address should be in different schema because at billing time we'll require address
        address: {
            type: String,
            required: true
        },
        status: {
            type: String,
            enum: ["Pending", "Accepted", "Packed", "Canclled", "Delivered"],
            default: "Pending"
        }
    }, {timestamps: true})

export const Order = mongoose.model('Order', orderSchema)
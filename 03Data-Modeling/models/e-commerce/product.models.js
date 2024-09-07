import mongoose from 'mongoose'

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: [true, 'product alread exist']
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: true 
        },
        ownership:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        description:{
            type: String,
            required: true, 
            unique: false,
            //TODO: 
           // default: I want to give description as name of the product by default if user forget to write description
        },
        price:{
            type: Number,
            required: true,
            unique: false,
            default: 10
        },
        discount: {
            type: Number,
            required: false,
            unique: false,
            default: 10
        }, 
        productImage: {
            //TODO: 
            /* there are multiple option to store the image, store in database is buffer but it will make database heavy
            so store somewhere else and ask for image url,
            if there are multiple sizes of image, then store their url in array format
            */
            type: String,
        }, 
        stock:{
            type: Number,
            required: true,
            default: 0
        }
    }, { timestamps: true })

export const Product = mongoose.model('Product', productSchema)
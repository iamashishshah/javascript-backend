import mongoose, { mongo, Schema } from 'mongoose'
import mongooseAggregatePaginat from 'mongoose-aggregate-paginate-v2'


const videoSchema = new Schema(
    {
        videoFile: {
            type: String, // use cloudinary service
            required: [true, "bhai video to upload kr"]
        },
        thumbnail: {
            type: String, // cloudinary
            required: true
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },
        title: {
            type: String,
            required: true,
            max: [100, "The title must not exceed 100 characters in length."],
            default: function () {
                return new Date.toLocalString()
            }
        },
        description: {
            type: String,
            max: [5000, "You've exceeded the limit"],
            default: ""
        },
        duration: {
            type: Number,
            required: true,
        },
        views: {
            type: Number,
            required: true,
            default: 0
        },
        isPublished: {
            type: Boolean,
            required: true,
            default: true
        }
    }
    , { timestamps: true })


videoSchema.plugin(mongooseAggregatePaginat)

export const Video = mongoose.model("Video", videoSchema)
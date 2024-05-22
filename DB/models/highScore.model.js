import { Schema, model,Types } from "mongoose";
import mongoose from "mongoose";
const highSchema = new Schema({

    _id: mongoose.Schema.Types.ObjectId,
    
        
        positive_tweets: [{
            sentiment: String,
            score: Number,
            text: String,
            time: Date
        }],
        negative_tweets: [{
            sentiment: String,
            score: Number,
            text: String,
            time: Date
        }]
        
        
    },
    {
        timestamps: true,
    }
);
    
    export const highModel = model('High', highSchema);
    export default highModel;
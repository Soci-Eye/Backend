import { Schema, model,Types } from "mongoose";
import mongoose from "mongoose";
const FhighSchema = new Schema({

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
    
    export const free_highModel = model('freesamples', FhighSchema);
    export default free_highModel;
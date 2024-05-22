import { Schema, model,Types } from "mongoose";
import mongoose from "mongoose";

const FpercSchema = new Schema({

    _id: mongoose.Schema.Types.ObjectId,
            positive_wordcloud: String, 
            negative_wordcloud: String
    },
    {
        timestamps: true,
    }
);
    
    export const free_percModel = model('freepis', FpercSchema);
    export default free_percModel;


import { Schema, model,Types } from "mongoose";
import mongoose from "mongoose";

const wordSchema = new Schema({

    _id: mongoose.Schema.Types.ObjectId,
        
        positive_wordcloud:{
            type: String,
            required: true
        } ,
        negative_wordcloud: {
            type: String,
            required:true
        }
    },
    {
        timestamps: true,
    }
);
    
    export const wordModel = model('word', wordSchema);
    export default wordModel;
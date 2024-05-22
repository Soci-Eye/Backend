import { Schema, model,Types } from "mongoose";
import mongoose from "mongoose";

const FwordSchema = new Schema({

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
    
    export const free_wordModel = model('freewords', FwordSchema);
    export default free_wordModel;
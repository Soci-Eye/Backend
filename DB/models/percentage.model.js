import { Schema, model,Types } from "mongoose";
import mongoose from "mongoose";

const percSchema = new Schema({

    _id: mongoose.Schema.Types.ObjectId,
            positive_wordcloud: String, 
            negative_wordcloud: String
    },
    {
        timestamps: true,
    }
);
    
    export const percModel = model('prces', percSchema);
    export default percModel;
import { Schema, model ,Types} from "mongoose";
import mongoose from "mongoose";
const aiSchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    scrapeId: { 
        type: Types.ObjectId,
            ref: 'Scrape', 
            required: true 
        },

        
        sentiment: String,

        score: Number, 

        text: String,

        time: Date
    },
    {
        timestamps: true,
    }
);
    
    export const aiModel = model('Ai', aiSchema);
    export default aiModel;
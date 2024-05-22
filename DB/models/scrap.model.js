import { Schema, model } from "mongoose";
// import {topic} from "../../dep.js"

const scrapingSchema = new Schema({
        
    user: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true
    },
    time: {
        type: Date,
        required: true
    }
    },
    {
        timestamps: true,
    }
);

    
    export const scrapingModel = model('scrapes', scrapingSchema);
    
    export default scrapingModel;

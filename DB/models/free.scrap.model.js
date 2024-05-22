import { Schema, model } from "mongoose";
// import {topic} from "../../dep.js"

const tweetSchema = new Schema({
        
    user: {
        type: String,
        required: true
    },
    text: {
        type: String,
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

    
    export const free_tweetModel = model('freetweets', tweetSchema);
    
    export default free_tweetModel;

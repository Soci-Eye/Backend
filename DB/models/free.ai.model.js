import { Schema, model ,Types} from "mongoose";
import mongoose from "mongoose";
const freeaiSchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    

        
        sentiment: String,

        score: Number, 

        text: String,

        time: Date
    },
    {
        timestamps: true,
    }
);
    
    export const free_aiModel = model('freeais', freeaiSchema);
    export default free_aiModel;
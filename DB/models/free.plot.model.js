import { Schema, model ,Types} from "mongoose";
import mongoose from "mongoose";


    const FdataPointSchema = new mongoose.Schema({
        _id: mongoose.Schema.Types.ObjectId,
        x: { type: Date, required: true },
        y: { type: Number, required: true }
    });
    
    
    

const plotingSchema = new mongoose.Schema({
    data: [FdataPointSchema]
});

    
    export const free_plottingModel = model('freetrends', plotingSchema);
    export default free_plottingModel;
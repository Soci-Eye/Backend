import { Schema, model ,Types} from "mongoose";
import mongoose from "mongoose";


    const dataPointSchema = new mongoose.Schema({
        _id: mongoose.Schema.Types.ObjectId,
        x: { type: Date, required: true },
        y: { type: Number, required: true }
    });
    
    
    

const plotSchema = new mongoose.Schema({
    data: [dataPointSchema]
});

    
    export const plottingModel = model('plottings', plotSchema);
    export default plottingModel;
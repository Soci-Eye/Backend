import free_aiModel from '../../../DB/models/free.ai.model.js'
import free_highModel from '../../../DB/models/free.high.model.js'
import free_percModel from '../../../DB/models/free.perc.model.js'
import free_plottingModel from '../../../DB/models/free.plot.model.js'
import free_tweetModel from '../../../DB/models/free.scrap.model.js'
import free_wordModel from '../../../DB/models/free.word.model.js'
import { asyncHandler } from '../../../service/errorHandling.js'
import {v2 as cloudinary} from 'cloudinary';

cloudinary.config({ 
    api_key: process.env.api_key,
    api_secret: process.env.api_secret,
    cloud_name: process.env.cloud_name,
});







export const getfreeAllHigh = asyncHandler( async (req, res) => {
    try {
        const data = await free_highModel.find({}, { _id: 0 });
        res.json(data);
    } catch (error) {
        console.error('Error retrieving data:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


export const getfreeAiOutput = asyncHandler( async (req, res) => {
    try {
        const data = await free_aiModel.find({}, { _id: 0 });
        res.json(data);
    } catch (error) {
        console.error('Error retrieving data:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


export const getfreePrces = asyncHandler( async (req, res) => {
    try {
        const data = await free_percModel.find({}, { _id: 0 });
        res.json(data);
    } catch (error) {
        console.error('Error retrieving data:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export const freeword = asyncHandler(async (req, res) => {
    const { type } = req.params;

    try {
        // Fetch the document based on type
        let wordDoc;
        if (type === 'positive') {
            wordDoc = await free_wordModel.findOne({ positive_wordcloud: { $exists: true } });
        } else if (type === 'negative') {
            wordDoc = await free_wordModel.findOne({ negative_wordcloud: { $exists: true } });
        } else {
            return res.status(400).json({ message: 'Invalid image type' });
        }

        if (!wordDoc) {
            return res.status(404).json({ message: 'Document not found' });
        }

        // Get the base64 image data
        let imageData;
        if (type === 'positive') {
            imageData = wordDoc.positive_wordcloud;
        } else if (type === 'negative') {
            imageData = wordDoc.negative_wordcloud;
        }

        if (!imageData) {
            return res.status(404).json({ message: 'Image not found' });
        }

        // Upload the image to Cloudinary
        const uploadResponse = await cloudinary.uploader.upload(`data:image/png;base64,${imageData}`);

        // Get the URL of the uploaded image
        const imageUrl = uploadResponse.secure_url;

        // Return the image URL in the response
        res.status(200).json({ imageUrl });
    } catch (error) {
        console.error('Error retrieving image:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


// export const freeword = asyncHandler(async (req, res) => {

//     const { type } = req.params;

//     try {
//         // Fetch the document based on type
//         let wordDoc;
//         if (type === 'positive') {
//             wordDoc = await free_wordModel.findOne({ positive_wordcloud: { $exists: true } });
//         } else if (type === 'negative') {
//             wordDoc = await free_wordModel.findOne({ negative_wordcloud: { $exists: true } });
//         } else {
//             return res.status(400).json({ message: 'Invalid image type' });
//         }

//         if (!wordDoc) {
//             return res.status(404).json({ message: 'Document not found' });
//         }

//         // Get the base64 image data
//         let imageData;
//         if (type === 'positive') {
//             imageData = wordDoc.positive_wordcloud;
//         } else if (type === 'negative') {
//             imageData = wordDoc.negative_wordcloud;
//         }

//         if (!imageData) {
//             return res.status(404).json({ message: 'Image not found' });
//         }

//         // Convert base64 to image URL
//         const imageUrl = `data:image/png;base64,${imageData}`;

//         // Return the image URL in the response
//         res.status(200).json({ imageUrl });
//     } catch (error) {
//         console.error('Error retrieving image:', error);
//         res.status(500).json({ message: 'Internal server error' });
//     }})
// ;

    

    export const getAllfreePlotting = asyncHandler( async (req, res) => {
        try {
            // Fetch all data from the MongoDB collection and exclude the `_id` field
            const allData = await free_plottingModel.find({}, { _id: 0 });
        
            // Log the data to check if it's being retrieved correctly
            console.log("Fetched Data:", allData);
        
            // If no data is found, send a 404 response
            if (allData.length === 0) {
            return res.status(404).json({ message: "No data found" });
            }
        
            // If data is found, send it as a response
            res.status(200).json(allData);
            } catch (error) {
            // If an error occurs, send a 500 response with the error message
            res.status(500).json({ message: error.message });
            }
        })



            
            export const searchTweets =  asyncHandler(async (req, res) => {
                const { text } = req.body;
                if (!text) {
                return res.status(400).json({ message: 'Text is required in the request body' });
                }
            
                try {
                const tweets = await free_tweetModel.find({ text: new RegExp(text, 'i') },{ _id: 0 }); // 'i' for case-insensitive
                console.log('Fetched Tweets:', tweets);
            
                if (tweets.length === 0) {
                    return res.status(404).json({ message: 'No tweets found' });
                }
            
                res.status(200).json(tweets);
                } catch (error) {
                res.status(500).json({ message: error.message });
                }
            });

import { spawn } from 'child_process';
import fs from 'fs'
// import { json } from 'express';
import ScrapingModel from "./DB/models/scrap.model.js";
import  {asyncHandler}  from "./service/errorHandling.js";
import aiModel from "./DB/models/ai.model.js";
import highModel from "./DB/models/highScore.model.js";
import percModel from "./DB/models/percentage.model.js";
import wordModel from "./DB/models/wordCloud.mode.js";
import plottingModel from "./DB/models/polting.model.js";
// import { log } from 'console';
import {v2 as cloudinary} from 'cloudinary';

cloudinary.config({ 
    api_key: process.env.api_key,
    api_secret: process.env.api_secret,
    cloud_name: process.env.cloud_name,
});






export const scraping = asyncHandler(async (req, res) => {

    const {topic} = req.body;
    
    if (!topic) {
        
        return res.status(400).send('Search term is required.');
    }

    
    
    await deleteData(ScrapingModel);
    await deleteData(aiModel);
    await deleteData(highModel);
    await deleteData(percModel);
    await deleteData(wordModel);
    await deleteData(plottingModel);

    const pythonProcess = spawn('python', ['web_scraping.py', topic]);
    let tweetsData = '';
    pythonProcess.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
        tweetsData += data.toString();  // Collect the tweets data from stdout
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    pythonProcess.on('close', async (code) => {
        console.log(`child process exited with code ${code}`);

        try {
            console.log('Received data:', tweetsData);

            const tweets = JSON.parse(tweetsData);

            if (!Array.isArray(tweets)) {
                throw new Error('Invalid tweets data received from Python script.');
            }

            if (tweets.length === 0) {
                throw new Error('No tweets found for the given topic.');
            }

            // Save the tweets data to the ScrapingModel
            await ScrapingModel.insertMany(tweets);

            // Retrieve the saved data from the database
            // const savedData = await ScrapingModel.find({});

            res.status(200).json('true'); // Send the saved data as the response

            if (tweets.length > 0) {
                const fileProcess = spawn('python', ['file.py']);
                fileProcess.stdout.on('data', (data) => {
                    console.log(`file.py stdout: ${data}`);
                });
                fileProcess.stderr.on('data', (data) => {
                    console.error(`file.py stderr: ${data}`);
                });
                fileProcess.on('close', (fileCode) => {
                    console.log(`file.py child process exited with code ${fileCode}`);
                });
            }
        } catch (error) {
            console.error('Error handling tweets data:', error);
            res.status(500).send('Internal Server Error');
        }
    });
});

async function deleteData(Model) {
    await Model.deleteMany({});
}




export const getAllHigh = async (req, res) => {
    try {
        const data = await highModel.find({}, { _id: 0 });
        res.json(data);
    } catch (error) {
        console.error('Error retrieving data:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


export const getAiOutput = async (req, res) => {
    try {
        const data = await aiModel.find({}, { _id: 0 });
        res.json(data);
    } catch (error) {
        console.error('Error retrieving data:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


export const getPrces = async (req, res) => {
    try {
        const data = await percModel.find({}, { _id: 0 });
        res.json(data);
    } catch (error) {
        console.error('Error retrieving data:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


export const word = asyncHandler(async (req, res) => {
    const { type } = req.params;

    try {
        // Fetch the document based on type
        let wordDoc;
        if (type === 'positive') {
            wordDoc = await wordModel.findOne({ positive_wordcloud: { $exists: true } });
        } else if (type === 'negative') {
            wordDoc = await wordModel.findOne({ negative_wordcloud: { $exists: true } });
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
;

    

    export const getAllPlotting = async (req, res) => {
        try {
            // Fetch all data from the MongoDB collection and exclude the `_id` field
            const allData = await plottingModel.find({}, { _id: 0 });
        
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
        }





        // export const word = async (req, res) => {
        //     const { type } = req.params;

        //     try {
        //         // Fetch the first document based on type
        //         let wordDoc;
        //         if (type === 'positive') {
        //             wordDoc = await wordModel.findOne({ positive_wordcloud: { $exists: true } });
        //         } else if (type === 'negative') {
        //             wordDoc = await wordModel.findOne({ negative_wordcloud: { $exists: true } });
        //         } else {
        //             return res.status(400).send('Invalid image type');
        //         }
        
        //         if (!wordDoc) {
        //             return res.status(404).send('Document not found');
        //         }
        
        //         // Get the base64 image string
        //         let imageData;
        //         if (type === 'positive') {
        //             imageData = wordDoc.positive_wordcloud;
        //         } else if (type === 'negative') {
        //             imageData = wordDoc.negative_wordcloud;
        //         }
        
        //         if (!imageData) {
        //             return res.status(404).send('Image not found');
        //         }
        
        //         // Convert base64 string to binary buffer
        //         const imgBuffer = Buffer.from(imageData, 'base64');
        
        //         // Send the image buffer in the response
        //         res.set('Content-Type', 'image/png');
        //         res.send(imgBuffer);
        //     } catch (error) {
        //         console.error('Error retrieving image:', error);
        //         res.status(500).send('Internal server error');
        //     }
        // }

        
// export const scraping = asyncHandler( async (req, res) => {
//     const { topic } = req.body;
//     if (!topic) {

//         return res.status(400).send('Search term is required.');
//     }
    
//     const pythonProcess = spawn('python', ['web_scraping.py', topic]);
//     let tweetsData = '';
//     pythonProcess.stdout.on('data', (data) => {
//         console.log(`stdout: ${data}`);
//         tweetsData += data.toString();  // Collect the tweets data from stdout
//     });

//     pythonProcess.stderr.on('data', (data) => {
//         console.error(`stderr: ${data}`);
//     });

//     pythonProcess.on('close', async (code) => {
//         console.log(`child process exited with code ${code}`);

//         try {
//             console.log('Received data:', tweetsData);

//             const tweets = JSON.parse(tweetsData);

//             if (!Array.isArray(tweets)) {
//                 throw new Error('Invalid tweets data received from Python script.');
//             }

//             if (tweets.length === 0) {
//                 throw new Error('No tweets found for the given topic.');
//             }

//             // Save the tweets data to the ScrapingModel
//             await ScrapingModel.insertMany(tweets);

//             // Retrieve the saved data from the database
//             const savedData = await ScrapingModel.find({});

//             res.json(savedData); // Send the saved data as the response

//             if (tweets.length > 0) {
//                     const fileProcess = spawn('python', ['file.py']);
//                     fileProcess.stdout.on('data', (data) => {
//                         console.log(`file.py stdout: ${data}`);
//                     });
//                     fileProcess.stderr.on('data', (data) => {
//                         console.error(`file.py stderr: ${data}`);
//                     });
//                     fileProcess.on('close', (fileCode) => {
//                         console.log(`file.py child process exited with code ${fileCode}`);
//                     });
//                 }
//         } catch (error) {
//             console.error('Error handling tweets data:', error);
//             res.status(500).send('Internal Server Error');
//         }
//     });
// });

// if (tweets.length > 0) {
//     const fileProcess = spawn('python', ['file.py']);
//     fileProcess.stdout.on('data', (data) => {
//         console.log(`file.py stdout: ${data}`);
//     });
//     fileProcess.stderr.on('data', (data) => {
//         console.error(`file.py stderr: ${data}`);
//     });
//     fileProcess.on('close', (fileCode) => {
//         console.log(`file.py child process exited with code ${fileCode}`);
//     });
// }

// import {aiModel} from './DB/models/ai.model.js'

// const newResult = new aiModel({
//     sentiment: "Positive",
//     score: 0.8975018858909607,
//     text: "Focus on what you want. Drop a ❤️ if you agree.",
//     time: new Date("2024-05-14T12:00:39.000Z")
//   });
//   console.log(newResult);
  
//   // Save the new result to the database
//   newResult.save()
//     .then(result => {
//       console.log("Result saved:", result);
//     })
//     .catch(error => {
//       console.error("Error saving result:", error);
//     });
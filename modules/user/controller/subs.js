// import User from "../../../DB/models/user.js";
import { userModel } from "../../../DB/models/user.js";
import { asyncHandler } from "../../../service/errorHandling.js";
// import {SubscriptionModel} from "../../../DB/models/subscription.js"
import dotenv from 'dotenv'
dotenv.config()
// const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);


export const prices = async (req, res) => {
    const prices = await stripe.prices.list();
  //   console.log("prices", prices);
    res.json(prices.data.reverse());
};


export const createSubscription = asyncHandler( async (req, res) => {
    try {
        const user = await userModel.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // // Update the user role to "vip" immediately
        // user.role = "vip";
        // await user.save();

        const session = await stripe.checkout.sessions.create({
            mode: "subscription",
            payment_method_types: ["card"],
            line_items: [
                {
                    price: req.body.priceId,
                    quantity: 1,
                },
            ],
            customer: user.stripe_customer_id,
            success_url: process.env.STRIPE_SUCCESS_URL,
            cancel_url: process.env.STRIPE_CANCEL_URL,
        });

        if (!session) {
            return res.status(400).json({ message: "Unable to create subscription session" });
        }

        res.json({ url: session.url });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});






export const subscriptionStatus = asyncHandler( async (req, res) => {
    try {
        const user = await userModel.findById(req.user.id);
        console.log(req.user.id);

        const subscriptions = await stripe.subscriptions.list({
            customer: user.stripe_customer_id,
            status: "all",
            expand: ["data.default_payment_method"],
        });

        // Assuming the subscription data is returned in the 'subscriptions' variable
        const subscription = subscriptions.data[0];
        console.log(subscription); // Assuming there's only one subscription
        
        // Check if the subscription is active and the latest invoice is paid
        if (subscription && subscription.status === "active" ) {
            // Update user role to "VIP"
            user.role = "vip";
            await user.save();
        }

        // Update user document with subscriptions data
        const updatedUser = await userModel.findByIdAndUpdate(
            user.id,
            { subscriptions: subscriptions.data },
            { new: true }
        );
            await updatedUser.save()
        res.json('user is vip');
    
        
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Internal server error" });
    }
});




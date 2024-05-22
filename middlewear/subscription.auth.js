
import userModel from '../DB/models/user.js'

const checkVIP = async (req, res, next) => {
    try {
        // Get the user ID from the request
        const userId = req.user.id; // Ensure user authentication middleware sets this

        // Find the user's subscription
        const subscription = await userModel.findOne({ userId, role:'vip' });

        // Check if the subscription is active and the user is a VIP
        if (!subscription) {
            return res.status(403).json({ error: 'Access denied. VIP membership required to access this resource.' });
        }

        req.subscription = subscription;

        // Proceed to the next middleware or route handler
        next();
    } catch (error) {
        console.error('Error checking VIP status:', error);
        res.status(500).json({ error: 'An error occurred' });
    }
};

export default checkVIP
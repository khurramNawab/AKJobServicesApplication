import Newsletter from '../models/Newsletter.js';

/**
 * @desc    Subscribe to newsletter
 * @route   POST /api/v1/newsletter/subscribe
 * @access  Public
 */
export const subscribeToNewsletter = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Please provide an email' });
        }

        // Check if already subscribed
        const existing = await Newsletter.findOne({ email });
        if (existing) {
            return res.status(400).json({ success: false, message: 'You are already subscribed!' });
        }

        await Newsletter.create({ email });

        res.status(201).json({
            success: true,
            message: 'Successfully joined our newsletter matrix!'
        });
    } catch (error) {
        console.error('[NEWSLETTER] Error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error while subscribing'
        });
    }
};

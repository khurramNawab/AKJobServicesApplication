import Recruiter from '../models/Recruiter.js';

/**
 * @desc    Get all unique companies from recruiters
 * @route   GET /api/v1/companies
 * @access  Public
 */
export const getAllCompanies = async (req, res) => {
    try {
        const companies = await Recruiter.find({ 
            companyName: { $ne: '' },
            'privacy.companyVisibility': true 
        }).select('companyName industry location companyLogo description website');

        res.status(200).json({
            success: true,
            count: companies.length,
            data: companies
        });
    } catch (error) {
        console.error('[COMPANY] Fetch Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching companies'
        });
    }
};

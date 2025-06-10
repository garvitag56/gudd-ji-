const UserFeedback = require('../models/UserFeedback');
const GoogleSheetsService = require('../services/googleSheets');

exports.submitFeedback = async (req, res) => {
  try {
    const { name, email, phone, location, orderDetails, feedback } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !location || !orderDetails) {
      return res.status(400).json({
        success: false,
        error: 'Please provide all required fields'
      });
    }

    // Create feedback entry in database
    const userFeedback = await UserFeedback.create({
      name,
      email,
      phone,
      location,
      orderDetails,
      feedback
    });

    // Append data to Google Sheet
    await GoogleSheetsService.appendUserData({
      name,
      email,
      phone,
      location,
      orderDetails,
      feedback
    });

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      data: userFeedback
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({
      success: false,
      error: 'Error submitting feedback'
    });
  }
};

exports.getFeedback = async (req, res) => {
  try {
    const feedback = await UserFeedback.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: feedback
    });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching feedback'
    });
  }
}; 
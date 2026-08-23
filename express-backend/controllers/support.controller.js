const UserQuery = require('../models/UserQuery');

exports.createTicket = async (req, res) => {
  try {
    const { category, subject, message } = req.body;
    
    if (!category || !subject || !message) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const newQuery = new UserQuery({
      user: req.userId,
      category,
      subject,
      message
    });

    await newQuery.save();

    res.status(201).json({ message: 'Support ticket submitted successfully.', ticket: newQuery });
  } catch (error) {
    console.error('Error creating support ticket:', error);
    res.status(500).json({ message: 'Server error while creating ticket.' });
  }
};

exports.getUserTickets = async (req, res) => {
  try {
    const tickets = await UserQuery.find({ user: req.userId }).sort({ createdAt: -1 });
    res.status(200).json({ tickets });
  } catch (error) {
    console.error('Error fetching user tickets:', error);
    res.status(500).json({ message: 'Server error while fetching tickets.' });
  }
};

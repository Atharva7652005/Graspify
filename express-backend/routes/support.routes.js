const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middlewares/auth.middleware');
const supportController = require('../controllers/support.controller');

router.post('/', requireAuth, supportController.createTicket);
router.get('/', requireAuth, supportController.getUserTickets);

module.exports = router;

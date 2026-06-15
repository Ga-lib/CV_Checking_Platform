const express = require('express');
const router = express.Router();
const { rankCandidates } = require('../controllers/recruiterController');
const upload = require('../middleware/upload');

router.post('/', upload.array('cvs', 20), rankCandidates);

module.exports = router;
const express = require('express');
const router = express.Router();
const { analyseCV } = require('../controllers/analyseController');
const upload = require('../middleware/upload');

router.post('/', upload.single('cv'), analyseCV);

module.exports = router;
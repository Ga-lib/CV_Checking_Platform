const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

if (!process.env.GROQ_API_KEY) {
  console.error('CRITICAL ERROR: GROQ_API_KEY is not defined in .env file.');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
const analyseRoute = require('./routes/analyse');
const recruiterRoute = require('./routes/recruiter');

app.use('/api/analyse', analyseRoute);
app.use('/api/recruiter', recruiterRoute);

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'CV Platform API is running!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
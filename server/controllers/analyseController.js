const Groq = require('groq-sdk');
const { extractTextFromPDF } = require('../utils/pdfExtractor');
const { parseAIResponse, truncateText } = require('../utils/aiHelper');
require('dotenv').config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const analyseCV = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No CV file uploaded' });
    }

    const jobDescription = truncateText(req.body.jobDescription, 4000); // Tightened limit

    let cvText;
    try {
      cvText = await extractTextFromPDF(req.file.buffer);
      cvText = truncateText(cvText, 20000); // Tightened limit to ~5k tokens
    } catch (pdfError) {
      console.error('PDF extraction error:', pdfError);
      return res.status(400).json({ error: 'Could not extract text from PDF. Please ensure it is a valid PDF.' });
    }

    if (!cvText || cvText.trim().length === 0) {
      return res.status(400).json({ error: 'The uploaded PDF appears to be empty or non-parseable.' });
    }

    const systemPrompt = 'You are an expert CV/Resume analyst and ATS specialist. Always respond with valid JSON only. No extra text, no markdown, no backticks.';
    
    let userPrompt = `Analyse the following CV and provide evaluation in this EXACT JSON format:

{
  "ats_score": <number 0-100>,
  "overall_summary": "<2-3 sentence summary>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "weaknesses": ["<weakness 1>", "<weakness 2>", "<weakness 3>"],
  "missing_skills": ["<skill 1>", "<skill 2>", "<skill 3>"],
  "formatting_feedback": "<specific formatting advice>",
  "improvement_suggestions": ["<suggestion 1>", "<suggestion 2>", "<suggestion 3>"],
  "score_breakdown": {
    "formatting": <number 0-25>,
    "keywords": <number 0-25>,
    "experience": <number 0-25>,
    "skills": <number 0-25>
  }
}`;

    if (jobDescription) {
      userPrompt = `Analyse the following CV in the context of the provided JOB DESCRIPTION and provide evaluation in this EXACT JSON format:

{
  "ats_score": <number 0-100>,
  "job_match_score": <number 0-100>,
  "overall_summary": "<How well the candidate matches the job description in 2-3 sentences>",
  "strengths": ["<strength relevant to job>", "<strength 2>", "<strength 3>"],
  "weaknesses": ["<weakness relative to job gaps>", "<weakness 2>", "<weakness 3>"],
  "missing_skills": ["<specific skill from JD missing in CV>", "<skill 2>", "<skill 3>"],
  "formatting_feedback": "<specific formatting advice>",
  "improvement_suggestions": ["<how to better align CV with this specific JD>", "<suggestion 2>", "<suggestion 3>"],
  "score_breakdown": {
    "formatting": <number 0-25>,
    "keywords": <number 0-25>,
    "experience": <number 0-25>,
    "skills": <number 0-25>
  }
}

JOB DESCRIPTION:
${jobDescription}
`;
    }

    userPrompt += `\n\nCV Content:\n${cvText}`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3,
      max_tokens: 1500
    });

    const analysis = parseAIResponse(completion.choices[0].message.content);

    res.json({ success: true, analysis });

  } catch (error) {
    console.error('Analysis error:', error);
    const status = error.status || 500;
    const message = error.message || 'Failed to analyse CV. Please try again.';
    res.status(status).json({ error: message });
  }
};

module.exports = { analyseCV };
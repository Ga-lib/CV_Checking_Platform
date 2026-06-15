const Groq = require('groq-sdk');
const { extractTextFromPDF } = require('../utils/pdfExtractor');
const { parseAIResponse, truncateText } = require('../utils/aiHelper');
require('dotenv').config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const rankCandidates = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No CV files uploaded' });
        }

        const jobDescription = truncateText(req.body.jobDescription, 4000); // Limit JD
        if (!jobDescription) {
            return res.status(400).json({ error: 'No job description provided' });
        }

        // Extract text from all CVs
        const candidates = await Promise.all(
            req.files.map(async (file) => {
                try {
                    let text = await extractTextFromPDF(file.buffer);
                    text = truncateText(text, 2000); // Strict limit per CV for ranking
                    return { filename: file.originalname, text };
                } catch (err) {
                    console.error(`Failed to extract text from ${file.originalname}:`, err);
                    return { filename: file.originalname, text: '[TEXT EXTRACTION FAILED]', error: true };
                }
            })
        );

        const validCandidates = candidates.filter(c => !c.error && c.text.trim().length > 0);

        if (validCandidates.length === 0) {
            return res.status(400).json({ error: 'None of the uploaded CVs could be parsed.' });
        }

        // Rank all candidates with AI
        const completion = await groq.chat.completions.create({
            model: 'llama-3.1-8b-instant', // Switched for higher TPM limits (30k+)
            messages: [
                {
                    role: 'system',
                    content: 'You are an expert recruiter and ATS specialist. Always respond with valid JSON only. No extra text, no markdown, no backticks.'
                },
                {
                    role: 'user',
                    content: `You are ranking candidates for a job position.

JOB DESCRIPTION:
${jobDescription}

CANDIDATES:
${validCandidates.map((c, i) => `Candidate ${i + 1} (${c.filename}):\n${c.text}`).join('\n\n---\n\n')}

Rank ALL candidates and return this EXACT JSON format:
{
  "results": [
    {
      "filename": "<exact filename>",
      "match_score": <number 0-100>,
      "reasoning": "<2-3 sentence explanation of why this candidate matches or doesn't match>",
      "matching_skills": ["<skill 1>", "<skill 2>", "<skill 3>"],
      "missing_skills": ["<skill 1>", "<skill 2>", "<skill 3>"]
    }
  ]
}

Order results from highest to lowest match_score.`
                }
            ],
            temperature: 0.3,
            max_tokens: 2500
        });

        const parsed = parseAIResponse(completion.choices[0].message.content);

        res.json({ success: true, results: parsed.results });

    } catch (error) {
        console.error('Ranking error:', error);
        const status = error.status || 500;
        const message = error.message || 'Failed to rank candidates. Please try again.';
        res.status(status).json({ error: message });
    }
};

module.exports = { rankCandidates };
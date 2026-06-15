function parseAIResponse(text) {
    try {
        const clean = text.replace(/```json|```/g, '').trim();
        return JSON.parse(clean);
    } catch (error) {
        console.error('Failed to parse AI response:', text);
        throw new Error('Invalid response format from AI');
    }
}

/**
 * Truncates text to a maximum number of characters to stay within API token limits.
 * Roughly 4 characters per token. 
 */
function truncateText(text, maxChars = 30000) {
    if (!text) return '';
    if (text.length <= maxChars) return text;
    return text.substring(0, maxChars) + '... [TRUNCATED DUE TO SIZE LIMITS]';
}

module.exports = { parseAIResponse, truncateText };

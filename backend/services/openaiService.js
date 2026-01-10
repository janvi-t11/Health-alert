const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Analyze report for fake/spam detection using OpenAI
 * Returns validation score and flags
 */
async function detectFakeReport(reportData) {
  try {
    const { diseaseType, description, healthIssue, severity, area, city } = reportData;
    
    const prompt = `You are a health report validation system. Analyze this health report for authenticity and quality.

Report Details:
- Disease Type: ${diseaseType}
- Health Issue: ${healthIssue || 'Not specified'}
- Severity: ${severity}
- Location: ${area}, ${city}
- Description: ${description || 'No description provided'}

Analyze for:
1. Is this a legitimate health concern or spam/fake?
2. Does the description match the disease type?
3. Is the severity appropriate for the description?
4. Are there suspicious patterns (gibberish, promotional content, irrelevant text)?
5. Quality of information provided

Respond in JSON format:
{
  "isFake": boolean,
  "confidence": number (0-100),
  "riskLevel": "low" | "medium" | "high",
  "flags": array of strings (reasons if suspicious),
  "qualityScore": number (0-100),
  "recommendation": "approve" | "review" | "reject",
  "reasoning": string (brief explanation)
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an expert health report validator. Analyze reports for authenticity, quality, and potential spam/misinformation.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 500,
      response_format: { type: "json_object" }
    });

    const analysis = JSON.parse(response.choices[0].message.content);
    
    console.log('OpenAI Fake Detection Analysis:', analysis);
    
    return {
      success: true,
      analysis: {
        isFake: analysis.isFake || false,
        confidence: analysis.confidence || 0,
        riskLevel: analysis.riskLevel || 'low',
        flags: analysis.flags || [],
        qualityScore: analysis.qualityScore || 50,
        recommendation: analysis.recommendation || 'review',
        reasoning: analysis.reasoning || 'Analysis completed',
        analyzedAt: new Date(),
        model: 'gpt-3.5-turbo'
      }
    };
    
  } catch (error) {
    console.error('OpenAI API Error:', error.message);
    
    // Fallback: Don't block report submission if AI fails
    return {
      success: false,
      error: error.message,
      analysis: {
        isFake: false,
        confidence: 0,
        riskLevel: 'unknown',
        flags: ['AI analysis unavailable'],
        qualityScore: 50,
        recommendation: 'review',
        reasoning: 'AI analysis failed, manual review required',
        analyzedAt: new Date(),
        model: 'fallback'
      }
    };
  }
}

module.exports = {
  detectFakeReport
};

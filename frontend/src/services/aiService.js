import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export const aiService = {
  analyzeHealthReport: async (reportData) => {
    try {
      const prompt = `Analyze this health report and provide classification:

Report Details:
- Disease Type: ${reportData.diseaseType}
- Health Issue: ${reportData.healthIssue}
- Description: ${reportData.description}
- Location: ${reportData.area}, ${reportData.city}, ${reportData.state}

Provide JSON response:
{
  "severity": "mild|moderate|severe|critical",
  "riskCategory": "infectious|environmental|food-safety|chronic",
  "urgencyScore": 1-10,
  "recommendedActions": ["action1", "action2"],
  "communityRisk": "low|medium|high",
  "aiConfidence": 0.0-1.0
}`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a health expert AI. Respond only with valid JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 500
      });

      return JSON.parse(completion.choices[0].message.content);
    } catch (error) {
      console.error('AI Analysis failed:', error);
      throw error;
    }
  }
};
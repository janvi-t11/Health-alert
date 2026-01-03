import { API_BASE_URL } from '../api';

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

      const resp = await fetch(`${API_BASE_URL}/ai/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reportData)
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error || 'AI analysis failed');
      }
      return await resp.json();
    } catch (error) {
      console.error('AI Analysis failed:', error);
      throw error;
    }
  }
};
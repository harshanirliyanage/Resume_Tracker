const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

/**
 * Analyze a resume against a job description using Claude.
 * Returns: { matchScore, missingKeywords, improvementTips, jobTitle, company }
 */
async function analyzeResume(resumeText, jobDescription) {
  const prompt = `You are an expert career coach and ATS (Applicant Tracking System) specialist. 
Analyze the resume against the job description below and provide a detailed assessment.

<resume>
${resumeText}
</resume>

<job_description>
${jobDescription}
</job_description>

Respond ONLY with a valid JSON object (no markdown, no extra text) in exactly this format:
{
  "matchScore": <integer 0-100 representing how well the resume matches the job description>,
  "jobTitle": "<inferred job title from the job description, or 'Not specified'>",
  "company": "<company name from the job description, or 'Not specified'>",
  "missingKeywords": [
    "<keyword or skill 1>",
    "<keyword or skill 2>",
    ...
  ],
  "improvementTips": [
    "<specific, actionable tip 1>",
    "<specific, actionable tip 2>",
    "<specific, actionable tip 3>",
    ...
  ],
  "strengths": [
    "<strength 1 found in resume that matches the job>",
    "<strength 2>",
    ...
  ]
}

Rules:
- matchScore should reflect actual keyword overlap, experience matching, and skills alignment
- missingKeywords should list important keywords/skills from the job description absent in the resume (max 15)
- improvementTips should be specific and actionable (5-8 tips), referencing concrete things to add or change
- strengths should note what the candidate already does well (3-5 items)
- All arrays must have at least 1 item`;

  const message = await client.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 1500,
    messages: [{ role: 'user', content: prompt }],
  });

  const raw = message.content[0].text.trim();

  // Strip any accidental markdown code blocks
  const cleaned = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();

  const result = JSON.parse(cleaned);
  return result;
}

module.exports = { analyzeResume };

import OpenAI from 'openai';

// Initialize OpenAI Client
// DANGER: In production, call this from a backend server/Edge Function to protect your key.
// For local dev, use VITE_OPENAI_API_KEY in your .env file.
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY, 
  dangerouslyAllowBrowser: true // Only for prototyping/dev
});

export interface CoverLetterParams {
  companyName: string;
  jobTitle: string;
  jobDescription: string;
  userName?: string;
}

export interface CoverLetterResult {
  coverLetter: string;
}

export interface AnswerGradeParams {
  question: string;
  expectedAnswer: string;
  userAnswer: string;
}

export interface AnswerGradeResult {
  score: number;
  maxScore: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
}

/**
 * Generate a Cover Letter using OpenAI GPT-4o
 */
export async function generateCoverLetter(params: CoverLetterParams): Promise<CoverLetterResult> {
  const { companyName, jobTitle, jobDescription, userName = 'Candidate' } = params;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // or "gpt-3.5-turbo" for lower cost
      messages: [
        {
          role: "system",
          content: "You are a professional career coach. Write a tailored, persuasive cover letter based on the provided job description. Keep it concise, professional, and highlight relevant skills matching the job. Do not include placeholders like [Your Name] - use the provided user name."
        },
        {
          role: "user",
          content: `
            Candidate Name: ${userName}
            Target Company: ${companyName}
            Target Role: ${jobTitle}
            Job Description: ${jobDescription}
            
            Write the cover letter now.
          `
        }
      ],
      temperature: 0.7,
    });

    return {
      coverLetter: response.choices[0].message.content || "Failed to generate cover letter."
    };
  } catch (error) {
    console.error("AI Generation Error:", error);
    throw new Error("Failed to generate cover letter. Please check your API key.");
  }
}

/**
 * Grade an Interview Answer using OpenAI GPT-4o
 */
export async function gradeAnswer(params: AnswerGradeParams): Promise<AnswerGradeResult> {
  const { question, expectedAnswer, userAnswer } = params;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert technical interviewer. Evaluate the candidate's answer based on the expected answer. 
          Return a JSON object with the following structure:
          {
            "score": number (0-10),
            "feedback": "string (1-2 sentences summary)",
            "strengths": ["string", "string"],
            "improvements": ["string", "string"]
          }
          Do not return markdown formatting, just the raw JSON.`
        },
        {
          role: "user",
          content: `
            Question: ${question}
            Expected Answer Context: ${expectedAnswer}
            Candidate's Answer: ${userAnswer}
          `
        }
      ],
      response_format: { type: "json_object" }, // Ensures valid JSON output
      temperature: 0.3, // Lower temperature for more consistent grading
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error("No content received");

    const result = JSON.parse(content);

    return {
      score: result.score,
      maxScore: 10,
      feedback: result.feedback,
      strengths: result.strengths || [],
      improvements: result.improvements || []
    };

  } catch (error) {
    console.error("AI Grading Error:", error);
    // Fallback if AI fails
    return {
      score: 0,
      maxScore: 10,
      feedback: "AI service unavailable. Please try again later.",
      strengths: [],
      improvements: []
    };
  }
}
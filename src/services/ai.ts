// AI Service Mock Functions
// This file contains mock AI functions that can be easily swapped with real OpenAI API calls later

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
 * Generate a cover letter based on job details
 * Mock implementation with 2-second delay
 */
export async function generateCoverLetter(params: CoverLetterParams): Promise<CoverLetterResult> {
  const { companyName, jobTitle, jobDescription, userName = 'Your Name' } = params;

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Extract key points from job description (mock analysis)
  const hasRemote = jobDescription.toLowerCase().includes('remote');
  const hasTech = jobDescription.toLowerCase().includes('technology') || 
                  jobDescription.toLowerCase().includes('software');
  
  const coverLetter = `Dear Hiring Manager at ${companyName},

I am writing to express my strong interest in the ${jobTitle} position at ${companyName}. After reviewing the job description, I am excited about the opportunity to contribute to your team.

${hasTech ? 'With my extensive experience in software development and modern technologies, I am confident in my ability to make meaningful contributions to your engineering initiatives.' : 'My professional background has equipped me with the skills and experience that align well with this role.'}

${hasRemote ? 'I appreciate that this position offers remote work flexibility, which I have found enables me to be highly productive while maintaining excellent collaboration with team members.' : ''}

Key qualifications I bring to this role include:
• Strong problem-solving abilities and analytical thinking
• Excellent communication and collaboration skills
• A proven track record of delivering high-quality results
• Passion for continuous learning and professional growth

I am particularly drawn to ${companyName}'s mission and values, and I believe my skills and enthusiasm would make me a valuable addition to your team.

I would welcome the opportunity to discuss how my experience and qualifications align with your needs. Thank you for considering my application.

Best regards,
${userName}`;

  return { coverLetter };
}

/**
 * Grade a user's answer to an interview question
 * Mock implementation with 2-second delay
 */
export async function gradeAnswer(params: AnswerGradeParams): Promise<AnswerGradeResult> {
  const { question, expectedAnswer, userAnswer } = params;

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Simple mock analysis
  const userAnswerLower = userAnswer.toLowerCase();
  const expectedLower = expectedAnswer.toLowerCase();
  
  // Check for key concepts (very simple mock)
  const keywordsFromExpected = expectedLower
    .split(/\s+/)
    .filter(word => word.length > 4)
    .slice(0, 10);
  
  const matchedKeywords = keywordsFromExpected.filter(keyword => 
    userAnswerLower.includes(keyword)
  );
  
  const matchRatio = keywordsFromExpected.length > 0 
    ? matchedKeywords.length / keywordsFromExpected.length 
    : 0.5;
  
  // Calculate score based on length and keyword matches
  const lengthScore = Math.min(userAnswer.length / 200, 1) * 3;
  const keywordScore = matchRatio * 5;
  const structureScore = userAnswer.includes('\n') || userAnswer.length > 150 ? 2 : 1;
  
  const rawScore = lengthScore + keywordScore + structureScore;
  const score = Math.min(Math.round(rawScore), 10);

  // Generate feedback based on score
  const strengths: string[] = [];
  const improvements: string[] = [];
  let feedback = '';

  if (score >= 8) {
    feedback = 'Excellent answer! You demonstrated strong understanding of the concept.';
    strengths.push('Comprehensive explanation');
    strengths.push('Good use of relevant terminology');
    if (userAnswer.length > 200) {
      strengths.push('Well-structured response');
    }
    improvements.push('Consider adding a real-world example');
  } else if (score >= 6) {
    feedback = 'Good effort! Your answer covers the basics but could be more detailed.';
    strengths.push('Covers main concepts');
    if (matchedKeywords.length > 2) {
      strengths.push('Uses appropriate technical terms');
    }
    improvements.push('Add more specific details');
    improvements.push('Explain the "why" behind your answer');
  } else if (score >= 4) {
    feedback = 'Partial understanding shown. Review the concept and try to be more specific.';
    if (userAnswer.length > 50) {
      strengths.push('Made an attempt to explain');
    }
    improvements.push('Include key technical details');
    improvements.push('Structure your answer more clearly');
    improvements.push('Consider mentioning edge cases');
  } else {
    feedback = 'This answer needs significant improvement. Review the study material for this topic.';
    improvements.push('Study the core concept more thoroughly');
    improvements.push('Practice explaining in your own words');
    improvements.push('Include relevant technical terminology');
  }

  // Add question-specific feedback
  if (question.toLowerCase().includes('time complexity') && !userAnswer.toLowerCase().includes('o(')) {
    improvements.push('Mention time complexity using Big O notation');
  }
  
  if (question.toLowerCase().includes('explain') && userAnswer.length < 100) {
    improvements.push('Provide a more detailed explanation');
  }

  return {
    score,
    maxScore: 10,
    feedback,
    strengths,
    improvements
  };
}

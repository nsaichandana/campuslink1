import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI_API_KEY } from '../config';

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

/**
 * Moderate content using Gemini AI
 * Returns: { safe: boolean, reason: string }
 */
export async function moderateContent(text, type = 'general') {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `You are a content moderation system for a college campus app. 
    Analyze this ${type} content for:
    - Profanity or abusive language
    - Hate speech or discrimination
    - Sexual or inappropriate content
    - Personal attacks or bullying
    - Spam or promotional content
    - Requests for illegal activities
    
    Content: "${text}"
    
    Respond with JSON only:
    {
      "safe": true/false,
      "reason": "brief reason if unsafe, empty if safe",
      "severity": "low/medium/high" (if unsafe)
    }`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();
    
    // Parse JSON response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    // Fallback to safe if parsing fails
    return { safe: true, reason: '', severity: 'low' };
  } catch (error) {
    console.error('Moderation error:', error);
    // Fail open for better UX, but log the error
    return { safe: true, reason: 'Moderation check failed', severity: 'low' };
  }
}

/**
 * Categorize and prioritize campus issues using Gemini AI
 * Returns: { category: string, priority: string, tags: string[] }
 */
export async function categorizeIssue(description) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `You are an AI assistant for a college campus issue reporting system.
    Analyze this issue and categorize it:
    
    Issue: "${description}"
    
    Categories: Safety, Hygiene, Infrastructure, Canteen
    Priority: Low (minor inconvenience), Medium (affects daily life), High (urgent/safety concern)
    
    Respond with JSON only:
    {
      "category": "one of the 4 categories",
      "priority": "Low/Medium/High",
      "tags": ["relevant", "keywords"],
      "summary": "one sentence summary"
    }`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();
    
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    // Fallback
    return {
      category: 'Infrastructure',
      priority: 'Medium',
      tags: ['general'],
      summary: description.substring(0, 100)
    };
  } catch (error) {
    console.error('Categorization error:', error);
    return {
      category: 'Infrastructure',
      priority: 'Medium',
      tags: ['uncategorized'],
      summary: description.substring(0, 100)
    };
  }
}

/**
 * Find mentor matches based on skills using Gemini AI
 * Returns: { score: number, reason: string }
 */
export async function calculateMentorMatch(mentorSkills, learnerNeeds, mentorBio, learnerBio) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `You are a mentor matching system for college students.
    
    Mentor has these skills: ${mentorSkills.join(', ')}
    Mentor bio: "${mentorBio}"
    
    Student wants to learn: ${learnerNeeds.join(', ')}
    Student bio: "${learnerBio}"
    
    Calculate match score (0-100) and explain why they're a good match.
    Consider skill overlap, learning style compatibility, and shared interests.
    
    Respond with JSON only:
    {
      "score": 0-100,
      "reason": "2-3 sentence explanation of why this is a good match",
      "matchedSkills": ["skills that overlap"]
    }`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();
    
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    // Fallback - simple keyword matching
    const overlap = mentorSkills.filter(skill => 
      learnerNeeds.some(need => 
        skill.toLowerCase().includes(need.toLowerCase()) ||
        need.toLowerCase().includes(skill.toLowerCase())
      )
    );
    
    return {
      score: overlap.length > 0 ? 60 : 30,
      reason: overlap.length > 0 
        ? `This mentor can help with: ${overlap.join(', ')}`
        : 'This mentor has relevant experience in your field of interest',
      matchedSkills: overlap
    };
  } catch (error) {
    console.error('Matching error:', error);
    return {
      score: 50,
      reason: 'Potential good match based on shared interests',
      matchedSkills: []
    };
  }
}

/**
 * Generate natural language search for mentors
 */
export async function parseSearchQuery(query) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `Extract skills and interests from this search query: "${query}"
    
    Respond with JSON only:
    {
      "skills": ["extracted", "skills"],
      "keywords": ["other", "relevant", "terms"]
    }`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();
    
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    // Fallback - split by common delimiters
    const words = query.toLowerCase().split(/[,\s]+/).filter(w => w.length > 2);
    return {
      skills: words,
      keywords: words
    };
  } catch (error) {
    console.error('Search parsing error:', error);
    const words = query.toLowerCase().split(/[,\s]+/).filter(w => w.length > 2);
    return {
      skills: words,
      keywords: words
    };
  }
}

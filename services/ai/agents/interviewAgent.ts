export class InterviewAgent {
  async generateQuestions(roleTitle: string, count: number = 5): Promise<string[]> {
    const questions = [
      `Describe how you design accessible web components for users who rely on screen readers or keyboard navigation.`,
      `Explain a technical challenge you encountered in a recent project and how you solved it.`,
      `How do you collaborate in a remote or hybrid team environment with asynchronous communication tools?`,
      `What strategies do you use to ensure code quality, type safety, and WCAG compliance?`,
      `Describe a time when you advocated for accessibility or inclusive design within your engineering team.`
    ];
    return questions.slice(0, count);
  }

  async evaluateAnswer(questionText: string, candidateAnswer: string): Promise<{ score: number; feedback: string; STARBreakdown: { situation: boolean; task: boolean; action: boolean; result: boolean } }> {
    const text = candidateAnswer.trim();
    const wordCount = text.split(/\s+/).length;

    let score = 75;
    const hasAction = /i (built|created|implemented|wrote|designed|led|solved|fixed)/i.test(text);
    const hasResult = /(result|outcome|improved|increased|reduced|achieved|percent|%)/i.test(text);
    const hasSituation = /(when|during|at|while|project|team|company)/i.test(text);
    const hasTask = /(needed|tasked|required|goal|objective|responsible)/i.test(text);

    if (hasAction) score += 10;
    if (hasResult) score += 10;
    if (wordCount < 10) score = Math.max(30, score - 30);

    const feedback = wordCount < 15
      ? "Your answer is concise. To strengthen it, elaborate on the specific steps (Actions) you took and the measurable outcomes (Results)."
      : "Excellent articulation of your technical skills! Your response effectively demonstrates your problem-solving process without penalizing speech style or delivery speed.";

    return {
      score: Math.min(100, score),
      feedback,
      STARBreakdown: {
        situation: hasSituation,
        task: hasTask,
        action: hasAction,
        result: hasResult
      }
    };
  }
}

export const interviewAgent = new InterviewAgent();

import { getApiBaseUrl } from '@/lib/api-base-url/get-api-base-url';

export interface ClassProgressSummary {
  class: {
    id: string;
    name: string;
    classCode: string;
  };
  totalStudents: number;
  totalAssignments: number;
  students: Array<{
    studentId: string;
    email: string;
    profile: {
      firstName: string | null;
      lastName: string | null;
      phoneNumber: string | null;
    } | null;
    assignments: Array<{
      assignmentId: string;
      title: string;
      totalQuestions: number;
      latestCorrectCount: number | null;
      bestCorrectCount: number | null;
      latestStatus: string;
      submittedAttemptCount: number;
    }>;
    summary: {
      totalAssignments: number;
      submittedAssignments: number;
      averageScore: number | null;
      highestScore: number | null;
    };
  }>;
}

export interface StudentAssignmentDetail {
  class: {
    id: string;
    name: string;
    classCode: string;
  };
  student: {
    studentId: string;
    email: string;
    profile: {
      firstName: string | null;
      lastName: string | null;
      phoneNumber: string | null;
    } | null;
  };
  assignment: {
    assignmentId: string;
    title: string;
    description: string | null;
    dueDate: string | null;
    isSingleAttempt: boolean;
    canViewResult: boolean;
  };
  attempts: Array<{
    attemptId: string;
    status: string;
    startedAt: string;
    submittedAt: string | null;
    draftAnswer: unknown;
    answerCount: number;
    result: {
      id: string;
      score: number;
      correctCount: number;
      totalCount: number;
      questionAnswers: unknown;
      createdAt: string;
    } | null;
    answers: Array<{
      id: string;
      questionId: string;
      selectedChoiceId: string;
      question: {
        id: string;
        questionContent: string;
        correctChoiceId: string | null;
        task: {
          id: string;
          taskContent: string;
          taskType: string;
        };
        choices: Array<{
          id: string;
          choiceContent: string;
        }>;
      };
      selectedChoice: {
        id: string;
        choiceContent: string;
      };
    }>;
  }>;
}

/**
 * Fetch class progress summary for all students for a specific assignment
 */
export async function getClassProgressOnAssignments(
  token: string,
  classId: string,
  assignmentId: string
): Promise<ClassProgressSummary> {
  const response = await fetch(
    `${getApiBaseUrl()}/teachers/classes/${encodeURIComponent(classId)}/assignments/${encodeURIComponent(assignmentId)}/progress-on-assignments`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch class progress: ${response.statusText}`);
  }

  const data = await response.json();
  if (data.success) {
    return data.data;
  }

  throw new Error(data.message || 'Failed to fetch class progress');
}

/**
 * Fetch detailed results for a specific student's assignment attempt(s)
 */
export async function getStudentAssignmentProgressDetail(
  token: string,
  assignmentId: string,
  studentId: string
): Promise<StudentAssignmentDetail> {
  const response = await fetch(
    `${getApiBaseUrl()}/teachers/assignments/${encodeURIComponent(assignmentId)}/students/${encodeURIComponent(studentId)}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch student assignment detail: ${response.statusText}`
    );
  }

  const data = await response.json();
  if (data.success) {
    return data.data;
  }

  throw new Error(data.message || 'Failed to fetch student assignment detail');
}

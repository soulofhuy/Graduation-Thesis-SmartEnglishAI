export interface InstructionStep {
  stepNumber: number;
  title: string;
  description?: string;
}

type Lang = 'en' | 'vi';

const STEPS_VI: InstructionStep[] = [
  {
    stepNumber: 1,
    title: 'Đăng nhập vào hệ thống với phân quyền "Giáo viên"'
  },
  {
    stepNumber: 2,
    title: 'Nhấn vào tab "Quản lí câu hỏi" trên thanh điều hướng'
  },
  {
    stepNumber: 3,
    title: 'Nhấn vào nút "Tạo bài tập"'
  },
  {
    stepNumber: 4,
    title: 'Nhấn vào tùy chọn "Tạo bài tập bằng AI"'
  },
  {
    stepNumber: 5,
    title: 'Điền thông tin cần thiết cho bài tập cần tạo'
  },
  {
    stepNumber: 6,
    title: 'Bắt đầu nhập prompt và chờ phản hồi'
  },
  {
    stepNumber: 7,
    title: 'Xem lại các câu hỏi đã được tạo và chỉnh sửa nếu cần thiết'
  },
  {
    stepNumber: 8,
    title: 'Lưu bài tập của bạn'
  }
];

const STEPS_EN: InstructionStep[] = [
  {
    stepNumber: 1,
    title: 'Sign in as "Teacher"'
  },
  {
    stepNumber: 2,
    title: 'Go to "Assignment management" tab in the navbar'
  },
  {
    stepNumber: 3,
    title: 'Click button "Create assignment"'
  },
  {
    stepNumber: 4,
    title: 'Click option "Create assignment with AI"'
  },
  {
    stepNumber: 5,
    title: 'Fill in the necessary assignment information'
  },
  {
    stepNumber: 6,
    title: 'Enter prompt and wait for generated questions'
  },
  {
    stepNumber: 7,
    title: 'Review the generated questions and make necessary edits'
  },
  {
    stepNumber: 8,
    title: 'Save your assignment'
  }
];

export function getInstructionSteps(lang: Lang = 'vi'): InstructionStep[] {
  return lang === 'en' ? STEPS_EN : STEPS_VI;
}

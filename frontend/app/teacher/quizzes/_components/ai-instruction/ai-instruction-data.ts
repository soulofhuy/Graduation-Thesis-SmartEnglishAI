export interface InstructionStep {
  stepNumber: number;
  title: string;
  imageUrl?: string;
}

type Lang = 'en' | 'vi';

const STEPS_VI: InstructionStep[] = [
  {
    stepNumber: 1,
    title: 'Đăng nhập vào hệ thống với phân quyền "Giáo viên"',
    imageUrl: '/ai-instruction/vi/step-1.png'
  },
  {
    stepNumber: 2,
    title: 'Nhấn vào tab "Quản lí câu hỏi" trên thanh điều hướng',
    imageUrl: '/ai-instruction/vi/step-2.png'
  },
  {
    stepNumber: 3,
    title: 'Nhấn vào nút "Tạo bài tập"',
    imageUrl: '/ai-instruction/vi/step-3.png'
  },
  {
    stepNumber: 4,
    title: 'Nhấn vào tùy chọn "Tạo với AI"',
    imageUrl: '/ai-instruction/vi/step-4.png'
  },
  {
    stepNumber: 5,
    title: 'Điền thông tin cần thiết cho bài tập cần tạo',
    imageUrl: '/ai-instruction/vi/step-5.png'
  },
  {
    stepNumber: 6,
    title: 'Bắt đầu nhập prompt và chờ phản hồi',
    imageUrl: '/ai-instruction/vi/step-6.png'
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
    title: 'Sign in as "Teacher"',
    imageUrl: '/ai-instruction/en/step-1.png'
  },
  {
    stepNumber: 2,
    title: 'Go to "Assignment management" tab in the navbar',
    imageUrl: '/ai-instruction/en/step-2.png'
  },
  {
    stepNumber: 3,
    title: 'Click button "Create assignment"',
    imageUrl: '/ai-instruction/en/step-3.png'
  },
  {
    stepNumber: 4,
    title: 'Click option "Create with AI"',
    imageUrl: '/ai-instruction/en/step-4.png'
  },
  {
    stepNumber: 5,
    title: 'Fill in the necessary assignment information',
    imageUrl: '/ai-instruction/en/step-5.png'
  },
  {
    stepNumber: 6,
    title: 'Enter prompt and wait for generated questions',
    imageUrl: '/ai-instruction/en/step-6.png'
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

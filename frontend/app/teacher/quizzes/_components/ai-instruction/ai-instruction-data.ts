export interface InstructionStep {
  stepNumber: number;
  title: string;
  description: string;
}

export const AI_INSTRUCTION_STEPS: InstructionStep[] = [
  {
    stepNumber: 1,
    title: 'Đăng nhập vào role Teacher',
    description:
      'Đăng nhập vào hệ thống bằng tài khoản Teacher trước khi thao tác.'
  },
  {
    stepNumber: 2,
    title: 'Chuyển vào tab quản lý câu hỏi',
    description:
      'Mở tab quản lý câu hỏi bên navbar để vào đúng khu vực tạo bài tập.'
  },
  {
    stepNumber: 3,
    title: 'Nhấn vào nút "Tạo BT bằng AI"',
    description: 'Tìm và nhấn vào nút "Tạo BT bằng AI" trên trang quản lý.'
  },
  {
    stepNumber: 4,
    title: 'Kéo xuống dưới cùng và chọn "Bắt đầu"',
    description:
      'Lướt xuống cuối trang, tìm button có nội dung "Bắt đầu" rồi nhấn vào đó.'
  },
  {
    stepNumber: 5,
    title: 'Điền thông tin bài tập cần thiết',
    description:
      'Nhập đầy đủ thông tin bài tập như tiêu đề, mô tả và các trường bắt buộc khác.'
  },
  {
    stepNumber: 6,
    title: 'Bắt đầu nhập prompt và xem câu hỏi',
    description:
      'Nhập prompt để AI sinh câu hỏi, sau đó xem và tinh chỉnh kết quả nếu cần.'
  }
];

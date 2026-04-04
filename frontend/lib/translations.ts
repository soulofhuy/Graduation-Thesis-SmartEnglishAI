export type Language = 'en' | 'vi';

export const translations = {
  en: {
    // Navigation
    nav: {
      login: 'Login',
      signUp: 'Sign Up'
    },

    // Landing Page
    landing: {
      hero: {
        title: 'Learn English the fun way with AI',
        subtitle:
          'Familiarize yourself with multiple-choice question formats, reinforce your knowledge, and improve your learning performance.',
        cta: 'Start Learning',
        learn: 'See how it works'
      },

      features: {
        title: 'What makes it different?',
        description:
          'Everything you need to learn English better, in one place',

        feature1: {
          title: 'Create quizzes in seconds',
          desc: 'Generate high-quality English exercises instantly with AI. No more time spent preparing questions.'
        },
        feature2: {
          title: 'Learn anytime, anywhere',
          desc: 'Practice on any device, whenever you want. Learning fits your schedule.'
        },
        feature3: {
          title: 'Track your progress',
          desc: 'See how you improve over time and get simple suggestions to help you do better.'
        }
      },

      ai: {
        title:
          'Manage assignments and tests more conveniently with the help of AI',
        description:
          'Helps teachers create tests quickly; with just a few simple prompt commands and a document file, a complete test can be created, saving a lot of time.',
        features: [
          'Create tests in seconds',
          'Adjust difficulty automatically',
          'Instant feedback by AI'
        ]
      },

      student_benefits: {
        title: 'Learning becomes more fun and effective with Langoer',
        description:
          'With a friendly and "Gen Z-oriented" interface, learning English is no longer boring. Middle school students will feel more interested and motivated to learn than before.',
        features: [
          'Friendly and easy-to-use interface',
          'Effectively track learning progress and results'
        ]
      },

      statistic: {
        title: 'Supporting teachers in statistical analysis of results',
        description:
          'With the help of AI, teachers can easily analyze student test results based on dashboards and statistics from live data, making management more convenient.',
        features: ['Detailed statistics', 'Progress charts']
      },

      outro: {
        title: 'Ready to start learning?',
        description:
          'Join thousands of students improving their English skills with Langoer today.',
        button: ['Log in now', 'Learn more']
      },

      footer: {
        copyright: '© 2026 Langoer. All rights reserved.',
        product: 'Product',
        company: 'Company',
        legal: 'Legal',
        features: 'Features',
        pricing: 'Pricing',
        security: 'Security',
        about: 'About Us',
        blog: 'Blog',
        contact: 'Contact',
        terms: 'Terms',
        policy: 'Policy',
        cookies: 'Cookies'
      }
    },

    // Login Page
    login: {
      title: 'Hey, welcome back!',
      subTitle: 'We are very happy to see you back!',
      email: 'Email',
      password: 'Password',
      loginButton: 'Sign In',
      or: 'Or continue with',
      description: "Don't have an account? ",
      signUp: 'Sign Up'
    },

    // Signup Page
    signup: {
      title: 'Create your account',
      subTitle: 'Join Langoer and start learning today!',
      roleLabel: 'Role',
      rolePlaceholder: 'Choose your role',
      roleTeacher: 'Teacher',
      roleStudent: 'Student',
      roleTitle: 'Who are you?',
      roleHint: 'Choose your role to personalize your experience.',
      roleTeacherCard: 'Teacher',
      roleStudentCard: 'Student',
      roleBack: 'Change role',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm password',
      signUpButton: 'Sign Up',
      or: 'Or continue with',
      description: 'Already have an account? ',
      signIn: 'Sign In'
    },

    // Teacher Dashboard
    teacher: {
      classes: {
        title: 'Manage classes',
        description: 'Create and manage your classes',
        tableViewport: {
          title: 'List of classes',
          columnName: 'Class name',
          columnDescription: 'Description',
          columnStudentNumber: 'Number of students',
          columnAssignmentNumber: 'Number of assignments',
          columnClassCode: 'Class code',
          columnActions: 'Operations'
        },
        gridViewport: {
          fieldStudentNumber: 'No. students',
          fieldAssignmentNumber: 'No. assignments',
          fieldClassCode: 'Class code'
        },
        addClass: {
          title: 'Create a new class',
          description: 'Enter class information to create a new class',
          fieldName: 'Class name',
          fieldNamePlaceholder: 'e.g., Class 9CB1',
          fieldDescription: 'Class description',
          fieldDescriptionPlaceholder: 'e.g., A class for 9CB students',
          fieldNeedsTeacherApproval: 'Needs your approval to join?'
        },
        editClass: {
          title: 'Edit Class',
          description: 'Update Class Information',
          fieldName: 'Class Name',
          fieldNamePlaceholder: 'Example: Class 9CB1',
          fieldDescription: 'Class Description',
          fieldDescriptionPlaceholder: 'Example: Class for 9CB students',
          fieldNeedsTeacherApproval: 'Needs your approval to join?',
          fieldClassCode: 'Class Code'
        },
        deleteClass: {
          title: 'Delete class',
          description: 'Are you sure you want to delete this class?',
          classInformation: {
            title: 'Class Information',
            fieldClassName: 'Class Name',
            fieldClassDescription: 'Class Description',
            fieldStudentNumber: 'Number of Students',
            fieldAssignmentNumber: 'Number of Assignments',
            fieldClassCode: 'Class Code'
          }
        }
      },
      trashBin: {
        title: 'Trash Bin',
        description:
          'Manage deleted items. You can restore or permanently delete them',
        filter: {
          class: 'Class',
          assignment: 'Assignment',
          question: 'Question'
        },
        table: {
          title: 'List of deleted items',
          description: 'items in trash bin',
          columnName: 'Name',
          columnType: 'Type',
          columnDescription: 'Description',
          columnDeletedAt: 'Deleted Date',
          columnActions: 'Actions'
        },
        note: {
          title: 'Note',
          description:
            'Items in the trash bin can be permanently deleted. Once permanently deleted, they cannot be restored.'
        }
      }
    },

    // Student Dashboard
    student: {
      overview: 'Overview',
      subtitle: 'Welcome back!',
      completed: 'Completed',
      pending: 'Pending',
      avgScore: 'Avg Score',
      streak: 'Streak',
      scoreTrend: 'Score Trends',
      lastWeek: 'Last 7 days performance',
      pendingAssignments: 'Pending Assignments',
      myClasses: 'My Classes',
      joinClass: 'Join Class',
      takeQuiz: 'Start Quiz',
      history: 'History',
      progress: 'Progress',
      settings: {
        title: 'Account Settings',
        description: 'Manage your personal information and preferences',
        tabs: {
          settingsTab: {
            mainTitle: 'System Settings',
            subTitle: 'Interface Options',
            description: 'Adjust language and light/dark mode',
            option: [
              {
                title: 'Interface',
                description: 'Switch light/dark'
              },
              {
                title: 'Language',
                description: 'Select display language'
              }
            ]
          },
          profileTab: {
            mainTitle: 'Profile',
            subTitle: 'Personal Information',
            description: 'View and update your profile',
            fields: {
              firstName: 'First Name',
              lastName: 'Last Name',
              address: 'Address',
              phoneNumber: 'Phone Number',
              dateOfBirth: 'Date of Birth',
              createdAt: 'Created At',
              updatedAt: 'Last Updated'
            }
          },
          passwordTab: {
            mainTitle: 'Password',
            subTitle: 'Change password',
            description: 'Update password to protect your account',
            fields: {
              currentPassword: 'Current Password',
              newPassword: 'New Password',
              confirmPassword: 'Confirm Password'
            }
          }
        }
      }
    },

    // Common
    common: {
      loading: 'Loading...',
      save: 'Save',
      isSaving: 'Saving...',
      cancel: 'Cancel',
      delete: 'Delete',
      isDeleting: 'Deleting...',
      restore: 'Restore',
      edit: 'Edit',
      cancelEditting: 'Cancel editing',
      add: 'Add',
      search: 'Search',
      noData: 'No data available',
      error: 'Something went wrong',
      success: 'Success',
      viewPort: 'Choose your viewport'
    }
  },

  vi: {
    // Navigation
    nav: {
      login: 'Đăng nhập',
      signUp: 'Đăng ký'
    },

    // Landing Page
    landing: {
      hero: {
        title: 'Học tiếng Anh thú vị hơn cùng AI',
        subtitle:
          'Làm quen với các dạng bài tập trắc nghiệm, củng cố kiến thức và nâng cao hiệu suất học tập.',
        cta: 'Bắt đầu học',
        learn: 'Xem cách hoạt động'
      },

      features: {
        title: 'Điểm nổi bật',
        description:
          'Mọi thứ bạn cần để học tiếng Anh hiệu quả, trong một nền tảng',

        feature1: {
          title: 'Tạo bài tập trong vài giây',
          desc: 'Sử dụng AI để tạo nhanh các bài tập chất lượng, không cần mất thời gian soạn đề.'
        },
        feature2: {
          title: 'Học mọi lúc, mọi nơi',
          desc: 'Luyện tập trên mọi thiết bị, bất cứ khi nào bạn muốn.'
        },
        feature3: {
          title: 'Theo dõi tiến bộ',
          desc: 'Xem sự cải thiện của bạn và nhận gợi ý để học tốt hơn.'
        }
      },

      ai: {
        title:
          'Quản lí bài tập và bài kiểm tra tiện lợi hơn với sự trợ giúp của AI',
        description:
          'Giúp giáo viên tạo đề nhanh chóng, chỉ với vài câu lệnh prompt đơn giản và một file tài liệu, có thể tạo được một đề thi đầy đủ và tiết kiệm rất nhiều thời gian.',
        features: [
          'Tạo đề thi trong vài giây',
          'Có thể điều chỉnh độ khó tự động',
          'Phản hồi ngay lập tức bởi AI'
        ]
      },

      student_benefits: {
        title: 'Học tập trở nên vui vẻ hơn, hiệu quả hơn với Langoer',
        description:
          'Với giao diện thân thiện và "đậm chất Gen Z", học tiếng Anh không còn là việc chán nữa. Các bạn học sinh THCS sẽ cảm thấy hứng thú và động lực học tập hơn so với trước.',
        features: [
          'Giao diện thân thiện, dễ sử dụng',
          'Theo dõi tiến độ và kết quả học tập hiệu quả'
        ]
      },

      statistic: {
        title: 'Hỗ trợ giáo viên trong thống kê kết quả',
        description:
          'Với sự trợ giúp của AI, giáo viên có thể dễ dàng phân tích kết quả bài làm của học sinh, dựa trên các dashboard và thống kê từ dữ liệu trực tiếp, giúp công việc quản lí trở nên thuận tiện hơn.',
        features: ['Thống kê chi tiết', 'Biểu đồ tiến bộ']
      },

      outro: {
        title: 'Sẵn sàng bắt đầu học tập?',
        description:
          'Tham gia hàng nghìn học sinh đang nâng cao kỹ năng tiếng Anh của mình với Langoer ngay hôm nay.',
        button: ['Đăng nhập ngay', 'Tìm hiểu thêm']
      },

      footer: {
        copyright: '© 2026 Langoer. Bảo lưu mọi quyền.',
        product: 'Sản phẩm',
        company: 'Công ty',
        legal: 'Pháp lý',
        features: 'Tính năng',
        pricing: 'Giá',
        security: 'Bảo mật',
        about: 'Về chúng tôi',
        blog: 'Blog',
        contact: 'Liên hệ',
        terms: 'Điều khoản',
        policy: 'Chính sách',
        cookies: 'Cookies'
      }
    },

    // Login Page
    login: {
      title: 'Chào mừng bạn quay lại!',
      subTitle: 'Chúng tôi rất vui khi gặp lại bạn!',
      email: 'Email',
      password: 'Mật khẩu',
      loginButton: 'Đăng nhập',
      or: 'Hoặc tiếp tục với',
      description: 'Bạn chưa có tài khoản? ',
      signUp: 'Đăng ký'
    },

    // Signup Page
    signup: {
      title: 'Tạo tài khoản mới',
      subTitle: 'Tham gia Langoer và bắt đầu học ngay hôm nay!',
      roleLabel: 'Vai trò',
      rolePlaceholder: 'Chọn vai trò',
      roleTeacher: 'Giáo viên',
      roleStudent: 'Học sinh',
      roleTitle: 'Bạn là ai?',
      roleHint: 'Chọn vai trò để cá nhân hóa trải nghiệm.',
      roleTeacherCard: 'Giáo viên',
      roleStudentCard: 'Học sinh',
      roleBack: 'Đổi vai trò',
      email: 'Email',
      password: 'Mật khẩu',
      confirmPassword: 'Xác nhận mật khẩu',
      signUpButton: 'Đăng ký',
      or: 'Hoặc tiếp tục với',
      description: 'Bạn đã có tài khoản? ',
      signIn: 'Đăng nhập'
    },

    // Teacher Dashboard
    teacher: {
      classes: {
        title: 'Quản lí lớp học',
        description: 'Tạo và quản lí các lớp học của bạn',
        tableViewport: {
          title: 'Danh sách các lớp học',
          columnName: 'Tên lớp',
          columnDescription: 'Mô tả',
          columnStudentNumber: 'Số lượng học sinh',
          columnAssignmentNumber: 'Số lượng bài tập',
          columnClassCode: 'Mã lớp',
          columnActions: 'Các thao tác'
        },
        gridViewport: {
          fieldStudentNumber: 'Số học sinh',
          fieldAssignmentNumber: 'Số bài tập',
          fieldClassCode: 'Mã lớp'
        },
        addClass: {
          title: 'Tạo lớp học mới',
          description: 'Nhập thông tin lớp học để tạo lớp mới',
          fieldName: 'Tên lớp học',
          fieldNamePlaceholder: 'Ví dụ: Lớp 9CB1',
          fieldDescription: 'Mô tả lớp học',
          fieldDescriptionPlaceholder:
            'Ví dụ: Lớp học dành cho học sinh lớp 9CB',
          fieldNeedsTeacherApproval: 'Cần sự phê duyệt của bạn để tham gia?'
        },
        editClass: {
          title: 'Chỉnh sửa lớp học',
          description: 'Cập nhật thông tin lớp học',
          fieldName: 'Tên lớp học',
          fieldNamePlaceholder: 'Ví dụ: Lớp 9CB1',
          fieldDescription: 'Mô tả lớp học',
          fieldDescriptionPlaceholder:
            'Ví dụ: Lớp học dành cho học sinh lớp 9CB',
          fieldNeedsTeacherApproval: 'Cần sự phê duyệt của bạn để tham gia?',
          fieldClassCode: 'Mã lớp học'
        },
        deleteClass: {
          title: 'Xóa lớp học',
          description: 'Bạn có chắc muốn xóa lớp học này không?',
          classInformation: {
            title: 'Thông tin lớp học',
            fieldClassName: 'Tên lớp học',
            fieldClassDescription: 'Mô tả lớp học',
            fieldStudentNumber: 'Số lượng học sinh',
            fieldAssignmentNumber: 'Số lượng bài tập',
            fieldClassCode: 'Mã lớp học'
          }
        }
      },
      trashBin: {
        title: 'Thùng rác',
        description:
          'Quản lí các mục đã xóa. Bạn có thể khôi phục hoặc xóa vĩnh viễn',
        filter: {
          class: 'Lớp học',
          assignment: 'Bài tập',
          question: 'Câu hỏi'
        },
        table: {
          title: 'Danh sách mục đã xóa',
          description: ' mục trong thùng rác',
          columnName: 'Tên',
          columnType: 'Loại',
          columnDescription: 'Mô tả',
          columnDeletedAt: 'Ngày xóa',
          columnActions: 'Các thao tác'
        },
        note: {
          title: 'Lưu ý',
          description:
            'Các mục trong thùng rác có thể bị xóa vĩnh viễn. Một khi xóa vĩnh viễn, bạn không thể khôi phục được nữa.'
        }
      }
    },

    // Student Dashboard
    student: {
      overview: 'Tổng quan',
      subtitle: 'Chào mừng quay lại!',
      completed: 'Đã làm',
      pending: 'Chưa làm',
      avgScore: 'Điểm TB',
      streak: 'Chuỗi ngày',
      scoreTrend: 'Xu hướng điểm',
      lastWeek: 'Kết quả 7 ngày gần đây',
      pendingAssignments: 'Bài chưa làm',
      myClasses: 'Lớp của tôi',
      joinClass: 'Tham gia lớp',
      takeQuiz: 'Làm bài',
      history: 'Lịch sử',
      progress: 'Tiến độ',
      settings: {
        title: 'Cài đặt tài khoản',
        description: 'Quản lý thông tin cá nhân và tuỳ chọn của bạn',
        tabs: {
          settingsTab: {
            mainTitle: 'Cài đặt hệ thống',
            subTitle: 'Tuỳ chọn giao diện',
            description: 'Chỉnh ngôn ngữ và chế độ sáng/tối',
            option: [
              {
                title: 'Giao diện',
                description: 'Chuyển sáng/tối'
              },
              {
                title: 'Ngôn ngữ',
                description: 'Chọn ngôn ngữ hiển thị'
              }
            ]
          },
          profileTab: {
            mainTitle: 'Hồ sơ',
            subTitle: 'Thông tin cá nhân',
            description: 'Xem và cập nhật hồ sơ của bạn',
            fields: {
              firstName: 'Tên',
              lastName: 'Họ',
              address: 'Địa chỉ',
              phoneNumber: 'Số điện thoại',
              dateOfBirth: 'Ngày sinh',
              createdAt: 'Ngày tạo',
              updatedAt: 'Cập nhật lần cuối'
            }
          },
          passwordTab: {
            mainTitle: 'Mật khẩu',
            subTitle: 'Đổi mật khẩu',
            description: 'Cập nhật mật khẩu để bảo vệ tài khoản',
            fields: {
              currentPassword: 'Mật khẩu hiện tại',
              newPassword: 'Mật khẩu mới',
              confirmPassword: 'Xác nhận mật khẩu'
            }
          }
        }
      }
    },

    // Common
    common: {
      loading: 'Đang tải...',
      save: 'Lưu',
      isSaving: 'Đang lưu...',
      cancel: 'Hủy',
      delete: 'Xóa',
      isDeleting: 'Đang xóa...',
      restore: 'Khôi phục',
      edit: 'Chỉnh sửa',
      cancelEditting: 'Hủy chỉnh sửa',
      add: 'Thêm',
      search: 'Tìm kiếm',
      noData: 'Không có dữ liệu',
      error: 'Có lỗi xảy ra',
      success: 'Thành công',
      viewPort: 'Chọn chế độ hiển thị'
    }
  }
};

export type Language = 'en' | 'vi';

export const translations = {
  en: {
    // Navigation
    nav: {
      login: 'Login',
      signUp: 'Sign Up',
      backHome: 'Back Home',
      back: 'Back'
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

      cta2: {
        title: 'Ready to improve your English?',
        subtitle:
          'Join students who are learning smarter every day with Langoer.',
        button: 'Log in and start'
      },

      footer: {
        copyright: '© 2024 Langoer. All rights reserved.',
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
      title: 'Login',
      subtitle: 'Sign in to continue your learning journey',
      email: 'Email',
      password: 'Password',
      youAre: 'You are',
      student: 'Student',
      teacher: 'Teacher',
      admin: 'Admin',
      signInBtn: 'Sign In',
      noAccount: "Don't have an account yet?",
      backHome: 'Back to Home',
      demoAccounts: 'Demo Accounts:'
    },

    // Dashboard - Common
    dashboard: {
      overview: 'Overview',
      logout: 'Logout',
      settings: 'Settings',
      classes: 'Classes',
      profile: 'Profile'
    },

    // Teacher Dashboard
    teacher: {
      overview: 'Overview',
      subtitle: 'Welcome back!',
      quizzes: 'Manage Questions & Exercises',
      quizzesSubtitle: 'Create, edit and organize your quizzes easily',
      results: 'Results Analytics',
      settings: 'Settings',
      managementPanel: 'AI Quiz Management',
      recentAssignments: 'Recent Assignments',
      allQuizzes: 'All Exercises'
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
      progress: 'Progress'
    },

    // Admin Dashboard
    admin: {
      overview: 'System Overview',
      subtitle: 'Monitor activity and system performance',
      userGrowth: 'User Growth',
      totalUsers: 'Total Users',
      activeUsers: 'Active Users',
      newUsers: 'New Users This Month',
      users: 'User Management',
      classes: 'Classes',
      quizzes: 'Quizzes',
      settings: 'Settings'
    },

    // Common
    common: {
      loading: 'Loading...',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      add: 'Add',
      search: 'Search',
      noData: 'No data available',
      error: 'Something went wrong',
      success: 'Success'
    }
  },

  vi: {
    // Navigation
    nav: {
      login: 'Đăng nhập',
      signUp: 'Đăng ký',
      backHome: 'Trang chủ',
      back: 'Quay lại'
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

      cta2: {
        title: 'Sẵn sàng cải thiện tiếng Anh?',
        subtitle:
          'Tham gia cùng nhiều học sinh đang học tập hiệu quả hơn mỗi ngày với Langoer.',
        button: 'Đăng nhập và bắt đầu'
      },

      footer: {
        copyright: '© 2024 Langoer. Bảo lưu mọi quyền.',
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
      title: 'Đăng nhập',
      subtitle: 'Đăng nhập để tiếp tục học',
      email: 'Email',
      password: 'Mật khẩu',
      youAre: 'Bạn là',
      student: 'Học sinh',
      teacher: 'Giáo viên',
      admin: 'Admin',
      signInBtn: 'Đăng nhập',
      noAccount: 'Chưa có tài khoản?',
      backHome: 'Về trang chủ',
      demoAccounts: 'Tài khoản demo:'
    },

    // Dashboard - Common
    dashboard: {
      overview: 'Tổng quan',
      logout: 'Đăng xuất',
      settings: 'Cài đặt',
      classes: 'Lớp học',
      profile: 'Hồ sơ'
    },

    // Teacher Dashboard
    teacher: {
      overview: 'Tổng quan',
      subtitle: 'Chào mừng quay lại!',
      quizzes: 'Quản lý câu hỏi & bài tập',
      quizzesSubtitle: 'Tạo và quản lý bài tập dễ dàng',
      results: 'Phân tích kết quả',
      settings: 'Cài đặt',
      managementPanel: 'Quản lý AI tạo đề',
      recentAssignments: 'Bài tập gần đây',
      allQuizzes: 'Tất cả bài tập'
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
      progress: 'Tiến độ'
    },

    // Admin Dashboard
    admin: {
      overview: 'Tổng quan hệ thống',
      subtitle: 'Theo dõi hoạt động và thống kê hệ thống',
      userGrowth: 'Tăng trưởng người dùng',
      totalUsers: 'Tổng người dùng',
      activeUsers: 'Đang hoạt động',
      newUsers: 'Người dùng mới tháng này',
      users: 'Quản lý người dùng',
      classes: 'Lớp học',
      quizzes: 'Bài tập',
      settings: 'Cài đặt'
    },

    // Common
    common: {
      loading: 'Đang tải...',
      save: 'Lưu',
      cancel: 'Hủy',
      delete: 'Xóa',
      edit: 'Sửa',
      add: 'Thêm',
      search: 'Tìm kiếm',
      noData: 'Không có dữ liệu',
      error: 'Có lỗi xảy ra',
      success: 'Thành công'
    }
  }
};

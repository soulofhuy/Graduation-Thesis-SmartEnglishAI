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

      cta2: {
        title: 'Ready to improve your English?',
        subtitle:
          'Join students who are learning smarter every day with Langoer.',
        button: 'Log in and start'
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

      cta2: {
        title: 'Sẵn sàng cải thiện tiếng Anh?',
        subtitle:
          'Tham gia cùng nhiều học sinh đang học tập hiệu quả hơn mỗi ngày với Langoer.',
        button: 'Đăng nhập và bắt đầu'
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

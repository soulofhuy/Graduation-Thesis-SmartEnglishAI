export type Language = 'en' | 'vi';

export const translations = {
  en: {
    // Navigation
    nav: {
      login: 'Login',
      signUp: 'Sign up',
      signOut: 'Sign out'
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

    // Admin Dashboard
    admin: {
      overview: {
        title: 'Admin dashboard',
        description: 'View an overview of the system',
        statistic: {
          fieldTotalUsers: 'Total users',
          fieldTotalTeachers: 'Total teachers',
          fieldTotalStudents: 'Total students',
          fieldTotalAssignments: 'Total assignments'
        },
        userGrowthByMonthChart: {
          title: 'Monthly user growth',
          teacher: 'Teacher',
          student: 'Student'
        },
        assignmentGrowthByMonthChart: {
          title: 'Monthly assignment growth',
          assignment: 'Assignment'
        },
        submissionGrowthByMonthChart: {
          title: 'Monthly submission growth',
          totalSubmissionsInMonth: 'Total submissions in month',
          totalPassedAssignmentsInMonth: 'Total passed assignments in month'
        }
      },
      userManagement: {
        title: 'User management',
        description:
          'View and manage all users in the system, including teachers and students',
        buttons: {
          addNewUser: 'Add new user'
        },
        tableView: {
          title: 'List of users',
          columnName: 'Full name',
          columnEmail: 'Email',
          columnRole: 'Role',
          columnStatus: 'Status',
          columnCreatedDate: 'Created date',
          columnActions: 'Actions'
        },
        updateProfile: {
          title: 'Update user profile',
          fieldFirstName: 'First name',
          fieldLastName: 'Last name',
          fieldAddress: 'Address',
          fieldPhoneNumber: 'Phone number',
          fieldDateOfBirth: 'Date of birth'
        },
        changePassword: {
          title: 'Change user password',
          description: 'Enter a new password for this user',
          userInfo: {
            fieldFullName: 'Full name',
            fieldEmail: 'Email',
            fieldRole: 'Role',
            fieldStatus: 'Status',
            fieldCreatedDate: 'Created date',
            fieldAddress: 'Address'
          },
          newPassword: 'New password',
          newPasswordPlaceholder: 'Enter new password here',
          passwordConfirmation: 'Confirm new password',
          passwordConfirmationPlaceholder: 'Confirm new password here'
        },
        createNewUser: {
          userInfo: {
            title: 'Create new user',
            fieldEmail: 'Email',
            fieldEmailPlaceholder: 'Enter user email',
            fieldPassword: 'Password',
            defaultPasswordButton: 'Use default: 123456',
            fieldPasswordPlaceholder: 'Enter user password',
            fieldRole: 'Role',
            fieldRolePlaceholder: 'Select a role for the user',
            fieldRoleTeacher: 'Teacher',
            fieldRoleStudent: 'Student'
          },
          profile: {
            title: 'User profile information (optional)',
            fieldFirstName: 'First name',
            fieldFirstNamePlaceholder: 'Enter user first name',
            fieldLastName: 'Last name',
            fieldLastNamePlaceholder: 'Enter user last name',
            fieldAddress: 'Address',
            fieldAddressPlaceholder: 'Enter user address',
            fieldPhoneNumber: 'Phone number',
            fieldPhoneNumberPlaceholder: 'Enter user phone number',
            fieldDateOfBirth: 'Date of birth',
            fieldDateOfBirthPlaceholder: 'Enter user date of birth'
          }
        }
      },
      classManagement: {
        title: 'Class management',
        description: 'View and manage all classes in the system',
        buttons: {
          addNewClass: 'Add new class'
        },
        createClass: {
          title: 'Create new class',
          description: 'Enter the class information and assign a teacher',
          fieldTeacher: 'Assigned teacher',
          fieldTeacherPlaceholder: 'Select a teacher',
          fieldTeacherEmpty: 'No teachers available'
        },
        tableView: {
          title: 'List of classes',
          fieldClassName: 'Class name',
          fieldClassCode: 'Class code',
          fieldTeacherName: 'Teacher name',
          fieldStudentCount: 'Number of students',
          fieldNumberOfAssignments: 'Number of assignments',
          fieldStatus: 'Status',
          fieldDatedCreated: 'Created date',
          fieldActions: 'Actions'
        },
        updateClass: {
          title: 'Update class information',
          description: 'Update class information and status of ',
          fieldClassName: 'Class name',
          fieldClassNamePlaceholder: 'Example: Class 9CB1',
          fieldClassDescription: 'Class description',
          fieldClassDescriptionPlaceholder: 'Example: Class for 9CB students',
          fieldClassCode: 'Class code',
          fieldNeedsTeacherApproval: 'Needs teacher approval to join?'
        }
      },
      studentManagement: {
        title: 'Student management',
        description:
          'View and manage all students in the system based on their classes',
        tableView: {
          title: 'List of classes',
          fieldClassName: 'Class name',
          fieldClassCode: 'Class code',
          fieldTeacherName: 'Teacher name',
          fieldStudentCount: 'Number of students',
          fieldStatus: 'Status',
          fieldDatedCreated: 'Created date',
          fieldActions: 'Actions'
        },
        activeStudentList: {
          title: 'List of students in class',
          description: 'Class: ',
          tableView: {
            fieldFullName: 'Full name',
            fieldEmail: 'Email',
            fieldPhoneNumber: 'Phone number',
            fieldBannedStatus: 'Banned status',
            fieldJoinedDate: 'Joined date',
            fieldActions: 'Actions'
          }
        },
        bannedStudentList: {
          title: 'List of banned students in class',
          description: 'Class: ',
          tableView: {
            fieldFullName: 'Full name',
            fieldEmail: 'Email',
            fieldPhoneNumber: 'Phone number',
            fieldBannedStatus: 'Banned status',
            fieldBannedDate: 'Banned date',
            fieldActions: 'Actions'
          }
        }
      },
      assignmentManagement: {
        title: 'Assignment management',
        description: 'View and manage all assignments in the system',
        searchOrSortOrFilter: {
          search: {
            title: 'Search',
            searchFieldPlaceholder: 'Search by title, teacher, or class',
            searchButton: 'Search',
            resetButton: 'Reset'
          },
          sort: {
            sortItems: {
              title: 'Sort by',
              fieldTitle: 'Title',
              fieldTeacherName: 'Teacher name',
              fieldClassName: 'Class name',
              fieldAssignmentStatus: 'Status',
              fieldCreatedDate: 'Created date'
            },
            order: {
              title: 'Order',
              asc: 'Ascending',
              desc: 'Descending'
            }
          }
        },
        tableView: {
          title: 'List of assignments',
          fieldTitle: 'Title',
          fieldClassName: 'Class name',
          fieldTeacherName: 'Teacher name',
          fieldCreatedDate: 'Created date',
          fieldAssignmentStatus: 'Status',
          fieldActions: 'Actions'
        },
        deleteAssignment: {
          title: 'Delete assignment'
        }
      },
      resultManagement: {
        title: "Students' assignment results",
        description: 'Manage and review students assignment results in details',
        filters: {
          title: 'Filters',
          description: 'Choose assignment and class to filter results',
          assignment: {
            title: 'Choose assignment',
            default: 'Choose an assignment'
          },
          class: {
            title: 'Choose class',
            default: 'Choose a class'
          }
        },
        resultTable: {
          title: "List of students with assignment's results",
          fieldName: 'Name',
          fieldEmail: 'Email',
          fieldNumberOfSubmissions: 'Number of submissions',
          fieldHighestResult: 'Best result',
          fieldActions: 'Actions'
        },
        viewResultDetails: {
          summaryCards: {
            title: 'Summary of this assignment',
            fieldClass: 'Class',
            fieldClassCode: 'Class code',
            fieldStudentName: 'Student name',
            fieldEmail: 'Email',
            fieldDueDate: 'Due date',
            fieldSubmissionCount: 'Number of submissions'
          },
          historyOfSubissionsSummary: {
            title: 'History of submissions',
            fieldStatus: 'Status',
            fieldStartTime: 'Started at',
            fieldSubmittedTime: 'Submitted at',
            fieldTotalTime: 'Total time',
            fieldWrongAnswerCount: 'Wrong answers',
            fieldResult: 'Result'
          },
          submissionDetails: {
            title: 'Submission details no. ',
            fieldResult: 'Result',
            fieldSubmittedAt: 'Submitted at',
            fieldQuestion: 'Question no.'
          }
        }
      }
    },

    // Teacher Dashboard
    teacher: {
      overview: {
        title: 'Teacher dashboard',
        description: 'View an overview of your teaching activities',
        statistic: {
          fieldTotalClasses: 'Total classes',
          fieldTotalStudents: 'Total students',
          fieldTotalAssignments: 'Total assignments',
          fieldTotalPendingRequests: 'Pending requests'
        },
        tableView: {
          title: 'Recent assignments',
          columnTitle: 'Assignment name',
          columnClass: 'Class',
          columnCreatedDate: 'Created date',
          columnDueDate: 'Due date',
          columnSubmissionCount: 'Submissions',
          columnSubmittedStudents: 'Submitted students',
          submissionCountDescription: 'submission(s)',
          submittedStudentsCountDescription: 'student(s)'
        }
      },
      classes: {
        searchOrSortOrFilter: {
          search: {
            title: 'Search',
            searchFieldPlaceholder: 'Search by class name or class code',
            searchButton: 'Search',
            resetButton: 'Reset'
          },
          sort: {
            sortItems: {
              title: 'Sort by',
              fieldClassName: 'Class name',
              fieldStudentCount: 'Number of students',
              fieldAssignmentCount: 'Number of assignments',
              fieldPendingRequestCount: 'Number of pending requests'
            },
            order: {
              title: 'Order',
              asc: 'Ascending',
              desc: 'Descending'
            }
          }
        },
        title: 'Manage classes',
        description: 'Create and manage your classes',
        tableViewport: {
          title: 'List of classes',
          columnName: 'Class name',
          columnDescription: 'Description',
          columnStudentNumber: 'Number of students',
          columnAssignmentNumber: 'Number of assignments',
          columnClassCode: 'Class code',
          columnPendingRequestNumber: 'Pending requests',
          columnActions: 'Actions'
        },
        gridViewport: {
          fieldStudentNumber: 'No. students',
          fieldAssignmentNumber: 'No. assignments',
          fieldPendingRequestNumber: 'No. pending requests',
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
          title: 'Edit class',
          description: 'Update class information',
          fieldName: 'Class name',
          fieldNamePlaceholder: 'Example: Class 9CB1',
          fieldDescription: 'Class description',
          fieldDescriptionPlaceholder: 'Example: Class for 9CB students',
          fieldNeedsTeacherApproval: 'Needs your approval to join?',
          fieldClassCode: 'Class code'
        },
        deleteClass: {
          title: 'Delete class',
          description: 'Are you sure you want to delete this class?',
          classInformation: {
            title: 'Class information',
            fieldClassName: 'Class name',
            fieldClassDescription: 'Class description',
            fieldStudentNumber: 'Number of students',
            fieldAssignmentNumber: 'Number of assignments',
            fieldClassCode: 'Class code'
          }
        },
        viewPendingRequests: {
          title: 'Pending participation requests',
          class: 'Class',
          pendingRequestsCount: 'Number of pending requests',
          acceptButton: 'Accept',
          rejectButton: 'Reject',
          noPendingRequests: 'No pending requests',
          status: 'Pending',
          timeRequest: 'Requested at'
        }
      },
      students: {
        title: 'Manage students',
        description: 'View and manage students in your class',
        filter: {
          title: 'Select your class',
          placeholder: 'Choose a class'
        },
        searchOrSortOrFilter: {
          search: {
            title: 'Search for students in the class',
            searchFieldPlaceholder: "Search by student's name",
            searchButton: 'Search',
            resetButton: 'Reset'
          },
          sort: {
            sortItems: {
              title: 'Sort by',
              fieldName: 'Name',
              fieldEmail: 'Email',
              fieldJoinedAt: 'Joined date'
            },
            order: {
              title: 'Order',
              asc: 'Ascending',
              desc: 'Descending'
            }
          }
        },
        tableView: {
          title: 'List of students',
          description: 'Class:',
          columnNo: 'No.',
          columnName: 'Full name',
          columnEmail: 'Email',
          columnStatus: 'Status',
          columnDateJoined: 'Joining date',
          columnActions: 'Actions',
          noData: 'No students to display',
          requestToChooseClass:
            'Please select a class to view the student list.',
          buttonViewDeactivatedStudents: 'View inactive students'
        },
        banStudent: {
          title: 'Ban this student',
          description:
            'Are you sure you want to ban this student from this class?'
        },
        viewBannedStudents: {
          title: 'List of locked students',
          description: 'Teachers can unlock students',
          columnNo: 'No.',
          columnName: 'Full name',
          columnEmail: 'Email',
          columnDateJoined: 'Joining date',
          columnActions: 'Actions',
          noData: 'No students are locked',
          unbanButton: 'Unlock'
        }
      },
      assignments: {
        overview: {
          title: 'Manage your assignment',
          description:
            'Create and manage your assignments, and view assignment results',
          viewAIInstruction: {
            titleButton: 'How to create assignment with AI?',
            title: 'Instruction on creating assignment with AI',
            description:
              'Use AI to quickly create high-quality assignments, saving time on preparation!'
          },
          createAssignmentButton: 'Create assignment',
          tableView: {
            title: 'List of assignments',
            description: 'All assignments you have created',
            columnTitle: 'Title',
            columnDescription: 'Description',
            columnClass: 'Assigned class',
            columnNumberOfQuestions: 'No. questions',
            columnCreatedDate: 'Created date',
            columnDueDate: 'Due date',
            columnIsPublic: 'Public',
            columnIsActive: 'Status',
            columnActions: 'Actions'
          },
          searchOrSortOrFilter: {
            search: {
              title: 'Search assignments',
              searchFieldPlaceholder: 'Search by assignment title',
              searchButton: 'Search',
              resetButton: 'Reset'
            },
            sort: {
              sortItems: {
                title: 'Sort by',
                fieldTitle: 'Title',
                fieldNumberOfQuestions: 'Number of questions',
                fieldDueDate: 'Due date',
                fieldCreatedDate: 'Created date'
              },
              order: {
                title: 'Order',
                asc: 'Ascending',
                desc: 'Descending'
              }
            }
          }
        },
        createAssignment: {
          title: 'Create new assignment',
          description: 'Free to create your own assignment as you want',
          tabAssignmentInfo: {
            title: 'Assignment information',
            fieldAssignmentName: 'Assignment name',
            fieldAssignmentNamePlaceholder:
              'e.g., Present Simple Tense Exercise',
            fieldClass: 'Is assigned for class',
            fieldClassPlaceholder: 'Select class to assign',
            fieldDeadline: 'Deadline',
            fieldDescription: 'Description',
            fieldDescriptionPlaceholder: 'Enter assignment description here'
          },
          tabAssignmentConfig: {
            title: 'Assignment configuration',
            fieldIsPublic: 'Make assignment public',
            fieldIsPublicDescription:
              'If enabled, students that are not in your assigned class can also access',
            fieldOneAttempt: 'Only allow one attempt',
            fieldOneAttemptDescription:
              'If enabled, students can only attempt the assignment once',
            fieldCanViewResult: 'Allow students to view results',
            fieldCanViewResultDescription:
              'If enabled, students can view their results after submission'
          },
          tabEditCOntentFromAI: {
            title: 'Edit your assignment content'
          },
          tabViewPreview: {
            title: 'View assignment preview'
          },
          tabChatWithAI: {
            title: 'Chat with AI to create assignment',
            description:
              'Use AI to quickly create high-quality assignments, saving time on preparation. Just provide some basic information and let AI handle the rest!'
          },
          moveNextTabButton: 'Create questions for this assignment',
          moveNextTabButtonWithAI: 'Go to "Chat with AI" tab to create content'
        },
        chooseTypeOfAssignmentCreation: {
          title: 'Choose how to create your assignment',
          manually: 'Create manually',
          withAI: 'Create with AI'
        },
        chatWithAISession: {
          initialChatAIMessage:
            'Make your requirements clear to get the best result from AI.',
          AILoadingMessage:
            'AI is creating your assignment, please wait a moment...',
          chatMessageFieldPlaceholder: 'Type your message here to chat with AI'
        },
        editAssignment: {
          title: 'Edit assignment',
          description: 'Update assignment information and configuration',
          tabEdit: {
            title: 'Edit assignment'
          },
          tableViewPreview: {
            title: 'Preview assignment'
          },
          tabStudentResults: {
            title: 'Student results'
          },
          tabChatWithAI: {
            title: 'AI conversation history'
          }
        },
        createQuestionsAndTasks: {
          createTask: {
            title: 'Tasks list',
            addTaskButton: 'Add new task',
            fieldTaskTypeDropdown: 'Select task type',
            fieldTaskTypeDropdownValue: {
              PRONUNCIATION: 'Pronunciation',
              WORD_STRESS: 'Word stress',
              SITUATIONAL_DIALOG: 'Situational dialog',
              MULTIPLE_CHOICE: 'Multiple choice',
              CLOZE_PASSAGE: 'Cloze passage',
              READING_COMPREHENSION: 'Reading comprehension'
            },
            fieldTaskDescription: 'Task description',
            fieldTaskDescriptionPlaceholder: 'Enter description for this task'
          },
          createQuestion: {
            deleteButton: 'Delete this question',
            questionList: {
              title: 'Questions list',
              addQuestionButton: 'Add new question'
            },
            title: 'Create a new question',
            questionContent: 'Question content',
            questionContentPlaceholder: 'Enter question content here',
            choice: {
              title: 'Choices for this question',
              addChoiceButton: 'Add new choice',
              deleteChoiceButton: 'Delete this choice',
              choiceNo: 'Choice number ',
              choicePlaceholder: 'Enter choice content here'
            },
            clozeTest: {
              title: 'Type the passage for this task',
              passagePlaceholder:
                'Enter passage content here. Use {{blank}} to indicate blank space for cloze test.'
            },
            readingComprehensionTest: {
              title: 'Type the passage for this task',
              passagePlaceholder:
                'Enter passage content here. The question will be based on this passage.'
            }
          }
        },
        previewAssignment: {
          title: 'Assignment preview',
          dueDate: 'Due date: ',
          isPublic: 'Public',
          isSingleAttempt: 'Single attempt only',
          task: 'Task',
          passage: 'Passage',
          question: 'Question',
          isCorrect: 'Correct answer',
          summary: 'Total',
          summaryQuestions: 'question(s)'
        }
      },
      results: {
        title: "Students' assignment results",
        description: 'Manage and review students assignment results in details',
        statistic: {
          totalSubmiitedCount: 'Total submitted students',
          totalNotSubmittedCount: 'Total not submitted students',
          highestCorrectCount: 'Highest correct answers',
          highestCorrectStudentName: 'Best student'
        },
        filters: {
          class: {
            title: 'Choose class'
          },
          assignment: {
            title: 'Choose assignment'
          }
        },
        tableView: {
          title: 'List of student results',
          columnName: "Student's name",
          columnEmail: "Student's email",
          columnLatestResult: 'Latest result',
          columnHighestResult: 'Best result',
          columnSubmittedCount: 'Number of submissions',
          columnSubmittedDate: 'Last submitted date',
          columnActions: 'Actions'
        },
        viewAssignmentResultDetails: {
          statistic: {
            labelClass: 'Class',
            labelClassCode: 'Class code',
            labelStudent: 'Student',
            labelEmail: 'Email',
            labelDueDate: 'Due date',
            labelSubmissionCount: 'Number of submissions'
          }
        },
        chatWithAI: {
          title: 'Chat with AI about the results or system',
          recentChats: 'Your recent chats',
          textInputPlaceholder: 'Type your message here to chat with AI',
          newChatSessionButton: 'Start new chat session'
        }
      },
      trashBin: {
        title: 'Trash bin for your deleted items',
        description:
          'Manage deleted items. You can restore or permanently delete them',
        searchOrSortOrFilter: {
          filter: {
            title: 'Filter by type',
            class: 'Class',
            assignment: 'Assignment'
          },
          search: {
            title: 'Search in trash bin',
            searchFieldPlaceholder: 'Search by name or description',
            searchButton: 'Search',
            resetButton: 'Reset'
          },
          sort: {
            sortItems: {
              title: 'Sort by',
              fieldTitle: 'Title/name',
              fieldDescription: 'Description',
              fieldDeletedDate: 'Deleted date'
            },
            order: {
              title: 'Order',
              asc: 'Ascending',
              desc: 'Descending'
            }
          }
        },
        table: {
          title: 'List of deleted items',
          description: 'items in trash bin',
          columnName: 'Name',
          columnType: 'Type',
          columnDescription: 'Description',
          columnDeletedAt: 'Deleted date',
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
      classes: {
        searchOrSortOrFilter: {
          search: {
            title: 'Search',
            searchFieldPlaceholder: 'Search by class name or class code',
            searchButton: 'Search',
            resetButton: 'Reset'
          },
          sort: {
            sortItems: {
              title: 'Sort by',
              fieldClassName: 'Class name',
              fieldStudentCount: 'Number of students',
              fieldTeacherName: 'Teacher name',
              fieldClassCode: 'Class code'
            },
            order: {
              title: 'Order',
              asc: 'Ascending',
              desc: 'Descending'
            }
          }
        },
        title: 'My classes',
        description: 'List of classes you are currently attending',
        buttonJoinClass: {
          buttonName: 'Join class',
          title: 'Join new class',
          description:
            'Enter the class code provided by your teacher to join the new class',
          fieldClassCode: 'Class code',
          fieldClassCodePlaceholder: 'Example: ABC123',
          note: 'You need a class code to join. Please contact your teacher to get the class code.',
          joinButton: 'Join',
          isJoining: 'Joining'
        },
        buttonViewRequests: {
          buttonName: 'Request history',
          title: 'Request history for joining',
          description:
            'Track the list of submitted requests and approval status.',
          noRequests: 'You have not submitted any requests to join the class.',
          columnClassCode: 'Class code',
          columnTimeRequest: 'Request time',
          columnStatus: 'Status'
        },
        viewClassMembersList: {
          title: 'Class member list - class: ',
          description: 'List of members in your class',
          fieldSearch: 'Search by full name, email, or phone number...',
          fieldSearchPlaceholder: 'Enter search keyword',
          fieldSortBy: 'Sort by',
          sortNameAsc: 'Name: A to Z',
          sortNameDesc: 'Name: Z to A',
          sortJoinedAtAsc: 'Joined date: Oldest first',
          sortJoinedAtDesc: 'Joined date: Newest first',
          columnNo: 'No.',
          columnName: 'Fullname',
          columnEmail: 'Email',
          columnPhoneNumber: 'Phone number',
          columnDateJoined: 'Date joined',
          noData: 'No data to display'
        },
        viewBannedClasses: {
          buttonName: 'View banned classes',
          title: 'List of your banned classes',
          description: 'These are classes you no longer have access to!',
          columnClassName: 'Class name',
          columnTeacherName: 'Teacher name',
          columnClassCode: 'Class code',
          columnBannedDate: 'Banned date',
          noData: 'You are not banned from any classes'
        },
        gridViewport: {
          fieldTeacherName: 'Teacher name',
          fieldStudentNumber: 'Number of students',
          fieldClassCode: 'Class code',
          fieldClassStatus: 'Class status'
        },
        tableViewport: {
          title: 'List of your classes',
          description: 'Here are the classes you have joined',
          columnClassName: 'Class name',
          columnTeacherName: 'Teacher name',
          columnStudentNumber: 'Number of students',
          columnClassCode: 'Class code',
          columnClassStatus: 'Class status',
          columnActions: 'Actions'
        }
      },
      assignments: {
        overview: {
          searchOrSortOrFilter: {
            search: {
              title: 'Search',
              searchFieldPlaceholder:
                "Search by assignment's title or class's name",
              searchButton: 'Search',
              resetButton: 'Reset'
            },
            sort: {
              sortItems: {
                title: 'Sort by',
                fieldAssignmentTitle: "Assignment's title",
                fieldClassName: "Class's name",
                fieldQuestionCount: 'Number of questions',
                fieldDueDate: 'Due date'
              },
              order: {
                title: 'Order',
                asc: 'Ascending',
                desc: 'Descending'
              }
            }
          },
          title: 'My assignments',
          description:
            'Do my assignments and practice English to improve my skills',
          tableView: {
            title: 'List of assignments',
            columnAssignmentTitle: 'Title',
            columnClass: 'Class',
            columnNumberOfQuestions: 'No. questions',
            columnIsSingleAttempt: 'Can do multiple attempts',
            columnDueDate: 'Due date',
            columnStatus: 'Status',
            columnResult: 'Result',
            columnActions: 'Actions',
            columnDoAssignmentButton: 'Do it now',
            columnContinueAssignmentButton: 'Continue',
            columnSubmittedAssignmentButton: 'Submitted',
            statusAssigned: 'Assigned',
            statusInProgress: 'In progress',
            statusSubmitted: 'Done',
            scoreFormat: '{{correctCount}}/{{totalCount}} correct',
            singleAttemptWarning:
              'This assignment allows only one submitted attempt'
          }
        },
        takeAssignment: {
          submitButton: 'Submit',
          answerList: {
            title: 'Your answer list',
            currentQuestion: 'Current question',
            markedQuestion: 'Marked question',
            previousButton: 'Previous',
            nextButton: 'Next'
          },
          submitConfirmation: {
            title: 'Submit confirmation',
            description: 'Are you sure you want to submit this assignment?',
            submitButton: 'Submit',
            continueButton: 'Continue taking'
          },
          answerReview: {
            title: 'Your result',
            correct: 'correct',
            total: 'total',
            allowToViewResult: {
              title: 'Assignment result',
              tabsView: {
                total: 'Total',
                correct: 'Correct',
                incorrect: 'Incorrect'
              }
            },
            notAllowToViewResult: {
              title: 'Assignment submitted',
              description:
                'Your assignment has been submitted successfully. You can view the results once your teacher has reviewed it.',
              details: {
                totalAnsweredQuestions: 'Total number of questions answered:',
                totalQuestions: 'Total number of questions:',
                totalCorrectAnswers: 'Total number of correct answers:'
              }
            }
          }
        },
        viewHistory: {
          searchOrSortOrFilter: {
            search: {
              title: 'Search',
              searchFieldPlaceholder: 'Search by assignment title/class name',
              searchButton: 'Search',
              resetButton: 'Reset'
            },
            sort: {
              sortItems: {
                title: 'Sort by',
                fieldAssignmentTitle: "Assignment's title",
                fieldClassName: "Class's name",
                fieldSubmittedDate: 'Submitted date',
                fieldTotalTime: 'Total time'
              },
              order: {
                title: 'Order',
                asc: 'Ascending',
                desc: 'Descending'
              }
            }
          },
          title: 'My assignment history',
          description:
            'Review your past assignments and results to track your learning progress',
          searchPlaceholder: 'Search by assignment title...',
          tableView: {
            columnAssignmentTitle: 'Assignment title',
            columnClass: 'Class',
            columnIsSingleAttempt: 'Single attempt',
            columnResult: 'Result',
            columnSubmittedAt: 'Submitted at',
            columnTotalTime: 'Total time',
            columnStatus: 'Status',
            columnActions: 'Actions',
            actionDescriptionViewDetails: 'View details'
          }
        },
        viewHistoryDetails: {
          assignmentInfo: {
            title: 'Assignment information',
            statistic: {
              assignmentTitle: 'Assignment title',
              assignmentTotalAttempts: 'Total attempts',
              assignmentDeadline: 'Deadline'
            }
          },
          assginmentHistory: {
            title: 'Assignment history',
            tableView: {
              columnAttempt: 'Attempt',
              columnStatus: 'Status',
              columnStartedAt: 'Started at',
              columnSubmittedAt: 'Submitted at',
              columnTotalTime: 'Total time',
              columnTotalAssignmentQuestions: 'Total questions',
              columnResult: 'Result'
            }
          },
          assignmentHistoryDetails: {
            title: 'Assignment attempt details for attempt',
            result: 'Number of correct questions',
            submittedAt: 'Submitted at',
            question: 'Question'
          }
        }
      },
      progress: {
        title: 'My progress',
        description:
          'Track your learning progress and see how you improve over time with detailed statistics and charts',
        overallStatistic: {
          fieldTotalCompletedAssignments: 'Total completed assignments',
          fieldTotalCompletedQuestion: 'Total completed questions',
          fieldHighestTaskType: 'Your best task type',
          fieldLowestTaskType: 'Your weakest task type'
        },
        monthlyProgress: {
          title: 'Chart showing the number of correct answers by month',
          totalQuestions: 'Total questions',
          correctAnswers: 'Correct answers'
        },
        taskTypeProgress: {
          title: 'Chart showing the number of correct answers by task type',
          totalQuestions: 'Total questions',
          correctAnswers: 'Correct answers'
        }
      },
      settings: {
        title: 'Account settings',
        description: 'Manage your personal information and preferences',
        tabs: {
          settingsTab: {
            mainTitle: 'System settings',
            subTitle: 'Interface options',
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
            subTitle: 'Personal information',
            description: 'View and update your profile',
            fields: {
              firstName: 'First name',
              lastName: 'Last name',
              address: 'Address',
              phoneNumber: 'Phone number',
              dateOfBirth: 'Date of birth',
              createdAt: 'Created at',
              updatedAt: 'Last updated'
            }
          },
          passwordTab: {
            mainTitle: 'Password',
            subTitle: 'Change password',
            description: 'Update password to protect your account',
            fields: {
              currentPassword: 'Current password',
              newPassword: 'New password',
              confirmPassword: 'Confirm password'
            }
          }
        }
      }
    },

    // Navigation roles
    navRoles: {
      student: {
        class: 'My classes',
        assignment: 'Take assignments',
        history: 'Assignment history',
        progress: 'My progress',
        settings: 'Account settings'
      },
      teacher: {
        overview: 'Overview',
        classes: 'Class management',
        students: 'Student management',
        assignments: 'Assignment management',
        results: 'Learning results',
        trashBin: 'Trash bin',
        settings: 'Account settings'
      }
    },

    // Common
    common: {
      active: 'Active',
      inactive: 'Inactive',
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
      viewPort: 'Choose your viewport',
      close: 'Close',
      deleteConfirmation:
        'This action cannot be undone. Are you sure you want to continue?',
      pagination: {
        label: 'Number of results / page',
        previous: 'Previous page',
        next: 'Next page',
        total: 'Total quantity:'
      },
      yes: 'Yes',
      no: 'No',
      confirm: 'Confirm',
      back: 'Back',
      understandLabel: 'Got it'
    }
  },

  vi: {
    // Navigation
    nav: {
      login: 'Đăng nhập',
      signUp: 'Đăng ký',
      signOut: 'Đăng xuất'
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

    // Admin Dashboard
    admin: {
      overview: {
        title: 'Bảng điều khiển quản trị',
        description: 'Xem tổng quan về hệ thống',
        statistic: {
          fieldTotalUsers: 'Tổng số người dùng',
          fieldTotalTeachers: 'Tổng số giáo viên',
          fieldTotalStudents: 'Tổng số học sinh',
          fieldTotalAssignments: 'Tổng số bài tập'
        },
        userGrowthByMonthChart: {
          title: 'Theo dõi người dùng theo tháng',
          teacher: 'Giáo viên',
          student: 'Học sinh'
        },
        assignmentGrowthByMonthChart: {
          title: 'Theo dõi bài tập theo tháng',
          assignment: 'Bài tập'
        },
        submissionGrowthByMonthChart: {
          title: 'Theo dõi bài nộp theo tháng',
          totalSubmissionsInMonth: 'Tổng số bài nộp trong tháng',
          totalPassedAssignmentsInMonth: 'Tổng số bài đạt yêu cầu trong tháng'
        }
      },
      userManagement: {
        title: 'Quản lý người dùng',
        description:
          'Xem và quản lý tất cả người dùng trong hệ thống, bao gồm giáo viên và học sinh',
        buttons: {
          addNewUser: 'Thêm người dùng mới'
        },
        tableView: {
          title: 'Danh sách người dùng',
          columnName: 'Họ và tên',
          columnEmail: 'Email',
          columnRole: 'Vai trò',
          columnStatus: 'Trạng thái',
          columnCreatedDate: 'Ngày tạo',
          columnActions: 'Thao tác'
        },
        updateProfile: {
          title: 'Cập nhật hồ sơ người dùng',
          fieldFirstName: 'Tên',
          fieldLastName: 'Họ',
          fieldAddress: 'Địa chỉ',
          fieldPhoneNumber: 'Số điện thoại',
          fieldDateOfBirth: 'Ngày sinh'
        },
        changePassword: {
          title: 'Đổi mật khẩu người dùng',
          description: 'Nhập mật khẩu mới cho người dùng này',
          userInfo: {
            fieldFullName: 'Họ và tên',
            fieldEmail: 'Email',
            fieldRole: 'Vai trò',
            fieldStatus: 'Trạng thái',
            fieldCreatedDate: 'Ngày tạo',
            fieldAddress: 'Địa chỉ'
          },
          newPassword: 'Mật khẩu mới',
          newPasswordPlaceholder: 'Nhập mật khẩu mới tại đây',
          passwordConfirmation: 'Xác nhận mật khẩu mới',
          passwordConfirmationPlaceholder: 'Xác nhận mật khẩu mới tại đây'
        },
        createNewUser: {
          userInfo: {
            title: 'Tạo người dùng mới',
            fieldEmail: 'Email',
            fieldEmailPlaceholder: 'Nhập email của người dùng',
            fieldRole: 'Vai trò',
            fieldPassword: 'Mật khẩu',
            defaultPasswordButton: 'Dùng mặc định: 123456',
            fieldPasswordPlaceholder: 'Nhập mật khẩu cho người dùng',
            fieldRolePlaceholder: 'Chọn vai trò cho người dùng',
            fieldRoleTeacher: 'Giáo viên',
            fieldRoleStudent: 'Học sinh'
          },
          profile: {
            title: 'Thông tin hồ sơ người dùng (tùy chọn)',
            fieldFirstName: 'Tên',
            fieldFirstNamePlaceholder: 'Nhập tên của người dùng',
            fieldLastName: 'Họ',
            fieldLastNamePlaceholder: 'Nhập họ của người dùng',
            fieldAddress: 'Địa chỉ',
            fieldAddressPlaceholder: 'Nhập địa chỉ của người dùng',
            fieldPhoneNumber: 'Số điện thoại',
            fieldPhoneNumberPlaceholder: 'Nhập số điện thoại của người dùng',
            fieldDateOfBirth: 'Ngày sinh',
            fieldDateOfBirthPlaceholder: 'Nhập ngày sinh của người dùng'
          }
        }
      },
      classManagement: {
        title: 'Quản lý lớp học',
        description: 'Xem và quản lý tất cả lớp học trong hệ thống',
        buttons: {
          addNewClass: 'Thêm lớp học mới'
        },
        createClass: {
          title: 'Tạo lớp học mới',
          description: 'Nhập thông tin lớp học và chọn giáo viên phụ trách',
          fieldTeacher: 'Giáo viên phụ trách',
          fieldTeacherPlaceholder: 'Chọn giáo viên',
          fieldTeacherEmpty: 'Không có giáo viên khả dụng'
        },
        tableView: {
          title: 'Danh sách lớp học',
          fieldClassName: 'Tên lớp học',
          fieldClassCode: 'Mã lớp',
          fieldTeacherName: 'Tên giáo viên',
          fieldStudentCount: 'Số lượng học sinh',
          fieldNumberOfAssignments: 'Số lượng bài tập',
          fieldStatus: 'Trạng thái',
          fieldDatedCreated: 'Ngày tạo',
          fieldActions: 'Thao tác'
        },
        updateClass: {
          title: 'Cập nhật thông tin lớp học',
          description: 'Cập nhật thông tin và trạng thái của',
          fieldClassName: 'Tên lớp học',
          fieldClassNamePlaceholder: 'Ví dụ: Lớp 9CB1',
          fieldClassDescription: 'Mô tả lớp học',
          fieldClassDescriptionPlaceholder: 'Ví dụ: Lớp dành cho học sinh 9CB',
          fieldClassCode: 'Mã lớp',
          fieldNeedsTeacherApproval: 'Cần giáo viên phê duyệt để tham gia?'
        }
      },
      studentManagement: {
        title: 'Quản lý học sinh',
        description:
          'Xem và quản lý tất cả học sinh trong hệ thống theo từng lớp học',
        tableView: {
          title: 'Danh sách lớp học',
          fieldClassName: 'Tên lớp',
          fieldClassCode: 'Mã lớp',
          fieldTeacherName: 'Tên giáo viên',
          fieldStudentCount: 'Số lượng học sinh',
          fieldStatus: 'Trạng thái',
          fieldDatedCreated: 'Ngày tạo',
          fieldActions: 'Hành động'
        },
        activeStudentList: {
          title: 'Danh sách học sinh trong lớp',
          description: 'Lớp: ',
          tableView: {
            fieldFullName: 'Họ và tên',
            fieldEmail: 'Email',
            fieldPhoneNumber: 'Số điện thoại',
            fieldBannedStatus: 'Trạng thái cấm',
            fieldJoinedDate: 'Ngày tham gia',
            fieldActions: 'Hành động'
          }
        },
        bannedStudentList: {
          title: 'Danh sách học sinh bị cấm tham gia trong lớp',
          description: 'Lớp: ',
          tableView: {
            fieldFullName: 'Họ và tên',
            fieldEmail: 'Email',
            fieldPhoneNumber: 'Số điện thoại',
            fieldBannedStatus: 'Trạng thái cấm',
            fieldBannedDate: 'Ngày bị cấm',
            fieldActions: 'Hành động'
          }
        }
      },
      assignmentManagement: {
        title: 'Quản lý bài tập',
        description: 'Xem và quản lý tất cả bài tập trong hệ thống',
        searchOrSortOrFilter: {
          search: {
            title: 'Tìm kiếm',
            searchFieldPlaceholder: 'Tìm theo tiêu đề, giáo viên hoặc lớp',
            searchButton: 'Tìm kiếm',
            resetButton: 'Đặt lại'
          },
          sort: {
            sortItems: {
              title: 'Sắp xếp theo',
              fieldTitle: 'Tiêu đề',
              fieldTeacherName: 'Tên giáo viên',
              fieldClassName: 'Tên lớp',
              fieldAssignmentStatus: 'Trạng thái',
              fieldCreatedDate: 'Ngày tạo'
            },
            order: {
              title: 'Thứ tự',
              asc: 'Tăng dần',
              desc: 'Giảm dần'
            }
          }
        },
        tableView: {
          title: 'Danh sách bài tập',
          fieldTitle: 'Tiêu đề',
          fieldClassName: 'Tên lớp học',
          fieldTeacherName: 'Giáo viên',
          fieldCreatedDate: 'Ngày tạo',
          fieldAssignmentStatus: 'Trạng thái',
          fieldActions: 'Thao tác'
        },
        deleteAssignment: {
          title: 'Xóa bài tập'
        }
      },
      resultManagement: {
        title: 'Kết quả bài tập của học sinh',
        description:
          'Xem và quản lý kết quả bài tập của học sinh một cách chi tiết',
        filters: {
          title: 'Lọc kết quả',
          description: 'Chọn lớp học và bài tập để xem kết quả của học sinh',
          assignment: {
            title: 'Chọn bài tập',
            default: 'Hãy chọn một bài tập'
          },
          class: {
            title: 'Chọn lớp học',
            default: 'Hãy chọn một lớp học'
          }
        },
        resultTable: {
          title: 'Danh sách học sinh cùng kết quả bài làm',
          fieldName: 'Tên học sinh',
          fieldEmail: 'Email',
          fieldNumberOfSubmissions: 'Số lần nộp bài',
          fieldHighestResult: 'Kết quả tốt nhất',
          fieldActions: 'Thao tác'
        },
        viewResultDetails: {
          summaryCards: {
            title: 'Tóm tắt bài tập này',
            fieldClass: 'Lớp học',
            fieldClassCode: 'Mã lớp',
            fieldStudentName: 'Tên học sinh',
            fieldEmail: 'Email',
            fieldDueDate: 'Hạn nộp',
            fieldSubmissionCount: 'Số lần nộp bài'
          },
          historyOfSubissionsSummary: {
            title: 'Lịch sử nộp bài',
            fieldStatus: 'Trạng thái',
            fieldStartTime: 'Bắt đầu lúc',
            fieldSubmittedTime: 'Nộp lúc',
            fieldTotalTime: 'Tổng thời gian',
            fieldWrongAnswerCount: 'Số câu sai',
            fieldResult: 'Kết quả'
          },
          submissionDetails: {
            title: 'Chi tiết lần nộp số ',
            fieldResult: 'Kết quả',
            fieldSubmittedAt: 'Nộp lúc',
            fieldQuestion: 'Câu hỏi số'
          }
        }
      }
    },

    // Teacher Dashboard
    teacher: {
      overview: {
        title: 'Trang tổng quan dành cho giáo viên',
        description: 'Xem tổng quan các công việc của giáo viên qua dashboard',
        statistic: {
          fieldTotalClasses: 'Tổng số lớp học',
          fieldTotalStudents: 'Tổng số học sinh',
          fieldTotalAssignments: 'Tổng số bài tập',
          fieldTotalPendingRequests: 'Tổng số yêu cầu đang chờ duyệt'
        },
        tableView: {
          title: 'Danh sách các bài tập gần đây',
          columnTitle: 'Tiêu đề',
          columnClass: 'Lớp học',
          columnCreatedDate: 'Ngày tạo',
          columnDueDate: 'Ngày đến hạn',
          columnSubmissionCount: 'Số lượt nộp bài của học sinh',
          columnSubmittedStudents: 'Số học sinh đã nộp bài',
          submissionCountDescription: 'lượt',
          submittedStudentsCountDescription: 'học sinh'
        }
      },
      classes: {
        searchOrSortOrFilter: {
          search: {
            title: 'Tìm kiếm',
            searchFieldPlaceholder: 'Tìm kiếm theo tên lớp hoặc mã lớp',
            searchButton: 'Tìm kiếm',
            resetButton: 'Đặt lại'
          },
          sort: {
            sortItems: {
              title: 'Sắp xếp theo',
              fieldClassName: 'Tên lớp',
              fieldStudentCount: 'Số lượng học sinh',
              fieldAssignmentCount: 'Số lượng bài tập',
              fieldPendingRequestCount: 'Số lượng đang yêu cầu'
            },
            order: {
              title: 'Thứ tự',
              asc: 'Tăng dần',
              desc: 'Giảm dần'
            }
          }
        },
        title: 'Quản lí lớp học',
        description: 'Tạo và quản lí các lớp học của bạn',
        tableViewport: {
          title: 'Danh sách các lớp học',
          columnName: 'Tên lớp',
          columnDescription: 'Mô tả',
          columnStudentNumber: 'Số lượng học sinh',
          columnAssignmentNumber: 'Số lượng bài tập',
          columnPendingRequestNumber: 'Số lượng đang yêu cầu',
          columnClassCode: 'Mã lớp',
          columnActions: 'Các thao tác'
        },
        gridViewport: {
          fieldStudentNumber: 'Số học sinh',
          fieldAssignmentNumber: 'Số bài tập',
          fieldPendingRequestNumber: 'Chờ duyệt',
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
        },
        viewPendingRequests: {
          title: 'Yêu cầu tham gia đang chờ duyệt',
          class: 'Lớp',
          pendingRequestsCount: 'Số lượng đang chờ duyệt',
          acceptButton: 'Chấp nhận',
          rejectButton: 'Từ chối',
          noPendingRequests: 'Không có yêu cầu nào đang chờ duyệt',
          status: 'Đang chờ duyệt',
          timeRequest: 'Yêu cầu lúc '
        }
      },
      students: {
        title: 'Quản lí học sinh',
        description: 'Xem và quản lí học sinh trong lớp học của bạn',
        filter: {
          title: 'Chọn lớp của bạn',
          placeholder: 'Chọn một lớp học'
        },
        searchOrSortOrFilter: {
          search: {
            title: 'Tìm kiếm học sinh trong lớp',
            searchFieldPlaceholder: 'Tìm kiếm theo tên học sinh',
            searchButton: 'Tìm kiếm',
            resetButton: 'Đặt lại'
          },
          sort: {
            sortItems: {
              title: 'Sắp xếp theo',
              fieldName: 'Tên',
              fieldEmail: 'Email',
              fieldJoinedAt: 'Ngày tham gia'
            },
            order: {
              title: 'Thứ tự',
              asc: 'Tăng dần',
              desc: 'Giảm dần'
            }
          }
        },
        tableView: {
          title: 'Danh sách học sinh',
          description: 'Lớp:',
          columnNo: 'STT',
          columnName: 'Họ và tên',
          columnEmail: 'Email',
          columnStatus: 'Trạng thái',
          columnDateJoined: 'Ngày tham gia',
          columnActions: 'Các thao tác',
          noData: 'Không có học sinh nào để hiển thị',
          requestToChooseClass:
            'Hãy chọn một lớp để có thể xem danh sách học sinh.',
          buttonViewDeactivatedStudents: 'Xem HS bị khóa'
        },
        banStudent: {
          title: 'Khóa học sinh',
          description:
            'Bạn có chắc muốn khóa học sinh này khỏi lớp học này không?'
        },
        viewBannedStudents: {
          title: 'Danh sách các học sinh bị khóa',
          description: 'Giáo viên có thể mở khóa cho học sinh',
          columnNo: 'STT',
          columnName: 'Họ và tên',
          columnEmail: 'Email',
          columnDateJoined: 'Ngày tham gia',
          columnActions: 'Các thao tác',
          noData: 'Không có học sinh nào bị khóa',
          unbanButton: 'Mở khóa'
        }
      },
      assignments: {
        overview: {
          title: 'Quản lí bài tập của bạn',
          description:
            'Tạo và quản lí các bài tập của bạn, và xem kết quả làm bài',
          viewAIInstruction: {
            buttonContent: 'Làm thế nào để tạo bài tập với AI?',
            title: 'Hướng dẫn tạo bài tập với AI',
            description: 'Sử dụng AI để tạo nhanh các bài tập chất lượng!'
          },
          createAssignmentButton: 'Tạo bài tập',
          tableView: {
            title: 'Danh sách bài tập',
            description: 'Tất cả các bài tập bạn đã tạo',
            columnTitle: 'Tiêu đề',
            columnDescription: 'Mô tả',
            columnClass: 'Lớp được giao',
            columnNumberOfQuestions: 'Số lượng câu hỏi',
            columnCreatedDate: 'Ngày tạo',
            columnDueDate: 'Hạn nộp',
            columnIsPublic: 'Công khai',
            columnIsActive: 'Trạng thái',
            columnActions: 'Hành động'
          },
          searchOrSortOrFilter: {
            search: {
              title: 'Tìm kiếm bài tập',
              searchFieldPlaceholder: 'Tìm kiếm theo tên bài tập',
              searchButton: 'Tìm kiếm',
              resetButton: 'Đặt lại'
            },
            sort: {
              sortItems: {
                title: 'Sắp xếp theo',
                fieldTitle: 'Tiêu đề',
                fieldNumberOfQuestions: 'Số lượng câu hỏi',
                fieldDueDate: 'Hạn nộp bài tập',
                fieldCreatedDate: 'Ngày tạo bài tập'
              },
              order: {
                title: 'Thứ tự',
                asc: 'Tăng dần',
                desc: 'Giảm dần'
              }
            }
          }
        },
        editAssignment: {
          title: 'Chỉnh sửa bài tập',
          description: 'Cập nhật thông tin và cấu hình bài tập',
          tabEdit: {
            title: 'Chỉnh sửa bài tập'
          },
          tableViewPreview: {
            title: 'Xem trước bài tập chỉnh sửa'
          },
          tabStudentResults: {
            title: 'Kết quả học sinh'
          },
          tabChatWithAI: {
            title: 'Lịch sử trò chuyện với AI'
          }
        },
        createAssignment: {
          title: 'Tạo bài tập mới',
          description:
            'Tự do tạo bài tập theo nhu cầu của bạn và năng lực của học sinh',

          tabAssignmentInfo: {
            title: 'Thông tin bài tập',
            fieldAssignmentName: 'Tên bài tập',
            fieldAssignmentNamePlaceholder:
              'Ví dụ: Bài tập về thì hiện tại đơn',
            fieldClass: 'Giao cho lớp',
            fieldClassPlaceholder: 'Chọn lớp để giao bài tập',
            fieldDeadline: 'Hạn nộp',
            fieldDescription: 'Mô tả',
            fieldDescriptionPlaceholder: 'Nhập mô tả bài tập tại đây'
          },

          tabAssignmentConfig: {
            title: 'Cấu hình bài tập',
            fieldIsPublic: 'Công khai bài tập',
            fieldIsPublicDescription:
              'Nếu bật, học sinh ngoài lớp vẫn có thể truy cập bài tập',
            fieldOneAttempt: 'Chỉ cho phép làm một lần',
            fieldOneAttemptDescription:
              'Nếu bật, học sinh chỉ được làm bài một lần duy nhất',
            fieldCanViewResult: 'Cho phép xem kết quả',
            fieldCanViewResultDescription:
              'Nếu bật, học sinh có thể xem kết quả sau khi nộp bài'
          },
          tabEditCOntentFromAI: {
            title: 'Chỉnh sửa nội dung bài tập'
          },
          tabViewPreview: {
            title: 'Xem trước bài tập'
          },
          tabChatWithAI: {
            title: 'Trò chuyện với AI để tạo bài tập',
            description:
              'Sử dụng AI để tạo nhanh các bài tập chất lượng, không cần mất thời gian soạn đề. Chỉ cần cung cấp một số thông tin cơ bản và để AI lo phần còn lại!'
          },
          moveNextTabButton: 'Tạo câu hỏi cho bài kiểm tra',
          moveNextTabButtonWithAI: 'Sang tab "Chat với AI" để tạo nội dung'
        },
        chooseTypeOfAssignmentCreation: {
          title: 'Chọn cách tạo bài tập',
          manually: 'Tạo thủ công',
          withAI: 'Tạo với AI'
        },
        chatWithAISession: {
          initialChatAIMessage:
            'Chào mừng bạn đến với phiên trò chuyện với AI để tạo bài tập! Hãy cung cấp cho tôi một số thông tin cơ bản về bài tập bạn muốn tạo, và tôi sẽ giúp bạn soạn đề nhanh chóng và dễ dàng.',
          AILoadingMessage:
            'Đang kết nối với AI để tạo bài tập cho bạn, vui lòng chờ trong giây lát...',
          chatMessageFieldPlaceholder: 'Nhập thông tin về bài tập bạn muốn tạo'
        },
        createQuestionsAndTasks: {
          createTask: {
            title: 'Danh sách phần lớn',
            addTaskButton: 'Thêm phần mới',
            fieldTaskTypeDropdown: 'Chọn loại bài tập',
            fieldTaskTypeDropdownValue: {
              PRONUNCIATION: 'Phát âm',
              WORD_STRESS: 'Nhấn âm',
              SITUATIONAL_DIALOG: 'Đoạn hội thoại tình huống',
              MULTIPLE_CHOICE: 'Trắc nghiệm ngữ pháp/từ vựng/viết lại câu',
              CLOZE_PASSAGE: 'Đoạn văn đục lỗ',
              READING_COMPREHENSION: 'Đọc hiểu đoạn văn'
            },
            fieldTaskDescription: 'Đề bài cho phần này',
            fieldTaskDescriptionPlaceholder: 'Nhập đề bài cho phần này'
          },

          createQuestion: {
            deleteButton: 'Xóa câu hỏi này',
            questionList: {
              title: 'Danh sách câu hỏi',
              addQuestionButton: 'Thêm câu hỏi'
            },
            title: 'Tạo câu hỏi mới',
            questionContent: 'Nội dung câu hỏi',
            questionContentPlaceholder: 'Nhập nội dung câu hỏi tại đây',
            choice: {
              title: 'Các đáp án',
              addChoiceButton: 'Thêm đáp án',
              deleteChoiceButton: 'Xóa đáp án',
              choiceNo: 'Đáp án ',
              choicePlaceholder: 'Nhập nội dung của phương án'
            },
            clozeTest: {
              title: 'Nhập đoạn văn cho bài đục lỗ',
              passagePlaceholder:
                'Nhập nội dung đoạn văn. Dùng {{blank}} để đánh dấu chỗ trống cần điền.'
            },
            readingComprehensionTest: {
              title: 'Nhập đoạn văn đọc hiểu',
              passagePlaceholder:
                'Nhập nội dung đoạn văn. Các câu hỏi sẽ dựa trên đoạn này.'
            }
          }
        },
        previewAssignment: {
          title: 'Xem trước bài tập',
          dueDate: 'Hạn nộp: ',
          isPublic: 'Công khai',
          isSingleAttempt: 'Chỉ được làm một lần',
          task: 'Phần',
          passage: 'Đoạn văn',
          question: 'Câu',
          isCorrect: 'Đáp án đúng',
          summary: 'Tổng cộng',
          summaryQuestions: 'câu hỏi'
        }
      },
      results: {
        title: 'Kết quả làm bài của học sinh',
        description: 'Quản lý và xem chi tiết kết quả làm bài của học sinh',
        statistic: {
          totalSubmiitedCount: 'Tổng số học sinh đã nộp bài',
          totalNotSubmittedCount: 'Tổng số học sinh chưa nộp bài',
          highestCorrectCount: 'Số câu đúng cao nhất',
          highestCorrectStudentName: 'Học sinh có kết quả cao nhất'
        },
        filters: {
          class: {
            title: 'Chọn lớp'
          },
          assignment: {
            title: 'Chọn bài tập'
          }
        },
        tableView: {
          title: 'Danh sách kết quả học sinh',
          columnName: 'Tên học sinh',
          columnEmail: 'Email',
          columnLatestResult: 'Kết quả gần nhất',
          columnHighestResult: 'Kết quả cao nhất',
          columnSubmittedCount: 'Số lần nộp bài',
          columnSubmittedDate: 'Ngày nộp gần nhất',
          columnActions: 'Thao tác'
        },
        viewAssignmentResultDetails: {
          statistic: {
            labelClass: 'Lớp',
            labelClassCode: 'Mã lớp',
            labelStudent: 'Học sinh',
            labelEmail: 'Email',
            labelDueDate: 'Hạn nộp',
            labelSubmissionCount: 'Số lần nộp bài'
          }
        },
        chatWithAI: {
          title: 'Trò chuyện với AI về kết quả làm bài, hoặc hệ thống',
          recentChats: 'Các cuộc trò chuyện gần đây',
          textInputPlaceholder:
            'Nhắn tin cho AI về kết quả làm bài hoặc hệ thống',
          newChatSessionButton: 'Tạo phiên trò chuyện mới'
        }
      },
      trashBin: {
        title: 'Thùng rác cho các mục đã xóa của bạn',
        description:
          'Quản lí các mục đã xóa. Bạn có thể khôi phục hoặc xóa vĩnh viễn',
        searchOrSortOrFilter: {
          filter: {
            title: 'Lọc theo loại',
            class: 'Lớp học',
            assignment: 'Bài tập'
          },
          search: {
            title: 'Tìm kiếm trong thùng rác',
            searchFieldPlaceholder: 'Tìm theo tên hoặc mô tả',
            searchButton: 'Tìm kiếm',
            resetButton: 'Đặt lại'
          },
          sort: {
            sortItems: {
              title: 'Sắp xếp theo',
              fieldTitle: 'Tên',
              fieldDescription: 'Mô tả',
              fieldDeletedDate: 'Ngày xoá'
            },
            order: {
              title: 'Thứ tự',
              asc: 'Tăng dần',
              desc: 'Giảm dần'
            }
          }
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
      classes: {
        searchOrSortOrFilter: {
          search: {
            title: 'Tìm kiếm',
            searchFieldPlaceholder: 'Tìm kiếm theo tên lớp hoặc mã lớp',
            searchButton: 'Tìm kiếm',
            resetButton: 'Đặt lại'
          },
          sort: {
            sortItems: {
              title: 'Sắp xếp theo',
              fieldClassName: 'Tên lớp',
              fieldStudentCount: 'Số học sinh',
              fieldTeacherName: 'Tên giáo viên',
              fieldClassCode: 'Mã lớp'
            },
            order: {
              title: 'Thứ tự',
              asc: 'Tăng dần',
              desc: 'Giảm dần'
            }
          }
        },
        title: 'Lớp học của tôi',
        description: 'Danh sách các lớp học bạn đang tham gia',
        buttonJoinClass: {
          buttonName: 'Tham gia lớp',
          title: 'Tham gia lớp học mới',
          description:
            'Nhập mã lớp do giáo viên cung cấp để tham gia lớp học mới',
          fieldClassCode: 'Mã lớp học',
          fieldClassCodePlaceholder: 'Ví dụ: ABC123',
          note: 'Bạn cần mã lớp để tham gia. Vui lòng liên hệ giáo viên của bạn để lấy mã lớp.',
          joinButton: 'Tham gia',
          isJoining: 'Đang tham gia...'
        },
        buttonViewRequests: {
          buttonName: 'Lịch sử yêu cầu',
          title: 'Lịch sử yêu cầu tham gia',
          description:
            'Theo dõi danh sách yêu cầu đã gửi và trạng thái phê duyệt.',
          noRequests: 'Bạn chưa gửi yêu cầu nào để tham gia lớp học.',
          columnClassCode: 'Mã lớp',
          columnTimeRequest: 'Thời gian yêu cầu',
          columnStatus: 'Trạng thái'
        },
        gridViewport: {
          fieldTeacherName: 'Tên giáo viên',
          fieldStudentNumber: 'Số học sinh',
          fieldClassCode: 'Mã lớp',
          fieldClassStatus: 'Trạng thái lớp'
        },
        tableViewport: {
          title: 'Danh sách các lớp học',
          description: 'Các lớp học bạn đang tham gia',
          columnClassName: 'Tên lớp',
          columnTeacherName: 'Tên giáo viên',
          columnStudentNumber: 'Số học sinh',
          columnClassCode: 'Mã lớp',
          columnClassStatus: 'Trạng thái lớp',
          columnActions: 'Các thao tác'
        },
        viewClassMembersList: {
          title: 'Danh sách thành viên lớp học - Lớp: ',
          description: 'Danh sách các thành viên trong lớp học của bạn',
          fieldSearch: 'Tìm kiếm theo họ và tên, email hoặc số điện thoại...',
          fieldSearchPlaceholder: 'Nhập từ khóa tìm kiếm',
          fieldSortBy: 'Sắp xếp theo',
          sortNameAsc: 'Tên: A đến Z',
          sortNameDesc: 'Tên: Z đến A',
          sortJoinedAtAsc: 'Ngày tham gia: Cũ nhất trước',
          sortJoinedAtDesc: 'Ngày tham gia: Mới nhất trước',
          columnNo: 'STT',
          columnName: 'Họ và tên',
          columnEmail: 'Email',
          columnPhoneNumber: 'Số điện thoại',
          columnDateJoined: 'Ngày tham gia',
          noData: 'Không có dữ liệu để hiển thị'
        },
        viewBannedClasses: {
          buttonName: 'Lớp học bị khóa',
          title: 'Danh sách các lớp học bị khóa',
          description: 'Bạn không còn quyền truy cập vào các lớp này!',
          columnClassName: 'Tên lớp',
          columnTeacherName: 'Tên giáo viên',
          columnClassCode: 'Mã lớp',
          columnBannedDate: 'Ngày bị cấm',
          noData: 'Bạn không bị cấm tham gia lớp học nào'
        }
      },
      assignments: {
        overview: {
          searchOrSortOrFilter: {
            search: {
              title: 'Tìm kiếm bài tập',
              searchFieldPlaceholder:
                'Tìm kiếm theo tiêu đề của bài tập/tên lớp học',
              searchButton: 'Tìm kiếm',
              resetButton: 'Đặt lại'
            },
            sort: {
              sortItems: {
                title: 'Sắp xếp theo',
                fieldAssignmentTitle: 'Tiêu đề bài tập',
                fieldClassName: 'Tên lớp học',
                fieldQuestionCount: 'Số câu hỏi',
                fieldDueDate: 'Hạn nộp'
              },
              order: {
                title: 'Thứ tự',
                asc: 'Tăng dần',
                desc: 'Giảm dần'
              }
            }
          },
          title: 'Bài tập của tôi',
          description:
            'Làm bài tập và luyện tập tiếng Anh để cải thiện kỹ năng của mình',
          tableView: {
            title: 'Danh sách bài tập',
            columnAssignmentTitle: 'Tiêu đề',
            columnClass: 'Lớp',
            columnNumberOfQuestions: 'Số câu hỏi',
            columnIsSingleAttempt: 'Có thể làm nhiều lần',
            columnDueDate: 'Hạn nộp',
            columnStatus: 'Trạng thái',
            columnResult: 'Kết quả',
            columnActions: 'Các thao tác',
            columnDoAssignmentButton: 'Làm ngay',
            columnContinueAssignmentButton: 'Tiếp tục',
            columnSubmittedAssignmentButton: 'Đã nộp',
            statusAssigned: 'Được giao',
            statusInProgress: 'Đang làm',
            statusSubmitted: 'Đã làm',
            scoreFormat: '{{correctCount}}/{{totalCount}} đúng',
            singleAttemptWarning: 'Bài tập này chỉ cho phép nộp một lần'
          }
        },
        takeAssignment: {
          submitButton: 'Nộp bài',
          answerList: {
            title: 'Danh sách câu trả lời',
            currentQuestion: 'Câu hỏi hiện tại',
            markedQuestion: 'Câu hỏi đã đánh dấu',
            previousButton: 'Câu hỏi trước',
            nextButton: 'Câu hỏi tiếp theo'
          },
          submitConfirmation: {
            title: 'Xác nhận nộp bài',
            description: 'Bạn có chắc chắn muốn nộp bài tập này không?',
            submitButton: 'Nộp bài',
            continueButton: 'Tiếp tục làm bài'
          },
          answerReview: {
            title: 'Kết quả của bạn',
            correct: 'đúng',
            total: 'tổng',
            allowToViewResult: {
              title: 'Kết quả bài tập',
              tabsView: {
                total: 'Tổng',
                correct: 'Đúng',
                incorrect: 'Sai'
              }
            },
            notAllowToViewResult: {
              title: 'Đã nộp bài',
              description:
                'Bài tập của bạn đã được nộp thành công. Bạn có thể xem kết quả sau khi giáo viên chấm xong.',
              details: {
                totalAnsweredQuestions: 'Tổng số câu đã trả lời:',
                totalQuestions: 'Tổng số câu hỏi:',
                totalCorrectAnswers: 'Tổng số câu trả lời đúng:'
              }
            }
          }
        },
        viewHistory: {
          searchOrSortOrFilter: {
            search: {
              title: 'Tìm kiếm bài tập',
              searchFieldPlaceholder:
                'Tìm kiếm theo tiêu đề của bài tập/tên lớp học',
              searchButton: 'Tìm kiếm',
              resetButton: 'Đặt lại'
            },
            sort: {
              sortItems: {
                title: 'Sắp xếp theo',
                fieldAssignmentTitle: 'Tiêu đề bài tập',
                fieldClassName: 'Tên lớp học',
                fieldSubmittedDate: 'Ngày nộp bài',
                fieldTotalTime: 'Thời gian làm bài'
              },
              order: {
                title: 'Thứ tự',
                asc: 'Tăng dần',
                desc: 'Giảm dần'
              }
            }
          },
          title: 'Lịch sử bài tập của tôi',
          description:
            'Xem lại các bài tập đã làm và kết quả để theo dõi tiến trình học tập của bạn',
          searchPlaceholder: 'Tìm kiếm theo tiêu đề của bài tập...',
          tableView: {
            columnAssignmentTitle: 'Tiêu đề của bài tập',
            columnClass: 'Lớp',
            columnIsSingleAttempt: 'Chỉ được làm một lần',
            columnResult: 'Kết quả',
            columnSubmittedAt: 'Ngày nộp',
            columnTotalTime: 'Thời gian tổng cộng',
            columnStatus: 'Trạng thái',
            columnActions: 'Các thao tác',
            actionDescriptionViewDetails: 'Xem chi tiết'
          }
        },
        viewHistoryDetails: {
          assignmentInfo: {
            title: 'Thông tin bài tập',
            statistic: {
              assignmentTitle: 'Tên bài tập',
              assignmentTotalAttempts: 'Tổng số lượt làm',
              assignmentDeadline: 'Hạn nộp'
            }
          },
          assginmentHistory: {
            title: 'Lịch sử làm bài',
            tableView: {
              columnAttempt: 'Lần làm',
              columnStatus: 'Trạng thái',
              columnStartedAt: 'Thời gian bắt đầu',
              columnSubmittedAt: 'Thời gian nộp bài',
              columnTotalTime: 'Tổng thời gian',
              columnTotalAssignmentQuestions: 'Tổng số câu hỏi',
              columnResult: 'Kết quả'
            }
          },
          assignmentHistoryDetails: {
            title: 'Chi tiết lần làm bài',
            result: 'Số câu trả lời đúng',
            submittedAt: 'Thời gian nộp bài',
            question: 'Câu hỏi'
          }
        }
      },
      progress: {
        title: 'Tiến độ học tập',
        description:
          'Theo dõi tiến độ học tập của bạn và xem sự cải thiện theo thời gian thông qua các thống kê và biểu đồ chi tiết',
        overallStatistic: {
          fieldTotalCompletedAssignments: 'Tổng số bài tập đã hoàn thành',
          fieldTotalCompletedQuestion: 'Tổng số câu hỏi đã làm',
          fieldHighestTaskType: 'Loại bài tập làm tốt nhất',
          fieldLowestTaskType: 'Loại bài tập cần cải thiện'
        },
        monthlyProgress: {
          title: 'Biểu đồ số câu trả lời đúng theo tháng',
          totalQuestions: 'Tổng số câu hỏi',
          correctAnswers: 'Số câu trả lời đúng'
        },
        taskTypeProgress: {
          title: 'Biểu đồ số câu trả lời đúng theo từng loại bài tập',
          totalQuestions: 'Tổng số câu hỏi',
          correctAnswers: 'Số câu trả lời đúng'
        }
      },
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

    // Navigation bar
    navRoles: {
      student: {
        class: 'Lớp học của tôi',
        assignment: 'Làm bài tập',
        history: 'Lịch sử bài tập',
        progress: 'Tiến độ học tập',
        settings: 'Cài đặt'
      },
      teacher: {
        overview: 'Tổng quan',
        classes: 'Quản lí lớp học',
        students: 'Quản lí học sinh',
        assignments: 'Quản lí câu hỏi',
        results: 'Kết quả học tập',
        trashBin: 'Thùng rác',
        settings: 'Cài đặt tài khoản'
      }
    },

    // Common
    common: {
      active: 'Hoạt động',
      inactive: 'Không hoạt động',
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
      viewPort: 'Chọn chế độ hiển thị',
      close: 'Đóng',
      pagination: {
        label: 'Số kết quả / trang',
        previous: 'Trang trước',
        next: 'Trang sau',
        total: 'Tổng số lượng:'
      },
      deleteConfirmation:
        'Hành động xóa này không thể hoàn tác. Bạn có chắc chắn muốn tiếp tục?',
      yes: 'Có',
      no: 'Không',
      confirm: 'Xác nhận',
      back: 'Quay lại',
      understandLabel: 'Tôi đã hiểu'
    }
  }
};

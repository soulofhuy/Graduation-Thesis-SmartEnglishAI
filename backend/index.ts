import 'dotenv/config';
import cors from 'cors';
import express, { Request, Response } from 'express';
import AuthRouter from './src/routes/authRoutes';
import ProfileRouter from './src/routes/profileRoutes';
import ClassTeacherRouter from './src/routes/classTeacherRoutes';
import ClassStudentRouter from './src/routes/classStudentRoutes';
import ClassRouter from './src/routes/classRoutes';
import StudentRouter from './src/routes/studentRoutes';
import AssignmentRouter from './src/routes/assignmentTeacherRoutes';
import AssignmentStudentRouter from './src/routes/assignmentStudentRoutes';
import AttemptRouter from './src/routes/attemptRoutes';
import ViewStudyProgressRouter from './src/routes/students/viewStudyProgressRoutes';
import ViewClassProgressOnAssignmentsRouter from './src/routes/teachers/viewClassProgressOnAssignmentsRoutes';
import ViewOverviewStatisticRouter from './src/routes/teachers/viewOverviewStatisticRoutes';
import AdminOverviewRouter from './src/routes/admin/overview/overviewRoutes';
import UserManagementRouter from './src/routes/admin/userManagement/userManagementRoutes';
import GetAllClassesRouter from './src/routes/admin/classManagement/getAllClassesRoutes';
import CreateNewClassesRouter from './src/routes/admin/classManagement/createNewClassesRoutes';
import AIGenerateAssignmentRouter from './src/routes/ai/generate-assignment/aiGenerateAssignmentRoutes';
import AIChatSessionRouter from './src/routes/ai/chat-session/aiChatSessionRoutes';
import GetAllAssignmentsRouter from './src/routes/admin/assignmentManagement/getAllAssignmentRoutes';
import DeleteAssignmentRouter from './src/routes/admin/assignmentManagement/deleteAssignmentRoutes';
import Responses from './src/utils/responses';

const app = express();

app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

app.use(express.json());
app.use('/api', AuthRouter);
app.use('/api', ProfileRouter);
app.use('/api', ClassStudentRouter);
app.use('/api', ClassTeacherRouter);
app.use('/api', ClassRouter);
app.use('/api', StudentRouter);
app.use('/api', AssignmentRouter);
app.use('/api', AssignmentStudentRouter);
app.use('/api', AttemptRouter);
app.use('/api', ViewStudyProgressRouter);
app.use('/api', ViewClassProgressOnAssignmentsRouter);
app.use('/api', ViewOverviewStatisticRouter);
app.use('/api', AdminOverviewRouter);
app.use('/api', UserManagementRouter);
app.use('/api', GetAllClassesRouter);
app.use('/api', CreateNewClassesRouter);
app.use('/api', GetAllAssignmentsRouter);
app.use('/api', DeleteAssignmentRouter);
app.use('/api', AIGenerateAssignmentRouter);
app.use('/api', AIChatSessionRouter);
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST;

app.listen(PORT, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
});

app.get('/', (req: Request, res: Response) => {
  res.json(
    Responses.successResponse('Welcome to the Smart English AI backend!', null)
  );
});

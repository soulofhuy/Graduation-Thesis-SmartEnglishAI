import 'dotenv/config';
import cors from 'cors';
import express, { Request, Response } from 'express';
import AuthRouter from './src/routes/authRoutes';
import ProfileRouter from './src/routes/profileRoutes';
import ClassTeacherRouter from './src/routes/classTeacherRoutes';
import ClassStudentRouter from './src/routes/classStudentRoutes';
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

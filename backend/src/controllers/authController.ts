import AuthService from '../services/authServices';
import { Request, Response } from 'express';
import Responses from '../utils/responses';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';

class AuthController {
  static register = async (req: Request, res: Response) => {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res
        .status(400)
        .json(
          Responses.errorResponse(
            new Error('Email, password, and role are required')
          )
        );
    }

    try {
      const user = await AuthService.registerUser(email, password, role);
      return res
        .status(201)
        .json(Responses.successResponse('User registered successfully', user));
    } catch (error) {
      return res.status(400).json(Responses.errorResponse(error));
    }
  };

  static login = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    try {
      const { user, token } = await AuthService.loginUser(email, password);
      return res
        .status(200)
        .json(Responses.successResponse('Login successful', { user, token }));
    } catch (error) {
      return res.status(400).json(Responses.errorResponse(error));
    }
  };

  static changePassword = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.userId;
    const { currentPassword, newPassword } = req.body;

    if (!userId || !currentPassword || !newPassword) {
      return res
        .status(400)
        .json(
          Responses.errorResponse(
            new Error(
              'User ID, current password, and new password are required'
            )
          )
        );
    }

    try {
      await AuthService.changePassword(userId, currentPassword, newPassword);
      return res
        .status(200)
        .json(Responses.successResponse('Password changed successfully'));
    } catch (error) {
      return res.status(400).json(Responses.errorResponse(error));
    }
  };

  static deactivateUser = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.userId;
    try {
      await AuthService.deactivateUser(userId || '');
      return res
        .status(200)
        .json(Responses.successResponse('User deactivated successfully'));
    } catch (error) {
      return res.status(400).json(Responses.errorResponse(error));
    }
  };
}

export default AuthController;

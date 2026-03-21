import AuthService from '../services/authServices';
import { Request, Response } from 'express';

class AuthController {
  static register = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'Email and password are required' });
    }

    try {
      const user = await AuthService.registerUser(email, password);
      return res
        .status(201)
        .json({ message: 'User registered successfully', user });
    } catch (error) {
      res.status(400).json({ message: 'Registration failed', error });
    }
  };

  static login = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    try {
      const { user, token } = await AuthService.loginUser(email, password);
      return res.status(200).json({ message: 'Login successful', user, token });
    } catch (error) {
      res.status(400).json({ message: 'Login failed', error });
    }
  };
}

export default AuthController;

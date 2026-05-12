import { Response } from 'express';
import { AuthenticatedRequest } from '../../../middlewares/authMiddleware';
import Responses from '../../../utils/responses';
import { getAdminOverview } from '../../../services/admin/overview/overviewServices';

class AdminOverviewController {
  static getAdminOverview = async (
    req: AuthenticatedRequest,
    res: Response
  ) => {
    const yearQuery = req.query.year;
    const year =
      typeof yearQuery === 'string' && !Number.isNaN(Number(yearQuery))
        ? Number(yearQuery)
        : undefined;

    try {
      const overview = await getAdminOverview(year);

      return res
        .status(200)
        .json(
          Responses.successResponse(
            'Admin overview fetched successfully',
            overview
          )
        );
    } catch (error) {
      return res.status(400).json(Responses.errorResponse(error));
    }
  };
}

export default AdminOverviewController;

import { Router } from 'express';
import healthRoutes from './health.routes.js';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import coupleRoutes from './couple.routes.js';
import artworkRoutes from './artwork.routes.js';
import syncRoutes from './sync.routes.js';

const apiRouter = Router();

apiRouter.use('/health', healthRoutes);
apiRouter.use('/auth', authRoutes);
apiRouter.use('/users', userRoutes);
apiRouter.use('/couples', coupleRoutes);
apiRouter.use('/artworks', artworkRoutes);
apiRouter.use('/sync', syncRoutes);

export default apiRouter;

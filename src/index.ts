import express from 'express';
const app = express();
import dotenv from 'dotenv';
dotenv.config();
import helmet from 'helmet';
import cors from 'cors';
// Import routes
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import morganMiddleware from '@middlewares/morganMiddleware';
import indexRouter from '@routes/indexRouter';
import loggerRouter from '@routes/loggerRouter';
import mongoSanitaize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import errorHandler from '@middlewares/errorHandler';
import authRoutes from '@routes/authRoute';
import userRoutes from '@routes/userRoute';
import taskRoutes from '@routes/taskRoute';
// import path from 'path';
import cookierParser from 'cookie-parser';
import bodyParser from 'body-parser';
import connectToDatabase from '@libs/dbConnection';
import Logger from '@libs/logger';
app.set('trust proxy', 1); // trust first proxy

// Connect to the database
connectToDatabase();

// Set the application Port
const port = parseInt(process.env.PORT_API_SERVER as string) || 3500;

// MIDLEWARES
// Add JSON middleware to parse incoming requests
app.use(express.json());
// Use Helmet to secure Express app by setting various HTTP headers
app.use(helmet());
// Limit Size of Request Body
app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '5mb' }));
// Cookier Parser
app.use(cookierParser());
// Enable CORS with various options
app.use(cors());
// Prevent noSQL Injection
app.use(mongoSanitaize());
// Use Morgan middleware for logging requests
app.use(morganMiddleware);
// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use(limiter);
// ROUTES
//route middleware
app.use('/', indexRouter);
app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api/v1', taskRoutes);
app.use('/api/logger', loggerRouter);
// Error 404 custom
// app.all('*', (req, res, next) => {
//   res.status(404).json({
//     success: false,
//     message: '404 - Unable to find the requested resource!',
//   });
//   next();
// });
// Error Handler
app.use(errorHandler);

// Swagger configuration options
const swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: 'Typescript CRUD - API',
      version: '1.0.0',
      description: 'API documentation for my Typescript CRUD application',
    },
  },
  apis: ['./src/routes/*.ts'], // Path to the API docs
};

const swaggerDocs = swaggerJSDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Start the server and export the server instance
const server = app.listen(port, () => {
  Logger.info(`Server is running on port:${port}`);
});

// Export both the app and the server for testing later
export { app, server };

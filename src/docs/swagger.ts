import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "InterviewMint API",
      version: "1.0.0",
    },
    servers: [
      {
        url: "/api/v1",
        description: "Development API version",
      },
    ],
  },
  // Use project-root based glob so swagger-jsdoc finds route annotations
  apis: ["src/routes/**/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
export const swaggerUiMiddleware = swaggerUi;

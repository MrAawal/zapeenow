// routes/user.js
import { 
  updateUser, 
  getUserDetails, 
  updateLocation,
  getNearestBranch,
  getAllBranches 
} from '../controllers/tracking/user.js';
import { verifyToken } from '../middleware/auth.js';

// Validation schemas
const locationSchema = {
  body: {
    type: 'object',
    required: ['latitude', 'longitude'],
    properties: {
      latitude: { 
        type: 'number',
        minimum: -90,
        maximum: 90
      },
      longitude: { 
        type: 'number',
        minimum: -180,
        maximum: 180
      },
      address: { type: 'string', maxLength: 500 }
    }
  }
};

const updateUserSchema = {
  body: {
    type: 'object',
    properties: {
      name: { type: 'string', minLength: 2, maxLength: 100 },
      phone: { type: 'number' },
      address: { type: 'string', maxLength: 500 },
      liveLocation: {
        type: 'object',
        properties: {
          latitude: { type: 'number', minimum: -90, maximum: 90 },
          longitude: { type: 'number', minimum: -180, maximum: 180 }
        }
      },
      // Delivery partner specific
      isAvailable: { type: 'boolean' }
    }
  }
};

const branchQuerySchema = {
  querystring: {
    type: 'object',
    required: ['latitude', 'longitude'],
    properties: {
      latitude: { type: 'string' }, // Query params are strings
      longitude: { type: 'string' }
    }
  }
};

export const userRoutes = async (fastify, options) => {
  
  // ===== USER PROFILE ROUTES =====
  
  // Get current user details with branch info
  // GET /api/user
  fastify.get('/user', { 
    preHandler: [verifyToken],
    schema: {
      description: 'Get current user details with branch information',
      tags: ['user'],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            user: { type: 'object' }
          }
        }
      }
    }
  }, getUserDetails);

  // Update user profile (name, phone, etc.)
  // PATCH /api/user
  fastify.patch('/user', { 
    preHandler: [verifyToken],
    schema: {
      ...updateUserSchema,
      description: 'Update user profile information',
      tags: ['user'],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            user: { type: 'object' }
          }
        }
      }
    }
  }, updateUser);

  // ===== LOCATION ROUTES =====

  // Update customer location and auto-assign branch
  // POST /api/user/location
  fastify.post('/user/location', { 
    preHandler: [verifyToken],
    schema: {
      ...locationSchema,
      description: 'Update customer location and automatically assign nearest available branch',
      tags: ['user', 'location'],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            user: { type: 'object' },
            branchInfo: { type: 'object' }
          }
        }
      }
    }
  }, updateLocation);

  // ===== BRANCH DISCOVERY ROUTES =====

  // Get nearest branch for current user
  // GET /api/user/nearest-branch
  fastify.get('/user/nearest-branch', { 
    preHandler: [verifyToken],
    schema: {
      description: 'Get nearest branch based on user current location',
      tags: ['user', 'branch'],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            nearestBranch: { type: 'object' },
            availableBranches: { type: 'array' },
            allBranches: { type: 'array' },
            summary: { type: 'object' }
          }
        }
      }
    }
  }, getNearestBranch);

  // Get all branches with distances from a location
  // GET /api/user/branches?latitude=12.34&longitude=56.78
  fastify.get('/user/branches', { 
    preHandler: [verifyToken],
    schema: {
      ...branchQuerySchema,
      description: 'Get all branches with calculated distances from specified location',
      tags: ['user', 'branch'],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            branches: { type: 'array' },
            count: { type: 'number' }
          }
        }
      }
    }
  }, getAllBranches);

  // ===== ERROR HANDLER =====
  fastify.setErrorHandler((error, request, reply) => {
    // Handle validation errors
    if (error.validation) {
      return reply.status(400).send({
        success: false,
        message: 'Validation error',
        errors: error.validation.map(err => ({
          field: err.params?.missingProperty || err.instancePath.replace('/', ''),
          message: err.message
        }))
      });
    }

    // Handle other errors
    fastify.log.error(error);
    return reply.status(error.statusCode || 500).send({
      success: false,
      message: error.message || 'Internal server error'
    });
  });
};

export default userRoutes;
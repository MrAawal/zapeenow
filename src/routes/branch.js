// routes/branch.js
import Branch from '../models/branch.js';

// Helper function to calculate distance
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(value) {
  return value * Math.PI / 180;
}

export const branchRoutes = async (fastify, options) => {
  // Find nearest branch
  fastify.post('/branch/nearest', async (request, reply) => {
    try {
      const { latitude, longitude } = request.body;

      if (!latitude || !longitude) {
        return reply.status(400).send({
          success: false,
          message: 'Latitude and longitude are required',
        });
      }

      const branches = await Branch.find({ 
        isActive: true,
        isOnline: true 
      }).populate('deliveryPartners');

      if (branches.length === 0) {
        return reply.status(404).send({
          success: false,
          message: 'No active branches found',
        });
      }

      const branchesWithDistance = branches.map(branch => {
        const distance = calculateDistance(
          latitude,
          longitude,
          branch.location.latitude,
          branch.location.longitude
        );

        return {
          ...branch.toObject(),
          distance: parseFloat(distance.toFixed(2)),
        };
      });

      branchesWithDistance.sort((a, b) => a.distance - b.distance);
      const nearestBranch = branchesWithDistance[0];

      if (nearestBranch.distance > nearestBranch.deliveryRadius) {
        return reply.status(200).send({
          success: false,
          message: 'No branch available in your delivery area',
          nearestBranch: {
            name: nearestBranch.name,
            distance: nearestBranch.distance,
            deliveryRadius: nearestBranch.deliveryRadius,
          },
        });
      }

      return reply.send({
        success: true,
        branch: nearestBranch,
        message: 'Nearest branch found successfully',
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Internal server error',
        error: error.message,
      });
    }
  });

  // Get all branches with distances
  fastify.post('/branch/all-with-distance', async (request, reply) => {
    try {
      const { latitude, longitude } = request.body;

      if (!latitude || !longitude) {
        return reply.status(400).send({
          success: false,
          message: 'Latitude and longitude are required',
        });
      }

      const branches = await Branch.find({ isActive: true })
        .populate('deliveryPartners');

      const branchesWithDistance = branches.map(branch => {
        const distance = calculateDistance(
          latitude,
          longitude,
          branch.location.latitude,
          branch.location.longitude
        );

        return {
          ...branch.toObject(),
          distance: parseFloat(distance.toFixed(2)),
          isAvailable: distance <= branch.deliveryRadius && branch.isOnline,
        };
      });

      branchesWithDistance.sort((a, b) => a.distance - b.distance);

      return reply.send({
        success: true,
        branches: branchesWithDistance,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Internal server error',
        error: error.message,
      });
    }
  });

  // Get single branch by ID
  fastify.get('/branch/:branchId', async (request, reply) => {
    try {
      const { branchId } = request.params;

      const branch = await Branch.findById(branchId)
        .populate('deliveryPartners');

      if (!branch) {
        return reply.status(404).send({
          success: false,
          message: 'Branch not found',
        });
      }

      return reply.send({
        success: true,
        branch,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Internal server error',
        error: error.message,
      });
    }
  });

  // Toggle branch online/offline status (Admin only)
  fastify.patch('/branch/:branchId/toggle-status', async (request, reply) => {
    try {
      const { branchId } = request.params;
      const { isOnline } = request.body;

      const branch = await Branch.findByIdAndUpdate(
        branchId,
        { isOnline },
        { new: true }
      );

      if (!branch) {
        return reply.status(404).send({
          success: false,
          message: 'Branch not found',
        });
      }

      return reply.send({
        success: true,
        branch,
        message: `Branch is now ${isOnline ? 'online' : 'offline'}`,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Internal server error',
        error: error.message,
      });
    }
  });

  // Get all branches (Admin)
  fastify.get('/branch', async (request, reply) => {
    try {
      const branches = await Branch.find()
        .populate('deliveryPartners')
        .sort({ createdAt: -1 });

      return reply.send({
        success: true,
        branches,
        count: branches.length,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Internal server error',
        error: error.message,
      });
    }
  });
};

export default branchRoutes;
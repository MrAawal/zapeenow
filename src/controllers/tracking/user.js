import { Customer, DeliveryPartner } from "../../models/index.js";
import Branch from "../../models/branch.js";

// Helper function to calculate distance using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of Earth in kilometers
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

// Validate coordinates
function validateCoordinates(latitude, longitude) {
  const lat = parseFloat(latitude);
  const lon = parseFloat(longitude);
  
  if (isNaN(lat) || isNaN(lon)) {
    return { valid: false, message: "Invalid coordinates format" };
  }
  
  if (lat < -90 || lat > 90) {
    return { valid: false, message: "Latitude must be between -90 and 90" };
  }
  
  if (lon < -180 || lon > 180) {
    return { valid: false, message: "Longitude must be between -180 and 180" };
  }
  
  return { valid: true, latitude: lat, longitude: lon };
}

// Find and assign nearest branch to customer with availability check
async function assignNearestBranch(latitude, longitude, options = {}) {
  try {
    const { checkAvailability = true, minimumPartners = 1 } = options;

    // Get all active and online branches
    const branches = await Branch.find({ 
      isActive: true,
      isOnline: true 
    }).populate('deliveryPartners');

    if (branches.length === 0) {
      return { 
        success: false, 
        message: "No active branches available",
        branch: null 
      };
    }

    // Calculate distances and find nearest branch
    const branchesWithDistance = branches.map(branch => {
      const distance = calculateDistance(
        latitude,
        longitude,
        branch.location.latitude,
        branch.location.longitude
      );

      // Check if branch has available delivery partners
      const availablePartners = checkAvailability 
        ? branch.deliveryPartners.filter(partner => partner.isAvailable).length
        : branch.deliveryPartners.length;

      return {
        branch,
        distance: parseFloat(distance.toFixed(2)),
        availablePartners,
        isWithinRadius: distance <= branch.deliveryRadius,
        hasCapacity: availablePartners >= minimumPartners,
      };
    });

    // Sort by distance
    branchesWithDistance.sort((a, b) => a.distance - b.distance);

    // Find the first branch that meets all criteria
    const suitable = branchesWithDistance.find(
      b => b.isWithinRadius && (!checkAvailability || b.hasCapacity)
    );

    if (!suitable) {
      // Find the nearest branch even if it doesn't meet criteria (for info)
      const nearest = branchesWithDistance[0];
      
      let message = "No branch available in your delivery area.";
      if (!nearest.isWithinRadius) {
        message = `Nearest branch is ${nearest.distance}km away (max delivery radius: ${nearest.branch.deliveryRadius}km)`;
      } else if (checkAvailability && !nearest.hasCapacity) {
        message = "Nearest branch has no available delivery partners at the moment";
      }

      return {
        success: false,
        message,
        branch: null,
        nearestBranch: {
          name: nearest.branch.name,
          distance: nearest.distance,
          deliveryRadius: nearest.branch.deliveryRadius,
          availablePartners: nearest.availablePartners,
        }
      };
    }

    return {
      success: true,
      message: "Branch assigned successfully",
      branch: {
        branchId: suitable.branch._id,
        branchDetails: {
          name: suitable.branch.name,
          distance: suitable.distance,
          isOnline: suitable.branch.isOnline,
          availablePartners: suitable.availablePartners,
        },
      }
    };
  } catch (error) {
    console.error('Error assigning nearest branch:', error);
    return {
      success: false,
      message: "Error finding nearest branch",
      branch: null,
      error: error.message
    };
  }
}

export const updateUser = async (req, reply) => {
  try {
    const { userId } = req.user;
    const updateData = req.body;

    // Validate userId
    if (!userId) {
      return reply.status(401).send({ 
        message: "User ID not found in token",
        success: false 
      });
    }

    let user = await Customer.findById(userId) || await DeliveryPartner.findById(userId);

    if (!user) {
      return reply.status(404).send({ message: "User not found", success: false });
    }

    let UserModel;

    if (user.role === "Customer") {
      UserModel = Customer;

      // If customer is updating location, auto-assign nearest branch
      if (updateData.liveLocation?.latitude && updateData.liveLocation?.longitude) {
        // Validate coordinates
        const validation = validateCoordinates(
          updateData.liveLocation.latitude,
          updateData.liveLocation.longitude
        );

        if (!validation.valid) {
          return reply.status(400).send({
            message: validation.message,
            success: false,
          });
        }

        // Use validated coordinates
        updateData.liveLocation.latitude = validation.latitude;
        updateData.liveLocation.longitude = validation.longitude;

        const branchAssignment = await assignNearestBranch(
          validation.latitude,
          validation.longitude,
          { checkAvailability: false } // Don't check availability for general updates
        );

        if (!branchAssignment.success) {
          return reply.status(400).send({
            message: branchAssignment.message,
            success: false,
            details: branchAssignment.nearestBranch
          });
        }

        updateData.branch = branchAssignment.branch.branchId;
        updateData.branchDetails = branchAssignment.branch.branchDetails;
      }
    } else if (user.role === "DeliveryPartner") {
      UserModel = DeliveryPartner;
      
      // Delivery partners can't change their branch via this endpoint
      if (updateData.branch) {
        delete updateData.branch;
      }

      // Validate location if being updated
      if (updateData.liveLocation?.latitude && updateData.liveLocation?.longitude) {
        const validation = validateCoordinates(
          updateData.liveLocation.latitude,
          updateData.liveLocation.longitude
        );

        if (!validation.valid) {
          return reply.status(400).send({
            message: validation.message,
            success: false,
          });
        }

        updateData.liveLocation.latitude = validation.latitude;
        updateData.liveLocation.longitude = validation.longitude;
      }
    } else {
      return reply.status(400).send({ 
        message: "Invalid user role",
        success: false 
      });
    }

    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('branch');

    if (!updatedUser) {
      return reply.status(404).send({ 
        message: "User not found after update",
        success: false 
      });
    }

    return reply.send({
      message: "User updated successfully",
      user: updatedUser,
      success: true,
    });

  } catch (error) {
    console.error('Update user error:', error);
    return reply.status(500).send({ 
      message: "Failed to update user", 
      error: error.message,
      success: false,
    });
  }
};

// Get user with branch details
export const getUserDetails = async (req, reply) => {
  try {
    const { userId } = req.user;

    if (!userId) {
      return reply.status(401).send({ 
        message: "User ID not found in token",
        success: false 
      });
    }

    let user = await Customer.findById(userId).populate('branch') 
      || await DeliveryPartner.findById(userId).populate('branch');

    if (!user) {
      return reply.status(404).send({ 
        message: "User not found",
        success: false 
      });
    }

    // If customer has location but no branch, try to assign one
    if (user.role === "Customer" && 
        user.liveLocation?.latitude && 
        user.liveLocation?.longitude && 
        !user.branch) {
      
      const branchAssignment = await assignNearestBranch(
        user.liveLocation.latitude,
        user.liveLocation.longitude,
        { checkAvailability: false }
      );

      if (branchAssignment.success) {
        // Update user with branch
        user = await Customer.findByIdAndUpdate(
          userId,
          {
            $set: {
              branch: branchAssignment.branch.branchId,
              branchDetails: branchAssignment.branch.branchDetails,
            }
          },
          { new: true }
        ).populate('branch');
      }
    }

    return reply.send({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Get user error:', error);
    return reply.status(500).send({ 
      message: "Failed to fetch user", 
      error: error.message,
      success: false,
    });
  }
};

// Update only location and auto-assign branch (for customers)
export const updateLocation = async (req, reply) => {
  try {
    const { userId } = req.user;
    const { latitude, longitude, address } = req.body;

    if (!userId) {
      return reply.status(401).send({ 
        message: "User ID not found in token",
        success: false 
      });
    }

    if (!latitude || !longitude) {
      return reply.status(400).send({ 
        message: "Latitude and longitude are required",
        success: false,
      });
    }

    // Validate coordinates
    const validation = validateCoordinates(latitude, longitude);
    if (!validation.valid) {
      return reply.status(400).send({
        message: validation.message,
        success: false,
      });
    }

    const customer = await Customer.findById(userId);

    if (!customer) {
      return reply.status(404).send({ 
        message: "Customer not found",
        success: false,
      });
    }

    // Find and assign nearest branch (check availability for location updates)
    const branchAssignment = await assignNearestBranch(
      validation.latitude,
      validation.longitude,
      { checkAvailability: true, minimumPartners: 1 }
    );

    if (!branchAssignment.success) {
      return reply.status(400).send({
        message: branchAssignment.message,
        success: false,
        details: branchAssignment.nearestBranch,
      });
    }

    // Update customer location and branch
    const updatedCustomer = await Customer.findByIdAndUpdate(
      userId,
      {
        $set: {
          liveLocation: { 
            latitude: validation.latitude, 
            longitude: validation.longitude 
          },
          address: address || customer.address,
          branch: branchAssignment.branch.branchId,
          branchDetails: branchAssignment.branch.branchDetails,
        },
      },
      { new: true, runValidators: true }
    ).populate('branch');

    return reply.send({
      message: "Location and branch updated successfully",
      success: true,
      user: updatedCustomer,
      branchInfo: branchAssignment.branch,
    });

  } catch (error) {
    console.error('Update location error:', error);
    return reply.status(500).send({ 
      message: "Failed to update location", 
      error: error.message,
      success: false,
    });
  }
};

// Get all available branches with distances
export const getAllBranches = async (req, reply) => {
  try {
    const { latitude, longitude } = req.query;

    if (!latitude || !longitude) {
      return reply.status(400).send({
        message: "Latitude and longitude are required",
        success: false,
      });
    }

    const validation = validateCoordinates(latitude, longitude);
    if (!validation.valid) {
      return reply.status(400).send({
        message: validation.message,
        success: false,
      });
    }

    const branches = await Branch.find({ isActive: true }).populate('deliveryPartners');

    if (branches.length === 0) {
      return reply.status(404).send({
        message: "No branches available",
        success: false,
      });
    }

    const branchesWithDistance = branches.map(branch => {
      const distance = calculateDistance(
        validation.latitude,
        validation.longitude,
        branch.location.latitude,
        branch.location.longitude
      );

      const availablePartners = branch.deliveryPartners.filter(
        partner => partner.isAvailable
      ).length;

      const isWithinRadius = distance <= branch.deliveryRadius;

      return {
        ...branch.toObject(),
        distance: parseFloat(distance.toFixed(2)),
        isAvailable: isWithinRadius && branch.isOnline && availablePartners > 0,
        isWithinRadius,
        availablePartners,
        totalPartners: branch.deliveryPartners.length,
      };
    });

    branchesWithDistance.sort((a, b) => a.distance - b.distance);

    return reply.send({
      success: true,
      branches: branchesWithDistance,
      count: branchesWithDistance.length,
    });

  } catch (error) {
    console.error('Get all branches error:', error);
    return reply.status(500).send({
      message: "Failed to fetch branches",
      error: error.message,
      success: false,
    });
  }
};

// Get nearest branch for current user
export const getNearestBranch = async (req, reply) => {
  try {
    const { userId } = req.user;

    if (!userId) {
      return reply.status(401).send({ 
        message: "User ID not found in token",
        success: false 
      });
    }

    const customer = await Customer.findById(userId);

    if (!customer) {
      return reply.status(404).send({ 
        message: "Customer not found",
        success: false,
      });
    }

    if (!customer.liveLocation?.latitude || !customer.liveLocation?.longitude) {
      return reply.status(400).send({ 
        message: "Customer location not available. Please update your location first.",
        success: false,
      });
    }

    // Get all active and online branches with delivery partners
    const branches = await Branch.find({ 
      isActive: true,
      isOnline: true 
    }).populate('deliveryPartners');

    if (branches.length === 0) {
      return reply.status(404).send({ 
        message: "No active branches available",
        success: false,
      });
    }

    // Calculate distances for all branches
    const branchesWithDistance = branches.map(branch => {
      const distance = calculateDistance(
        customer.liveLocation.latitude,
        customer.liveLocation.longitude,
        branch.location.latitude,
        branch.location.longitude
      );

      const availablePartners = branch.deliveryPartners.filter(
        partner => partner.isAvailable
      ).length;

      const isWithinRadius = distance <= branch.deliveryRadius;

      return {
        ...branch.toObject(),
        distance: parseFloat(distance.toFixed(2)),
        isAvailable: isWithinRadius && availablePartners > 0,
        isWithinRadius,
        availablePartners,
        totalPartners: branch.deliveryPartners.length,
      };
    });

    // Sort by distance
    branchesWithDistance.sort((a, b) => a.distance - b.distance);

    const nearestBranch = branchesWithDistance[0];
    const availableBranches = branchesWithDistance.filter(b => b.isAvailable);

    return reply.send({
      success: true,
      nearestBranch,
      availableBranches,
      allBranches: branchesWithDistance,
      summary: {
        total: branchesWithDistance.length,
        available: availableBranches.length,
        nearestDistance: nearestBranch.distance,
        nearestAvailable: nearestBranch.isAvailable,
      }
    });

  } catch (error) {
    console.error('Get nearest branch error:', error);
    return reply.status(500).send({ 
      message: "Failed to fetch nearest branch", 
      error: error.message,
      success: false,
    });
  }
};
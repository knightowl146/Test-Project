import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/ApiResponse.js";
import ApiError from "../../utils/ApiError.js";
import Blocklist from "../../models/Blocklist.model.js";

/**
 * @desc    Get all blocked IPs
 * @route   GET /api/v1/admin/blocklist
 * @access  Admin
 */
export const getBlocklist = asyncHandler(async (req, res) => {
    const { isActive, ip } = req.query;
    const filter = {};

    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (ip) filter.ip = { $regex: ip, $options: 'i' };

    const blocks = await Blocklist.find(filter).sort({ createdAt: -1 });

    res.status(200).json(new ApiResponse(200, blocks, "Blocklist fetched successfully"));
});

/**
 * @desc    Add IP to blocklist manually
 * @route   POST /api/v1/admin/blocklist
 * @access  Admin
 */
export const addBlock = asyncHandler(async (req, res) => {
    const { ip, reason, expiresAt } = req.body;

    if (!ip || !reason) {
        throw new ApiError(400, "IP and Reason are required");
    }

    const existingBlock = await Blocklist.findOne({ ip });

    if (existingBlock) {
        if (existingBlock.isActive) {
            throw new ApiError(400, "IP is already blocked");
        } else {
            // Reactivate
            existingBlock.isActive = true;
            existingBlock.reason = reason;
            existingBlock.source = "MANUAL";
            existingBlock.createdBy = req.user.username;
            existingBlock.expiresAt = expiresAt || null;
            await existingBlock.save();
            return res.status(200).json(new ApiResponse(200, existingBlock, "IP block reactivated"));
        }
    }

    const block = await Blocklist.create({
        ip,
        reason,
        source: "MANUAL",
        isActive: true,
        createdBy: req.user.username,
        expiresAt: expiresAt || null
    });

    res.status(201).json(new ApiResponse(201, block, "IP blocked successfully"));
});

/**
 * @desc    Remove IP from blocklist
 * @route   DELETE /api/v1/admin/blocklist/:id
 * @access  Admin
 */
export const removeBlock = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const block = await Blocklist.findById(id);

    if (!block) {
        throw new ApiError(404, "Block entry not found");
    }

    block.isActive = false;
    await block.save();

    res.status(200).json(new ApiResponse(200, block, "IP unblocked successfully"));
});

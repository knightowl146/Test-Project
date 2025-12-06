import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/ApiResponse.js";
import ApiError from "../../utils/ApiError.js";
import Rule from "../../models/Rule.model.js";

/**
 * @desc    Create a new detection rule
 * @route   POST /api/v1/admin/rules
 * @access  Admin
 */
export const createRule = asyncHandler(async (req, res) => {
    const { name, pattern, category, severity, description, tags } = req.body;

    if (!name || !pattern || !category || !severity) {
        throw new ApiError(400, "Missing required fields");
    }

    const existingRule = await Rule.findOne({ name });
    if (existingRule) {
        throw new ApiError(400, "Rule with this name already exists");
    }

    const rule = await Rule.create({
        name,
        pattern,
        category,
        severity,
        description,
        tags,
        createdBy: req.user.username
    });

    res.status(201).json(new ApiResponse(201, rule, "Rule created successfully"));
});

/**
 * @desc    Get all detection rules
 * @route   GET /api/v1/admin/rules
 * @access  Admin
 */
export const getRules = asyncHandler(async (req, res) => {
    const { category, isActive } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const rules = await Rule.find(filter).sort({ cratedAt: -1 });

    res.status(200).json(new ApiResponse(200, rules, "Rules fetched successfully"));
});

/**
 * @desc    Update a rule
 * @route   PUT /api/v1/admin/rules/:id
 * @access  Admin
 */
export const updateRule = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    const rule = await Rule.findByIdAndUpdate(id, updates, { new: true, runValidators: true });

    if (!rule) {
        throw new ApiError(404, "Rule not found");
    }

    res.status(200).json(new ApiResponse(200, rule, "Rule updated successfully"));
});

/**
 * @desc    Delete a rule
 * @route   DELETE /api/v1/admin/rules/:id
 * @access  Admin
 */
export const deleteRule = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const rule = await Rule.findByIdAndDelete(id);

    if (!rule) {
        throw new ApiError(404, "Rule not found");
    }

    res.status(200).json(new ApiResponse(200, null, "Rule deleted successfully"));
});

/**
 * @desc    Toggle rule status (Active/Inactive)
 * @route   PATCH /api/v1/admin/rules/:id/toggle
 * @access  Admin
 */
export const toggleRuleStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const rule = await Rule.findById(id);
    if (!rule) {
        throw new ApiError(404, "Rule not found");
    }

    rule.isActive = !rule.isActive;
    await rule.save();

    res.status(200).json(new ApiResponse(200, rule, `Rule ${rule.isActive ? 'activated' : 'deactivated'}`));
});

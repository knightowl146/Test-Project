import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/ApiResponse.js";
import { ragService } from "../../services/rag.service.js";

const chat = asyncHandler(async (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json(new ApiResponse(400, null, "Message is required"));
    }

    try {
        const result = await ragService.processChat(message);

        return res.status(200).json(
            new ApiResponse(200, result, "Response generated successfully")
        );
    } catch (error) {
        console.error("Chat Error:", error);
        return res.status(500).json(new ApiResponse(500, null, "Failed to generate response"));
    }
});

export { chat };

import axios from "axios";
import { SECRET_STORE } from "../../services/secrets-manager.js";

export const getYoutubeVideoRecommendations = async (req, res) => {
    console.log("Fetching YouTube video recommendations...");
    try {
        const query = req.params.query;
        if (!query) {
            return res.status(400).json({ error: "Query parameter is required" });
        }
        const youtubeApiKey = await SECRET_STORE.YOUTUBE_API_KEY();
        const API_BASE_URL = 'https://www.googleapis.com/youtube/v3/search';

        const response = await axios.get(API_BASE_URL, {
            params: {
                key: youtubeApiKey,
                q: query,
                part: "snippet",
                type: 'video',
                maxResults: 1 // Fetch 1 result for each recipe
            },
        });

        if (response.status !== 200) {
            throw new Error("Failed to fetch YouTube videos");
        }

        res.json(response.data.items[0]);
    } catch (error) {
        console.error("Error fetching YouTube videos", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

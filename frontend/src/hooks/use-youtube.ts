import { externalApi } from "@/lib/api";
import type { YouTubeSearchResult } from "@/schemas/google";
import { useQueries } from "@tanstack/react-query";

// Define a function for a single API call
async function fetchYoutubeVideo(query: string): Promise<YouTubeSearchResult> {
    const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
    const API_BASE_URL = 'https://www.googleapis.com/youtube/v3/search';

    const response = await externalApi.get(API_BASE_URL, {
        params: {
            key: apiKey,
            q: query,
            part: "snippet",
            type: 'video',
            maxResults: 1 // Fetch 1 result for each recipe
        },
    });

    if (response.status !== 200) {
        throw new Error("Failed to fetch YouTube videos");
    }

    return response.data.items[0]; // Return the first item
}

export const useYoutubeRecipes = ({ recipes }: { recipes: string[] }) => {
    return useQueries({
        queries: recipes.map(recipe => ({
            queryKey: ["youtubeRecipe", recipe],
            queryFn: () => fetchYoutubeVideo(recipe),
            staleTime: Infinity,
            refetchOnWindowFocus: false,
            retry: false,
        })),
        combine: (results) => {
            return {
                data: results.map(result => result.data).filter(Boolean) as YouTubeSearchResult[] || [],
                pending: results.some(result => result.isPending),
                error: results.find(result => result.error)?.error || null,
            };
        },
    });
};

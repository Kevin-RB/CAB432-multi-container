import api from "@/lib/api";
import type { YouTubeSearchResult } from "@/schemas/google";
import { useQueries } from "@tanstack/react-query";

// Define a function for a single API call
async function fetchYoutubeVideo(query: string): Promise<YouTubeSearchResult> {
    const response = await api.get(`/videos/${encodeURIComponent(query)}`);
    return response.data;
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

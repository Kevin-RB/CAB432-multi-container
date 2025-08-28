import { z } from 'zod';

const ThumbnailSchema = z.object({
    url: z.string(),
    width: z.number().int().nonnegative(),
    height: z.number().int().nonnegative(),
});

const SearchResultIdSchema = z.object({
    kind: z.string(),
    videoId: z.string().optional(),
    channelId: z.string().optional(),
    playlistId: z.string().optional(),
});

const SnippetSchema = z.object({
    publishedAt: z.string().datetime(),
    channelId: z.string(),
    title: z.string(),
    description: z.string(),
    thumbnails: z.record(z.string(), ThumbnailSchema),
    channelTitle: z.string(),
    liveBroadcastContent: z.string(),
});

export const YouTubeSearchResultSchema = z.object({
    kind: z.literal('youtube#searchResult'),
    etag: z.string(),
    id: SearchResultIdSchema,
    snippet: SnippetSchema,
});

export type YouTubeSearchResult = z.infer<typeof YouTubeSearchResultSchema>;
import type { YouTubeSearchResult } from "@/schemas/google"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

export const Video = ({ video }: { video: YouTubeSearchResult }) => {
    return (
        <Card className="p-4 border-0">
            <CardHeader>
                <CardTitle>{video.snippet.title}</CardTitle>
                <CardDescription>By {video.snippet.channelTitle}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="relative w-full aspect-video">
                    <iframe
                        className="absolute top-0 left-0 w-full h-full rounded-md"
                        src={`https://www.youtube.com/embed/${video.id.videoId}`}
                        title={video.snippet.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                </div>
            </CardContent>
            <CardFooter>
                <CardDescription>{video.snippet.description}</CardDescription>
            </CardFooter>
        </Card>
    )
}
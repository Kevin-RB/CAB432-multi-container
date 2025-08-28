import { Video } from "./video"
import { useYoutubeRecipes } from "@/hooks/use-youtube"


export const VideoShowcase = ({ recipes }: { recipes: string[] }) => {
    const { data, pending, error } = useYoutubeRecipes({ recipes })

    if (pending) {
        return <div>Loading videos...</div>
    }

    if (error) {
        return <div>Error loading videos</div>
    }

    if (!data || data.length === 0) {
        return <div>No videos found</div>
    }

    return (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.map((result) => (
                <Video key={result.id.videoId} video={result} />
            ))}
        </section>
    )
}

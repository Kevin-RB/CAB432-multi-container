import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useReceiptImage } from '@/hooks/use-receipt';

interface ReceiptImageProps {
    imageKey: string;
    alt?: string;
    className?: string;
}

export const ReceiptImage = ({ imageKey, alt = 'Receipt image', className }: ReceiptImageProps) => {
    const { data, isLoading, isError, error } = useReceiptImage(imageKey);
    
    if (isLoading) {
        return (
            <Card className={`p-4 ${className}`}>
                <Skeleton className="w-full h-64 rounded-md" />
                <div className="mt-2">
                    <Skeleton className="h-4 w-32" />
                </div>
            </Card>
        );
    }

    if (isError) {
        return (
            <Card className={`p-4 ${className}`}>
                <div className="flex items-center justify-center h-64 bg-gray-100 rounded-md">
                    <div className="text-center">
                        <p className="text-gray-500 mb-2">Failed to load image</p>
                        {error instanceof Error && (
                            <p className="text-sm text-red-500">{error.message}</p>
                        )}
                    </div>
                </div>
            </Card>
        );
    }

    if (!data) {
        return null;
    }

    return (
        <Card className={`p-4 ${className}`}>
            <div className="space-y-2">
                <img
                    src={data.data.url}
                    alt={alt}
                    className="w-full h-auto rounded-md border shadow-sm"
                    onError={() => {
                        console.error('Failed to display image');
                    }}
                />
                <p className="text-sm text-gray-300 text-center">{alt}</p>
            </div>
        </Card>
    );
};

export default ReceiptImage;

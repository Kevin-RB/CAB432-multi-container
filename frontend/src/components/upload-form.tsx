import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useForm, type SubmitHandler } from "react-hook-form"
import { receiptUploadSchema, type ReceiptUploadSchema } from "@/schemas/receipt"
import { zodResolver } from '@hookform/resolvers/zod'
import { useUpload } from "@/hooks/use-upload"

export function UploadForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const uploadMutation = useUpload();
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ReceiptUploadSchema>({
    resolver: zodResolver(receiptUploadSchema),
  });

  const watchedFile = watch("receipt-image");

  const onSubmit: SubmitHandler<ReceiptUploadSchema> = async (data) => {
    try {
      const file = data["receipt-image"][0]; // Get the first file from FileList
      await uploadMutation.mutateAsync(file);
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  return (
    <form className={cn("flex flex-col gap-6 min-w-sm", className)} {...props} onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Upload Receipt</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Select a receipt image to upload and process
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="receipt-image">Receipt Image</Label>
          <Input 
            id="receipt-image" 
            type="file" 
            accept="image/jpeg,image/png,image/jpg"
            {...register("receipt-image")} 
          />
          {errors["receipt-image"] && (
            <p className="text-red-500">
              {typeof errors["receipt-image"]?.message === 'string' 
                ? errors["receipt-image"].message 
                : 'Invalid file selected'
              }
            </p>
          )}
          {watchedFile && watchedFile.length > 0 && (
            <p className="text-green-600 text-sm">
              Selected: {watchedFile[0].name} ({(watchedFile[0].size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
        </div>
        <Button 
          disabled={uploadMutation.isPending || !watchedFile || watchedFile.length === 0} 
          type="submit" 
          className="w-full cursor-pointer"
        >
          {uploadMutation.isPending ? "Uploading..." : "Upload Receipt"}
        </Button>
        {uploadMutation.isSuccess && (
          <p className="text-green-600 text-center">Upload successful!</p>
        )}
        {uploadMutation.isError && (
          <p className="text-red-500 text-center">
            Upload failed. Please try again.
          </p>
        )}
      </div>
    </form>
  )
}

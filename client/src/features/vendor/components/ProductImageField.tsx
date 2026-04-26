type ProductImageFieldProps = {
  imageUrl: string;
  isUploading: boolean;
  onFileUpload: (file: File) => Promise<void>;
  onUrlChange: (value: string) => void;
};

const ProductImageField = ({
  imageUrl,
  isUploading,
  onFileUpload,
  onUrlChange,
}: ProductImageFieldProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="imageUpload" className="text-sm font-medium text-gray-700">
          Product Image
        </label>
        <input
          id="imageUpload"
          type="file"
          accept="image/*"
          disabled={isUploading}
          onChange={(e) => {
            const file = e.target.files?.[0];

            if (file) {
              void onFileUpload(file);
            }

            e.currentTarget.value = "";
          }}
          className="w-full rounded-lg border bg-white px-4 py-3 text-sm outline-none transition file:mr-4 file:rounded-full file:border-0 file:bg-black file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-gray-800 disabled:cursor-not-allowed"
        />
        <p className="text-xs text-gray-500">
          Upload directly to Cloudinary or paste an existing image URL below.
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="imageUrl" className="text-sm font-medium text-gray-700">
          Image URL
        </label>
        <input
          id="imageUrl"
          type="url"
          value={imageUrl}
          onChange={(e) => onUrlChange(e.target.value)}
          className="w-full rounded-lg border px-4 py-3 outline-none transition focus:border-black"
          placeholder="https://example.com/product-image.jpg"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border bg-gray-50">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Product preview"
            className="h-56 w-full object-cover"
          />
        ) : (
          <div className="flex h-56 items-center justify-center text-sm text-gray-500">
            Image preview will appear here
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductImageField;

// Client-side helper that uploads a file straight to Cloudinary using an
// UNSIGNED upload preset. The file never passes through our own server, which
// keeps us within Vercel's serverless limits. Returns the hosted file URL.

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

export async function uploadToCloudinary(file: File): Promise<string> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error(
      "Cloudinary is not configured. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET."
    )
  }

  const formData = new FormData()
  formData.append("file", file)
  formData.append("upload_preset", UPLOAD_PRESET)

  // `auto` lets Cloudinary accept any file type (pdf, docx, images, zip, ...).
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`,
    { method: "POST", body: formData }
  )

  const data = await res.json()

  // Surface Cloudinary's actual reason (e.g. "Upload preset must be whitelisted
  // for unsigned uploads") instead of a generic message.
  if (!res.ok) {
    throw new Error(data?.error?.message || "Upload failed. Please try again.")
  }

  return data.secure_url as string
}

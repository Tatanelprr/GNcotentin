export const CLOUDINARY_CLOUD_NAME = 'ddouhzmhs'
export const CLOUDINARY_UPLOAD_PRESET = 'gncotentin'

export async function uploadToCloudinary(file, folder = 'gncotentin') {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)
  formData.append('folder', folder)

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData }
  )

  if (!res.ok) throw new Error('Échec upload Cloudinary')
  const data = await res.json()
  return data.secure_url
}

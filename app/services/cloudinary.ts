import env from '#start/env'
import { v2 as cloudinary } from 'cloudinary'

/**
 * Upload signé des images de plats vers Cloudinary. Les secrets restent côté
 * serveur ; le contrôleur envoie le fichier reçu et stocke l'URL retournée.
 */
cloudinary.config({
  cloud_name: env.get('CLOUDINARY_CLOUD_NAME'),
  api_key: env.get('CLOUDINARY_API_KEY'),
  api_secret: env.get('CLOUDINARY_API_SECRET'),
  secure: true,
})

export type UploadedImage = { url: string; publicId: string }

/** Envoie un fichier (chemin temporaire) dans un dossier et renvoie URL + public_id. */
export async function uploadImage(filePath: string, folder: string): Promise<UploadedImage> {
  const res = await cloudinary.uploader.upload(filePath, {
    folder,
    resource_type: 'image',
  })
  return { url: res.secure_url, publicId: res.public_id }
}

/** Supprime un asset Cloudinary (remplacement d'image ou suppression d'entité). */
export async function destroyImage(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId, { resource_type: 'image' })
}

export const uploadDishImage = (filePath: string) => uploadImage(filePath, 'azaria/dishes')
export const destroyDishImage = destroyImage

export const uploadAccompanimentImage = (filePath: string) =>
  uploadImage(filePath, 'azaria/accompaniments')

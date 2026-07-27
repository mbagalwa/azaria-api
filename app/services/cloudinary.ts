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

/** Envoie un fichier (chemin temporaire) et renvoie l'URL sécurisée + public_id. */
export async function uploadDishImage(filePath: string): Promise<UploadedImage> {
  const res = await cloudinary.uploader.upload(filePath, {
    folder: 'azaria/dishes',
    resource_type: 'image',
  })
  return { url: res.secure_url, publicId: res.public_id }
}

/** Supprime l'asset Cloudinary d'un plat (remplacement d'image ou suppression). */
export async function destroyDishImage(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId, { resource_type: 'image' })
}

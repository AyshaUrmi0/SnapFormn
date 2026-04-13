import { v2 as cloudinary } from 'cloudinary';
import { AppError } from '@snapform/shared';
import { env } from '../../config/env';
import { logger } from '../../lib/logger';

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

export type ResourceType = 'image' | 'video' | 'raw' | 'auto';

interface SignUploadParams {
  formId: string;
  fieldId: string;
  resourceType: ResourceType;
}

export const uploadService = {
  /**
   * Generate a signed upload payload. The client then POSTs the file
   * directly to Cloudinary with these params — the API secret never
   * leaves the server.
   */
  signUploadParams({ formId, fieldId, resourceType }: SignUploadParams) {
    if (!env.CLOUDINARY_API_SECRET || !env.CLOUDINARY_CLOUD_NAME) {
      throw AppError.internal('Cloudinary is not configured');
    }

    // Folder is server-built so clients can't write anywhere they want
    const folder = `${env.CLOUDINARY_UPLOAD_FOLDER}/forms/${formId}/${fieldId}`;
    const timestamp = Math.round(Date.now() / 1000);

    // Sign ONLY the params we care about — Cloudinary will reject requests
    // where the actual POST params don't match what was signed.
    const paramsToSign: Record<string, string | number> = {
      folder,
      timestamp,
    };

    const signature = cloudinary.utils.api_sign_request(paramsToSign, env.CLOUDINARY_API_SECRET);

    return {
      signature,
      timestamp,
      apiKey: env.CLOUDINARY_API_KEY,
      cloudName: env.CLOUDINARY_CLOUD_NAME,
      folder,
      resourceType,
    };
  },

  /**
   * Delete an asset from Cloudinary. Called when a submission with
   * media fields is deleted.
   */
  async destroy(publicId: string, resourceType: ResourceType = 'auto') {
    if (!env.CLOUDINARY_API_SECRET) return;
    try {
      const effectiveType: 'image' | 'video' | 'raw' =
        resourceType === 'auto' ? 'image' : resourceType;
      await cloudinary.uploader.destroy(publicId, { resource_type: effectiveType });
    } catch (err) {
      logger.warn({ err, publicId }, 'Failed to delete Cloudinary asset');
    }
  },
};

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
  signUploadParams({ formId, fieldId, resourceType }: SignUploadParams) {
    if (!env.CLOUDINARY_API_SECRET || !env.CLOUDINARY_CLOUD_NAME) {
      throw AppError.internal('Cloudinary is not configured');
    }

    const folder = `${env.CLOUDINARY_UPLOAD_FOLDER}/forms/${formId}/${fieldId}`;
    const timestamp = Math.round(Date.now() / 1000);

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

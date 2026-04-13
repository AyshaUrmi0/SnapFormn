import { api } from './api-client';

export type ResourceType = 'image' | 'video' | 'raw' | 'auto';

export interface UploadResult {
  secureUrl: string;
  publicId: string;
  resourceType: ResourceType;
  bytes: number;
  filename: string;
}

interface SignResponse {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder: string;
  resourceType: ResourceType;
}

interface UploadOwnerOpts {
  mode: 'owner';
  formId: string;
  fieldId: string;
  resourceType?: ResourceType;
  onProgress?: (percent: number) => void;
}

interface UploadRespondentOpts {
  mode: 'respondent';
  slug: string;
  fieldId: string;
  resourceType?: ResourceType;
  onProgress?: (percent: number) => void;
}

type UploadOpts = UploadOwnerOpts | UploadRespondentOpts;

/**
 * Upload a file to Cloudinary via a signed direct upload.
 *
 * Flow:
 *   1. Ask our API for a signature (server-side, API secret stays server-side)
 *   2. POST the file + signed params directly to Cloudinary
 *   3. Return the resulting secure_url and public_id
 *
 * Large files bypass our API entirely — the bytes only touch Cloudinary.
 */
export async function uploadToCloudinary(file: File, opts: UploadOpts): Promise<UploadResult> {
  const resourceType: ResourceType = opts.resourceType ?? 'auto';

  // 1. Get a signed upload payload from our API
  const sign = opts.mode === 'owner'
    ? await api.post<SignResponse>('/uploads/sign', {
        formId: opts.formId,
        fieldId: opts.fieldId,
        resourceType,
      })
    : await api.post<SignResponse>('/uploads/sign-public', {
        slug: opts.slug,
        fieldId: opts.fieldId,
        resourceType,
      });

  if (!sign.cloudName) {
    throw new Error('Cloudinary is not configured on the server');
  }

  // 2. POST the file directly to Cloudinary using the signed params
  const endpointType = resourceType === 'raw' ? 'raw' : resourceType === 'video' ? 'video' : resourceType === 'image' ? 'image' : 'auto';
  const url = `https://api.cloudinary.com/v1_1/${sign.cloudName}/${endpointType}/upload`;

  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', sign.apiKey);
  formData.append('timestamp', String(sign.timestamp));
  formData.append('signature', sign.signature);
  formData.append('folder', sign.folder);

  // Use XMLHttpRequest for real upload progress events (fetch doesn't expose them)
  const response = await new Promise<{
    secure_url: string;
    public_id: string;
    resource_type: string;
    bytes: number;
    original_filename: string;
  }>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url);

    if (opts.onProgress) {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          opts.onProgress!(percent);
        }
      });
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText));
        } catch {
          reject(new Error('Invalid Cloudinary response'));
        }
      } else {
        let message = `Upload failed (${xhr.status})`;
        try {
          const err = JSON.parse(xhr.responseText);
          if (err.error?.message) message = err.error.message;
        } catch {
          // ignore
        }
        reject(new Error(message));
      }
    };

    xhr.onerror = () => reject(new Error('Network error during upload'));
    xhr.send(formData);
  });

  return {
    secureUrl: response.secure_url,
    publicId: response.public_id,
    resourceType: (response.resource_type as ResourceType) ?? resourceType,
    bytes: response.bytes,
    filename: response.original_filename,
  };
}

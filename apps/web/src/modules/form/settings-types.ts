export interface FormSuccessConfig {
  message: string;
  showSubmitAnother: boolean;
  redirectUrl: string;
}

export interface FormShareConfig {
  passwordEnabled: boolean;
  password: string;
  closedMessage: string;
}

export interface FormEmbedConfig {
  allowEmbed: boolean;
  embedHeight: number;
}

export interface FormSettings {
  successPage?: FormSuccessConfig;
  share?: FormShareConfig;
  embed?: FormEmbedConfig;
}

export const DEFAULT_SUCCESS_CONFIG: FormSuccessConfig = {
  message: 'Thank you! Your response has been submitted successfully.',
  showSubmitAnother: true,
  redirectUrl: '',
};

export const DEFAULT_SHARE_CONFIG: FormShareConfig = {
  passwordEnabled: false,
  password: '',
  closedMessage: 'This form is no longer accepting responses.',
};

export const DEFAULT_EMBED_CONFIG: FormEmbedConfig = {
  allowEmbed: true,
  embedHeight: 600,
};

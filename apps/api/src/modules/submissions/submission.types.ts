export interface SubmitFormInput {
  fields: Array<{
    fieldId: string;
    value: unknown;
  }>;
}

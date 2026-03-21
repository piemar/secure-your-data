import { ObjectiveValidation } from '@/lib/validation';

export const validations: ObjectiveValidation[] = [
    {
      objectiveId: 'obj-11-1',
      rules: [
        { pattern: /(terraform|mongodbatlas_cluster|resource\s+")/, description: 'Define Terraform resource', required: true },
      ],
    },
    {
      objectiveId: 'obj-11-2',
      rules: [
        { pattern: /(provider_name|region_name|instance_size|electable_specs)/, description: 'Configure cluster specifications', required: true },
      ],
    },
    {
      objectiveId: 'obj-11-3',
      rules: [
        { pattern: /(terraform\s+(apply|plan|init))/, description: 'Run Terraform commands', required: true },
      ],
    },
  ];

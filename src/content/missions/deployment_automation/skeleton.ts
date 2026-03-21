import { MissionSkeleton } from '@/lib/types';

export const skeleton: MissionSkeleton = {
    guided: `// MISSION: Deployment Automation (Terraform)

// Step 1: Define the Terraform resource
/*
resource "mongodbatlas_cluster" "heist_cluster" {
  project_id = var.atlas_project_id
  name       = "___BLANK___"

  provider_name = "___BLANK___"
  region_name   = "___BLANK___"

  replication_specs {
    num_shards = 1
    regions_config {
      region_name = "US_EAST_1"
      electable_specs {
        instance_size = "___BLANK___"
        node_count    = ___BLANK___
      }
    }
  }

  cloud_backup = ___BLANK___
}
*/

// Step 2: Run Terraform commands
// terraform ___BLANK___
// terraform ___BLANK___ -out=tfplan
// terraform ___BLANK___ tfplan

// Step 3: Verify deployment
// mongosh "mongodb+srv://heist-production.example.net" --eval "db.adminCommand({hello:1})"
`,
    challenge: `// MISSION: Deployment Automation
// Write Terraform config for an Atlas cluster

// Define mongodbatlas_cluster resource with name, provider, region, specs
// YOUR CODE HERE (as Terraform HCL in a comment block)

// List the 3 Terraform commands to deploy (init, plan, apply)
// YOUR CODE HERE

// Write the verification command
// YOUR CODE HERE
`,
    expert: `// MISSION: Deployment Automation
// Provision a production Atlas cluster using Terraform.
// Define the resource, configure specs, and deploy.
`,
    hints: {
      guided: [
        { line: 7, blankText: '___BLANK___', hint: 'Cluster name — e.g. "heist-production"', answer: 'heist-production', xpPenalty: 15 },
        { line: 9, blankText: '___BLANK___', hint: 'Cloud provider: "AWS", "GCP", or "AZURE"', answer: 'AWS', xpPenalty: 15 },
        { line: 10, blankText: '___BLANK___', hint: 'AWS region — e.g. "US_EAST_1"', answer: 'US_EAST_1', xpPenalty: 15 },
        { line: 17, blankText: '___BLANK___', hint: 'Instance tier — M10 is smallest dedicated', answer: 'M10', xpPenalty: 20 },
        { line: 18, blankText: '___BLANK___', hint: 'Number of electable nodes (3 for HA)', answer: '3', xpPenalty: 20 },
        { line: 23, blankText: '___BLANK___', hint: 'Enable cloud backup? true/false', answer: 'true', xpPenalty: 15 },
        { line: 27, blankText: '___BLANK___', hint: 'First Terraform command to initialize', answer: 'init', xpPenalty: 15 },
        { line: 28, blankText: '___BLANK___', hint: 'Second command to preview changes', answer: 'plan', xpPenalty: 15 },
        { line: 29, blankText: '___BLANK___', hint: 'Third command to execute', answer: 'apply', xpPenalty: 15 },
      ],
      challenge: [],
    },
  };

/**
 * Registry of supported competitor products for side-by-side demo comparison.
 * Used by lab default competitor, template, and StepView dropdown.
 */
export interface CompetitorProduct {
  id: string;
  label: string;
  description?: string;
}

export const COMPETITOR_PRODUCTS: CompetitorProduct[] = [
  { id: 'postgresql', label: 'PostgreSQL', description: 'Traditional RDBMS' },
  { id: 'cosmosdb-vcore', label: 'Cosmos DB (VCore)', description: 'Azure Cosmos DB for MongoDB vCore' },
  { id: 'dynamodb', label: 'DynamoDB', description: 'AWS key-value and document database' },
];

const byId = new Map(COMPETITOR_PRODUCTS.map((p) => [p.id, p]));

export function getCompetitorProduct(id: string): CompetitorProduct | undefined {
  return byId.get(id);
}

export function getCompetitorProductLabel(id: string): string {
  return byId.get(id)?.label ?? id;
}

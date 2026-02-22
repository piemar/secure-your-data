import { describe, it, expect } from 'vitest';
import { getStepEnhancement } from '@/labs/stepEnhancementRegistry';

describe('Text Search step enhancements', () => {
  it('provides code block for indexCreated enhancement', async () => {
    const enh = await getStepEnhancement('text-search.indexCreated');
    expect(enh).toBeDefined();
    expect(enh!.codeBlocks?.length).toBeGreaterThan(0);
    expect(enh!.codeBlocks![0].code).toContain('mappings');
    expect(enh!.codeBlocks![0].code).toContain('fields');
  });

  it('provides code block for queries enhancement', async () => {
    const enh = await getStepEnhancement('text-search.queries');
    expect(enh).toBeDefined();
    expect(enh!.codeBlocks?.[0].code).toContain('$search');
    expect(enh!.codeBlocks?.[0].code).toContain('text');
  });

  it('provides code block for projectionSort enhancement', async () => {
    const enh = await getStepEnhancement('text-search.projectionSort');
    expect(enh).toBeDefined();
    expect(enh!.codeBlocks?.[0].code).toContain('searchScore');
    expect(enh!.codeBlocks?.[0].code).toContain('$sort');
  });

  it('provides code block for autocompleteIndex enhancement', async () => {
    const enh = await getStepEnhancement('text-search.autocompleteIndex');
    expect(enh).toBeDefined();
    expect(enh!.codeBlocks?.[0].code).toContain('autocomplete');
    expect(enh!.codeBlocks?.[0].code).toContain('edgeGram');
  });

  it('provides code block for typeaheadQuery enhancement', async () => {
    const enh = await getStepEnhancement('text-search.typeaheadQuery');
    expect(enh).toBeDefined();
    expect(enh!.codeBlocks?.[0].code).toContain('autocomplete');
    expect(enh!.codeBlocks?.[0].code).toContain('query');
  });

  it('provides code block for typeaheadDesign enhancement', async () => {
    const enh = await getStepEnhancement('text-search.typeaheadDesign');
    expect(enh).toBeDefined();
    expect(enh!.codeBlocks?.[0].code).toContain('suggestions');
  });

  it('provides code block for facetedSearch enhancement', async () => {
    const enh = await getStepEnhancement('text-search.facetedSearch');
    expect(enh).toBeDefined();
    expect(enh!.codeBlocks?.[0].code).toContain('$facet');
    expect(enh!.codeBlocks?.[0].code).toContain('$search');
  });

  it('provides code block for highlighting enhancement', async () => {
    const enh = await getStepEnhancement('text-search.highlighting');
    expect(enh).toBeDefined();
    expect(enh!.codeBlocks?.[0].code).toContain('highlight');
    expect(enh!.codeBlocks?.[0].code).toContain('searchHighlights');
  });

  it('provides code block for relevanceTuning enhancement', async () => {
    const enh = await getStepEnhancement('text-search.relevanceTuning');
    expect(enh).toBeDefined();
    expect(enh!.codeBlocks?.[0].code).toContain('compound');
    expect(enh!.codeBlocks?.[0].code).toContain('boost');
  });

  it('returns undefined for unknown enhancement id', async () => {
    const enh = await getStepEnhancement('text-search.unknown-id');
    expect(enh).toBeUndefined();
  });
});

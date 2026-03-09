import { describe, it, expect } from 'vitest';
import { getStepEnhancement } from '@/labs/stepEnhancementRegistry';

describe('CRUD step enhancements', () => {
  it('provides code block for connect-insert enhancement', async () => {
    const enh = await getStepEnhancement('crud.connect-insert');
    expect(enh).toBeDefined();
    expect(enh?.codeBlocks?.length).toBeGreaterThan(0);
    expect(enh!.codeBlocks![0].code).toContain('insertOne');
    expect(enh!.codeBlocks![0].code).toContain('insertMany');
    expect(enh!.codeBlocks![0].code).toContain('MONGODB_URI');
  });

  it('provides code block for find enhancement', async () => {
    const enh = await getStepEnhancement('crud.find');
    expect(enh).toBeDefined();
    expect(enh?.codeBlocks?.length).toBeGreaterThan(0);
    expect(enh!.codeBlocks![0].code).toContain('find');
    expect(enh!.codeBlocks![0].code).toContain('findOne');
    expect(enh!.codeBlocks![0].code).toContain('limit');
  });

  it('provides code block for update enhancement', async () => {
    const enh = await getStepEnhancement('crud.update');
    expect(enh).toBeDefined();
    expect(enh?.codeBlocks?.length).toBeGreaterThan(0);
    expect(enh!.codeBlocks![0].code).toContain('updateOne');
    expect(enh!.codeBlocks![0].code).toContain('updateMany');
    expect(enh!.codeBlocks![0].code).toContain('$set');
  });

  it('update enhancement has skeleton and inlineHints on every block for hint markers', async () => {
    const enh = await getStepEnhancement('crud.update');
    expect(enh?.codeBlocks).toBeDefined();
    for (const block of enh!.codeBlocks!) {
      expect(block.skeleton, `Block ${block.filename} must have skeleton`).toBeDefined();
      expect(block.inlineHints, `Block ${block.filename} must have inlineHints for hint markers`).toBeDefined();
      expect(block.inlineHints!.length, `Block ${block.filename} must have at least one hint`).toBeGreaterThan(0);
    }
  });

  it('provides code block for replace-one enhancement', async () => {
    const enh = await getStepEnhancement('crud.replace-one');
    expect(enh).toBeDefined();
    expect(enh?.codeBlocks?.length).toBeGreaterThan(0);
    expect(enh!.codeBlocks![0].code).toContain('replaceOne');
  });

  it('provides code block for upsert enhancement', async () => {
    const enh = await getStepEnhancement('crud.upsert');
    expect(enh).toBeDefined();
    expect(enh?.codeBlocks?.length).toBeGreaterThan(0);
    expect(enh!.codeBlocks![0].code).toContain('upsert');
    expect(enh!.codeBlocks![0].code).toContain('updateOne');
  });

  it('provides code block for delete enhancement', async () => {
    const enh = await getStepEnhancement('crud.delete');
    expect(enh).toBeDefined();
    expect(enh?.codeBlocks?.length).toBeGreaterThan(0);
    expect(enh!.codeBlocks![0].code).toContain('deleteOne');
    expect(enh!.codeBlocks![0].code).toContain('deleteMany');
  });

  it('provides code block for bulk-write enhancement', async () => {
    const enh = await getStepEnhancement('crud.bulk-write');
    expect(enh).toBeDefined();
    expect(enh?.codeBlocks?.length).toBeGreaterThan(0);
    expect(enh!.codeBlocks![0].code).toContain('bulkWrite');
    expect(enh!.codeBlocks![0].code).toContain('insertOne');
  });

  it('returns undefined for unknown enhancement id', async () => {
    const enh = await getStepEnhancement('crud.unknown-id');
    expect(enh).toBeUndefined();
  });
});

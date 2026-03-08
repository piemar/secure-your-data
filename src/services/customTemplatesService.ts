import type { WorkshopTemplate } from '@/types';

const STORAGE_KEY = 'workshop_custom_templates';

/**
 * Custom workshop templates (built by SA via Build custom template).
 * Stored in localStorage for now; can be replaced by Atlas API later.
 * See Docs/WORKSHOP_TEMPLATE_STORAGE_AND_CUSTOM.md.
 */
export function getCustomTemplates(): WorkshopTemplate[] {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCustomTemplate(template: WorkshopTemplate): void {
  const list = getCustomTemplates();
  const index = list.findIndex((t) => t.id === template.id);
  const next = { ...template, isCustom: true };
  if (index >= 0) {
    list[index] = next;
  } else {
    list.push(next);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function deleteCustomTemplate(id: string): void {
  const list = getCustomTemplates().filter((t) => t.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

/** Generate a stable id for a new custom template (slug from name + timestamp to avoid collisions). */
export function generateCustomTemplateId(name: string): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .slice(0, 32) || 'custom';
  return `custom-${slug}-${Date.now()}`;
}

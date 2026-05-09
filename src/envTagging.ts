/**
 * envTagging.ts
 * Provides utilities for tagging environment variables with metadata labels.
 * Tags can be used for filtering, auditing, and documentation purposes.
 */

export type TagMap = Record<string, string[]>;

export interface TagRegistry {
  tags: TagMap;
  add: (key: string, ...tags: string[]) => void;
  remove: (key: string, tag: string) => void;
  get: (key: string) => string[];
  has: (key: string, tag: string) => boolean;
  findByTag: (tag: string) => string[];
  clear: (key: string) => void;
  reset: () => void;
}

export function createTagRegistry(): TagRegistry {
  const tags: TagMap = {};

  return {
    tags,

    add(key: string, ...newTags: string[]): void {
      if (!tags[key]) {
        tags[key] = [];
      }
      for (const tag of newTags) {
        if (!tags[key].includes(tag)) {
          tags[key].push(tag);
        }
      }
    },

    remove(key: string, tag: string): void {
      if (!tags[key]) return;
      tags[key] = tags[key].filter((t) => t !== tag);
    },

    get(key: string): string[] {
      return tags[key] ?? [];
    },

    has(key: string, tag: string): boolean {
      return (tags[key] ?? []).includes(tag);
    },

    findByTag(tag: string): string[] {
      return Object.entries(tags)
        .filter(([, tagList]) => tagList.includes(tag))
        .map(([key]) => key);
    },

    clear(key: string): void {
      delete tags[key];
    },

    reset(): void {
      for (const key of Object.keys(tags)) {
        delete tags[key];
      }
    },
  };
}

export function filterEnvByTag(
  env: Record<string, string>,
  registry: TagRegistry,
  tag: string
): Record<string, string> {
  const keys = registry.findByTag(tag);
  return Object.fromEntries(
    Object.entries(env).filter(([k]) => keys.includes(k))
  );
}

export function tagSummary(registry: TagRegistry): Record<string, string[]> {
  return { ...registry.tags };
}

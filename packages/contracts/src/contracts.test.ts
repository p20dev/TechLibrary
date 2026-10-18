import { describe, expect, it } from 'vitest';
import { topicRevisionInputSchema } from './index.js';

describe('topicRevisionInputSchema', () => {
  it('rejects invalid slugs and incomplete layered content', () => {
    expect(() => topicRevisionInputSchema.parse({ slug: 'Not valid' })).toThrow();
  });
});

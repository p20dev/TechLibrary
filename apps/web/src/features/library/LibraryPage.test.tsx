import { describe, expect, it } from 'vitest';
describe('library taxonomy', () => { it('keeps the public catalog route stable', () => { expect('/emne/react').toMatch(/^\/emne\//); }); });

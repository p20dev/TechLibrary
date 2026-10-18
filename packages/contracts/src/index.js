import { z } from 'zod';
export const topicTypes = ['technology', 'framework', 'library', 'language', 'runtime', 'tool', 'platform', 'standard', 'practice', 'architecture'];
export const relationTypes = ['uses', 'depends_on', 'alternative_to', 'integrates_with', 'supersedes', 'related_to'];
export const sourceTypes = ['documentation', 'changelog', 'release_feed', 'standards_body', 'official_repository'];
export const topicSectionSchema = z.object({
    introduction: z.string().min(1),
    concepts: z.array(z.string()),
    useCases: z.array(z.string()),
    benefits: z.array(z.string()),
    limitations: z.array(z.string()),
    avoidWhen: z.array(z.string()),
    compatibility: z.string(),
    requirements: z.array(z.string()),
    examples: z.array(z.object({ title: z.string(), language: z.string(), code: z.string() })),
    migrationNotes: z.array(z.string()),
    deprecations: z.array(z.string()),
    securityNotes: z.array(z.string())
});
export const topicRevisionInputSchema = z.object({
    title: z.string().min(2).max(120),
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    summary: z.string().min(20).max(500),
    audience: z.array(z.enum(['beginner', 'intermediate', 'advanced'])).min(1),
    type: z.enum(topicTypes),
    domains: z.array(z.string()).min(1),
    tags: z.array(z.string()),
    aliases: z.array(z.string()),
    currentVersion: z.string().nullable(),
    supportedVersions: z.array(z.string()),
    content: topicSectionSchema,
    changeNote: z.string().min(3)
});
export const findingStatusSchema = z.enum(['pending', 'approved', 'rejected', 'published', 'failed']);
//# sourceMappingURL=index.js.map
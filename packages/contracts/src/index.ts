import { z } from 'zod';

export const topicTypes = ['technology', 'framework', 'library', 'language', 'runtime', 'tool', 'platform', 'standard', 'practice', 'architecture'] as const;
export const relationTypes = ['uses', 'depends_on', 'alternative_to', 'integrates_with', 'supersedes', 'related_to'] as const;
export const sourceTypes = ['documentation', 'changelog', 'release_feed', 'standards_body', 'official_repository'] as const;

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

export type TopicRevisionInput = z.infer<typeof topicRevisionInputSchema>;
export type TopicSection = z.infer<typeof topicSectionSchema>;
export type TopicType = (typeof topicTypes)[number];
export type RelationType = (typeof relationTypes)[number];
export type SourceType = (typeof sourceTypes)[number];

export interface TopicListItem {
  id: string;
  slug: string;
  title: string;
  summary: string;
  type: TopicType;
  domains: string[];
  tags: string[];
  currentVersion: string | null;
  verifiedAt: string;
}

export interface TopicDetail extends TopicListItem {
  aliases: string[];
  audience: string[];
  supportedVersions: string[];
  content: TopicSection;
  revisionId: string;
  revisionNumber: number;
  relations: Array<{ type: RelationType; topic: TopicListItem }>;
  sources: Array<{ id: string; title: string; url: string; publisher: string; type: SourceType; verifiedAt: string; claims: string[] }>;
}

export interface Paginated<T> { items: T[]; total: number; page: number; pageSize: number }

export const findingStatusSchema = z.enum(['pending', 'approved', 'rejected', 'published', 'failed']);
export type FindingStatus = z.infer<typeof findingStatusSchema>;

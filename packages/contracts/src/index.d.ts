import { z } from 'zod';
export declare const topicTypes: readonly ["technology", "framework", "library", "language", "runtime", "tool", "platform", "standard", "practice", "architecture"];
export declare const relationTypes: readonly ["uses", "depends_on", "alternative_to", "integrates_with", "supersedes", "related_to"];
export declare const sourceTypes: readonly ["documentation", "changelog", "release_feed", "standards_body", "official_repository"];
export declare const topicSectionSchema: z.ZodObject<{
    introduction: z.ZodString;
    concepts: z.ZodArray<z.ZodString>;
    useCases: z.ZodArray<z.ZodString>;
    benefits: z.ZodArray<z.ZodString>;
    limitations: z.ZodArray<z.ZodString>;
    avoidWhen: z.ZodArray<z.ZodString>;
    compatibility: z.ZodString;
    requirements: z.ZodArray<z.ZodString>;
    examples: z.ZodArray<z.ZodObject<{
        title: z.ZodString;
        language: z.ZodString;
        code: z.ZodString;
    }, z.core.$strip>>;
    migrationNotes: z.ZodArray<z.ZodString>;
    deprecations: z.ZodArray<z.ZodString>;
    securityNotes: z.ZodArray<z.ZodString>;
}, z.core.$strip>;
export declare const topicRevisionInputSchema: z.ZodObject<{
    title: z.ZodString;
    slug: z.ZodString;
    summary: z.ZodString;
    audience: z.ZodArray<z.ZodEnum<{
        beginner: "beginner";
        intermediate: "intermediate";
        advanced: "advanced";
    }>>;
    type: z.ZodEnum<{
        technology: "technology";
        framework: "framework";
        library: "library";
        language: "language";
        runtime: "runtime";
        tool: "tool";
        platform: "platform";
        standard: "standard";
        practice: "practice";
        architecture: "architecture";
    }>;
    domains: z.ZodArray<z.ZodString>;
    tags: z.ZodArray<z.ZodString>;
    aliases: z.ZodArray<z.ZodString>;
    currentVersion: z.ZodNullable<z.ZodString>;
    supportedVersions: z.ZodArray<z.ZodString>;
    content: z.ZodObject<{
        introduction: z.ZodString;
        concepts: z.ZodArray<z.ZodString>;
        useCases: z.ZodArray<z.ZodString>;
        benefits: z.ZodArray<z.ZodString>;
        limitations: z.ZodArray<z.ZodString>;
        avoidWhen: z.ZodArray<z.ZodString>;
        compatibility: z.ZodString;
        requirements: z.ZodArray<z.ZodString>;
        examples: z.ZodArray<z.ZodObject<{
            title: z.ZodString;
            language: z.ZodString;
            code: z.ZodString;
        }, z.core.$strip>>;
        migrationNotes: z.ZodArray<z.ZodString>;
        deprecations: z.ZodArray<z.ZodString>;
        securityNotes: z.ZodArray<z.ZodString>;
    }, z.core.$strip>;
    changeNote: z.ZodString;
}, z.core.$strip>;
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
    relations: Array<{
        type: RelationType;
        topic: TopicListItem;
    }>;
    sources: Array<{
        id: string;
        title: string;
        url: string;
        publisher: string;
        type: SourceType;
        verifiedAt: string;
        claims: string[];
    }>;
}
export interface Paginated<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
}
export declare const findingStatusSchema: z.ZodEnum<{
    approved: "approved";
    rejected: "rejected";
    pending: "pending";
    published: "published";
    failed: "failed";
}>;
export type FindingStatus = z.infer<typeof findingStatusSchema>;

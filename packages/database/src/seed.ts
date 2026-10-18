import type Database from 'better-sqlite3';
import { createHash, randomUUID } from 'node:crypto';
import type { TopicRevisionInput, TopicType } from '@tech-library/contracts';

type SeedTopic = { slug: string; title: string; summary: string; type: TopicType; domain: string; url: string; publisher: string; version?: string };

export const seedTopics: SeedTopic[] = [
  { slug: 'html', title: 'HTML', summary: 'The semantic markup language that gives web documents their structure and meaning.', type: 'language', domain: 'Web platform', url: 'https://html.spec.whatwg.org/', publisher: 'WHATWG' },
  { slug: 'css', title: 'CSS', summary: 'The styling language for responsive layouts, visual design, animation, and presentation on the web.', type: 'language', domain: 'Web platform', url: 'https://www.w3.org/Style/CSS/', publisher: 'W3C' },
  { slug: 'javascript', title: 'JavaScript', summary: 'The web platform programming language, standardized as ECMAScript and used across browsers and servers.', type: 'language', domain: 'Web platform', url: 'https://tc39.es/ecma262/', publisher: 'TC39' },
  { slug: 'typescript', title: 'TypeScript', summary: 'A statically typed language that extends JavaScript and compiles to standards-compatible JavaScript.', type: 'language', domain: 'Frontend and UI', url: 'https://www.typescriptlang.org/docs/', publisher: 'Microsoft' },
  { slug: 'web-components', title: 'Web Components', summary: 'Browser standards for reusable custom elements with encapsulated templates and styling.', type: 'standard', domain: 'Web platform', url: 'https://developer.mozilla.org/en-US/docs/Web/API/Web_components', publisher: 'Mozilla' },
  { slug: 'accessibility', title: 'Web Accessibility', summary: 'Practices and standards for making digital experiences perceivable, operable, understandable, and robust.', type: 'practice', domain: 'Web platform', url: 'https://www.w3.org/WAI/standards-guidelines/wcag/', publisher: 'W3C' },
  { slug: 'react', title: 'React', summary: 'A component-oriented library for building interactive user interfaces from declarative state.', type: 'library', domain: 'Frontend and UI', url: 'https://react.dev/', publisher: 'Meta' },
  { slug: 'vite', title: 'Vite', summary: 'A fast frontend development server and production build tool based on native ES modules and Rollup.', type: 'tool', domain: 'Frontend and UI', url: 'https://vite.dev/guide/', publisher: 'Vite' },
  { slug: 'pwa', title: 'Progressive Web Apps', summary: 'Installable web applications that use platform capabilities such as service workers and manifests.', type: 'platform', domain: 'Frontend and UI', url: 'https://web.dev/explore/progressive-web-apps', publisher: 'Google' },
  { slug: 'design-systems', title: 'Design Systems', summary: 'Shared foundations, components, patterns, and governance for consistent product interfaces.', type: 'practice', domain: 'Frontend and UI', url: 'https://www.w3.org/WAI/ARIA/apg/', publisher: 'W3C' },
  { slug: 'nodejs', title: 'Node.js', summary: 'A cross-platform JavaScript runtime for servers, command-line tools, automation, and build systems.', type: 'runtime', domain: 'Backend and APIs', url: 'https://nodejs.org/docs/latest/api/', publisher: 'OpenJS Foundation' },
  { slug: 'rest', title: 'REST', summary: 'An architectural style for networked systems centered on resources and uniform HTTP semantics.', type: 'architecture', domain: 'Backend and APIs', url: 'https://www.rfc-editor.org/rfc/rfc9110', publisher: 'IETF' },
  { slug: 'graphql', title: 'GraphQL', summary: 'A typed query language and execution model for APIs where clients select the data they need.', type: 'standard', domain: 'Backend and APIs', url: 'https://spec.graphql.org/', publisher: 'GraphQL Foundation' },
  { slug: 'openapi', title: 'OpenAPI', summary: 'A machine-readable specification for describing HTTP APIs, operations, schemas, and authentication.', type: 'standard', domain: 'Backend and APIs', url: 'https://spec.openapis.org/oas/latest.html', publisher: 'OpenAPI Initiative' },
  { slug: 'websockets', title: 'WebSocket', summary: 'A persistent, full-duplex protocol for bidirectional communication between clients and servers.', type: 'standard', domain: 'Backend and APIs', url: 'https://www.rfc-editor.org/rfc/rfc6455', publisher: 'IETF' },
  { slug: 'sqlite', title: 'SQLite', summary: 'An embedded transactional relational database stored in a portable single-file format.', type: 'technology', domain: 'Data', url: 'https://sqlite.org/docs.html', publisher: 'SQLite Consortium' },
  { slug: 'postgresql', title: 'PostgreSQL', summary: 'An extensible open-source relational database with strong transactional and standards support.', type: 'technology', domain: 'Data', url: 'https://www.postgresql.org/docs/', publisher: 'PostgreSQL Global Development Group' },
  { slug: 'database-indexing', title: 'Database Indexing', summary: 'Data structures and query-planning techniques that trade storage and write cost for faster reads.', type: 'practice', domain: 'Data', url: 'https://www.postgresql.org/docs/current/indexes.html', publisher: 'PostgreSQL Global Development Group' },
  { slug: 'data-migrations', title: 'Database Migrations', summary: 'Version-controlled, repeatable changes that evolve database schemas and data safely over time.', type: 'practice', domain: 'Data', url: 'https://www.sqlite.org/lang_altertable.html', publisher: 'SQLite Consortium' },
  { slug: 'react-native', title: 'React Native', summary: 'A React renderer for creating native mobile applications using JavaScript and platform components.', type: 'framework', domain: 'Mobile and desktop', url: 'https://reactnative.dev/docs/getting-started', publisher: 'Meta' },
  { slug: 'electron', title: 'Electron', summary: 'A framework for desktop applications that combines Chromium, Node.js, and web technologies.', type: 'framework', domain: 'Mobile and desktop', url: 'https://www.electronjs.org/docs/latest/', publisher: 'OpenJS Foundation' },
  { slug: 'tauri', title: 'Tauri', summary: 'A toolkit for small desktop and mobile applications using a system webview and a Rust backend.', type: 'framework', domain: 'Mobile and desktop', url: 'https://v2.tauri.app/', publisher: 'Tauri Programme' },
  { slug: 'docker', title: 'Docker', summary: 'A platform for packaging and running applications as isolated, reproducible containers.', type: 'platform', domain: 'DevOps and cloud', url: 'https://docs.docker.com/', publisher: 'Docker' },
  { slug: 'kubernetes', title: 'Kubernetes', summary: 'A declarative orchestration platform for deploying, scaling, and operating container workloads.', type: 'platform', domain: 'DevOps and cloud', url: 'https://kubernetes.io/docs/', publisher: 'CNCF' },
  { slug: 'github-actions', title: 'GitHub Actions', summary: 'Repository-integrated automation for continuous integration, delivery, and maintenance workflows.', type: 'platform', domain: 'DevOps and cloud', url: 'https://docs.github.com/actions', publisher: 'GitHub' },
  { slug: 'infrastructure-as-code', title: 'Infrastructure as Code', summary: 'Managing infrastructure through versioned, reviewable, and repeatable declarative definitions.', type: 'practice', domain: 'DevOps and cloud', url: 'https://developer.hashicorp.com/terraform/docs', publisher: 'HashiCorp' },
  { slug: 'automated-testing', title: 'Automated Testing', summary: 'Repeatable checks at multiple levels that provide confidence in software behavior and change.', type: 'practice', domain: 'Testing and observability', url: 'https://vitest.dev/guide/', publisher: 'Vitest' },
  { slug: 'observability', title: 'Observability', summary: 'Understanding system behavior through correlated telemetry such as logs, metrics, and traces.', type: 'practice', domain: 'Testing and observability', url: 'https://opentelemetry.io/docs/', publisher: 'CNCF' },
  { slug: 'web-performance', title: 'Web Performance', summary: 'Measuring and improving loading, responsiveness, rendering stability, and resource efficiency.', type: 'practice', domain: 'Testing and observability', url: 'https://web.dev/explore/learn-performance', publisher: 'Google' },
  { slug: 'owasp-top-ten', title: 'OWASP Top 10', summary: 'A widely used awareness document describing major security risks to modern web applications.', type: 'standard', domain: 'Security and privacy', url: 'https://owasp.org/www-project-top-ten/', publisher: 'OWASP' },
  { slug: 'oauth-2', title: 'OAuth 2.0', summary: 'An authorization framework for delegated access to protected HTTP resources.', type: 'standard', domain: 'Security and privacy', url: 'https://www.rfc-editor.org/rfc/rfc6749', publisher: 'IETF' },
  { slug: 'content-security-policy', title: 'Content Security Policy', summary: 'A browser security standard that restricts resource loading and mitigates injection attacks.', type: 'standard', domain: 'Security and privacy', url: 'https://www.w3.org/TR/CSP3/', publisher: 'W3C' }
];

function payload(topic: SeedTopic): TopicRevisionInput {
  return {
    title: topic.title, slug: topic.slug, summary: topic.summary,
    audience: ['beginner', 'intermediate', 'advanced'], type: topic.type,
    domains: [topic.domain], tags: [topic.domain.toLowerCase(), topic.type], aliases: [],
    currentVersion: topic.version ?? null, supportedVersions: [],
    content: {
      introduction: `${topic.title} is a core part of modern software development. This entry provides a practical map of the technology, its trade-offs, and its official sources.`,
      concepts: ['Core model and terminology', 'Ecosystem and interoperability', 'Lifecycle and maintenance'],
      useCases: [`Evaluate ${topic.title} for new and existing systems`, 'Understand integration boundaries and operational impact'],
      benefits: ['Backed by an official, traceable primary source', 'Presented in layers for readers with different experience levels'],
      limitations: ['Exact capabilities and support vary by version and platform'],
      avoidWhen: ['The operational cost or compatibility constraints exceed the value for the project'],
      compatibility: 'Consult the linked official documentation for current platform and version compatibility.',
      requirements: ['Verify supported versions before adoption', 'Test the intended production environment'],
      examples: [], migrationNotes: [], deprecations: [],
      securityNotes: ['Review the official security guidance and supported release policy before production use.']
    },
    changeNote: 'Initial curated catalog entry'
  };
}

export function seedDatabase(sqlite: Database.Database): number {
  const now = new Date().toISOString();
  const insertTopic = sqlite.prepare('INSERT OR IGNORE INTO topics(id, slug, active_revision_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?)');
  const insertRevision = sqlite.prepare('INSERT OR IGNORE INTO revisions(id, topic_id, number, status, payload, change_note, created_at, reviewed_at, published_at) VALUES (?, ?, 1, ?, ?, ?, ?, ?, ?)');
  const insertSource = sqlite.prepare('INSERT OR IGNORE INTO sources(id, url, publisher, source_type, title, fetched_at, verified_at, fingerprint, claims) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
  const linkSource = sqlite.prepare('INSERT OR IGNORE INTO revision_sources(revision_id, source_id) VALUES (?, ?)');
  const indexSearch = sqlite.prepare('INSERT INTO topic_search(topic_id, title, summary, aliases, content, tags) VALUES (?, ?, ?, ?, ?, ?)');
  const countBefore = Number((sqlite.prepare('SELECT count(*) AS count FROM topics').get() as { count: number }).count);

  sqlite.transaction(() => {
    for (const item of seedTopics) {
      const topicId = `topic_${item.slug}`;
      const revisionId = `revision_${item.slug}_1`;
      const sourceId = `source_${item.slug}_official`;
      const data = payload(item);
      insertTopic.run(topicId, item.slug, revisionId, now, now);
      insertRevision.run(revisionId, topicId, 'approved', JSON.stringify(data), data.changeNote, now, now, now);
      insertSource.run(sourceId, item.url, item.publisher, 'documentation', `${item.title} official documentation`, now, now, createHash('sha256').update(item.url).digest('hex'), JSON.stringify(['Official definition and current technical guidance']));
      linkSource.run(revisionId, sourceId);
      if (!(sqlite.prepare('SELECT 1 FROM topic_search WHERE topic_id = ?').get(topicId))) {
        indexSearch.run(topicId, data.title, data.summary, data.aliases.join(' '), JSON.stringify(data.content), data.tags.join(' '));
      }
      sqlite.prepare('INSERT OR IGNORE INTO source_subscriptions(id, topic_id, adapter, url, enabled) VALUES (?, ?, ?, ?, 1)').run(randomUUID(), topicId, 'official-page', item.url);
    }
  })();
  const countAfter = Number((sqlite.prepare('SELECT count(*) AS count FROM topics').get() as { count: number }).count);
  return countAfter - countBefore;
}

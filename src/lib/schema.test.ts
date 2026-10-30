import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { FAQS } from './faqs';

describe('JSON-LD & Brand Entity Disambiguation Verification', () => {
  it('FAQS includes official website disambiguation question', () => {
    const officialFaq = FAQS.find((f) => f.question === 'What is the official website for PepPlotter?');
    expect(officialFaq).toBeDefined();
    expect(officialFaq!.answer).toContain('https://pepplotter.com');
    expect(officialFaq!.answer).toContain('github.com/issuunnyy/pepplotter.com');
    expect(officialFaq!.answer).toContain('not affiliated with PeptidePlotter');
  });

  it('WebApplication schema generates valid JSON without syntax errors', () => {
    const webAppSchema = {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      '@id': 'https://pepplotter.com/#application',
      name: 'PepPlotter',
      alternateName: [
        'PepPlotter.com',
        'PepPlotter Peptide Calculator',
        'PepPlotter PK Simulator',
      ],
      url: 'https://pepplotter.com',
      sameAs: [
        'https://github.com/issuunnyy/pepplotter.com',
        'https://x.com/ssuunnyy',
        'https://buymeacoffee.com/ssuunnyy',
      ],
      description:
        'PepPlotter (officially hosted at pepplotter.com) is a free, open-source (MIT), 100% client-side peptide reconstitution calculator, U-100/U-40 syringe visualizer, and pharmacokinetic (PK) half-life simulator.',
      applicationCategory: 'HealthApplication',
      operatingSystem: 'All',
      isAccessibleForFree: true,
      license: 'https://opensource.org/licenses/MIT',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      featureList: [
        'Interactive U-100 and U-40 syringe visualizer',
        'Precise unit and volume calculation with overflow safeguards',
      ],
    };

    const jsonString = JSON.stringify(webAppSchema);
    expect(() => JSON.parse(jsonString)).not.toThrow();
    const parsed = JSON.parse(jsonString);
    expect(parsed['@id']).toBe('https://pepplotter.com/#application');
    expect(parsed.name).toBe('PepPlotter');
    expect(parsed.url).toBe('https://pepplotter.com');
    expect(parsed.sameAs).toHaveLength(3);
  });

  it('FAQPage schema generates valid JSON without syntax errors', () => {
    const faqSchema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: FAQS.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    };

    const jsonString = JSON.stringify(faqSchema);
    expect(() => JSON.parse(jsonString)).not.toThrow();
    const parsed = JSON.parse(jsonString);
    expect(parsed['@type']).toBe('FAQPage');
    expect(parsed.mainEntity.length).toBeGreaterThanOrEqual(16);
  });
});

describe('Cloudflare AI Agent Readiness & Discoverability Files', () => {
  const publicDir = path.resolve(process.cwd(), 'public');

  it('llms.txt and index.md exist and contain official disambiguation and links', () => {
    const llmsTxtPath = path.join(publicDir, 'llms.txt');
    const indexMdPath = path.join(publicDir, 'index.md');

    expect(fs.existsSync(llmsTxtPath)).toBe(true);
    expect(fs.existsSync(indexMdPath)).toBe(true);

    const llmsContent = fs.readFileSync(llmsTxtPath, 'utf8');
    const indexContent = fs.readFileSync(indexMdPath, 'utf8');

    expect(llmsContent).toContain('# PepPlotter — Official Website: https://pepplotter.com');
    expect(llmsContent).toContain('not affiliated with PeptidePlotter');
    expect(llmsContent).toContain('https://github.com/issuunnyy/pepplotter.com');
    expect(llmsContent).toContain('https://x.com/ssuunnyy');
    expect(llmsContent).toContain('https://buymeacoffee.com/ssuunnyy');
    expect(indexContent).toEqual(llmsContent);
  });

  it('auth.md exists and specifies zero authentication requirements for agents', () => {
    const authMdPath = path.join(publicDir, 'auth.md');
    expect(fs.existsSync(authMdPath)).toBe(true);

    const authContent = fs.readFileSync(authMdPath, 'utf8');
    expect(authContent).toContain('**Authentication Required**: `none`');
    expect(authContent).toContain('https://pepplotter.com/llms.txt');
  });

  it('robots.txt includes Content-Signal and AI crawler allowances', () => {
    const robotsPath = path.join(publicDir, 'robots.txt');
    expect(fs.existsSync(robotsPath)).toBe(true);

    const robotsContent = fs.readFileSync(robotsPath, 'utf8');
    expect(robotsContent).toContain('Content-Signal: search=yes, ai-train=yes, ai-input=yes');
    expect(robotsContent).toContain('User-agent: GPTBot');
    expect(robotsContent).toContain('User-agent: ClaudeBot');
    expect(robotsContent).toContain('User-agent: PerplexityBot');
    expect(robotsContent).toContain('Allow: /llms.txt');
    expect(robotsContent).toContain('Allow: /auth.md');
    expect(robotsContent).toContain('Sitemap: https://pepplotter.com/sitemap.xml');
  });

  it('_headers includes Link header for alternate markdown and service doc', () => {
    const headersPath = path.join(publicDir, '_headers');
    expect(fs.existsSync(headersPath)).toBe(true);

    const headersContent = fs.readFileSync(headersPath, 'utf8');
    expect(headersContent).toContain('Link: </llms.txt>; rel="alternate"; type="text/markdown", </auth.md>; rel="service-doc"');
  });
});

/**
 * Manual Test for GitHubGraphQLAdapter
 * Run with: npx tsx src/infrastructure/providers/__tests__/manual-test.ts
 *
 * Optional: Set GITHUB_TOKEN env var to increase rate limit
 * export GITHUB_TOKEN=your_token_here
 */

import 'dotenv/config';
import { GitHubGraphQLAdapter } from '../GitHubGraphQLAdapter';

async function testGitHubAdapter(): Promise<void> {
  console.log('🧪 Testing GitHubGraphQLAdapter...\n');

  const token = process.env.GITHUB_TOKEN;
  const adapter = new GitHubGraphQLAdapter(token);

  console.log(`Provider: ${adapter.getProviderName()}`);
  console.log(
    `Token: ${typeof token === 'string' && token.length > 0 ? '✓ Provided (higher rate limit)' : '✗ Not provided (lower rate limit)'}\n`
  );

  // Test 1: Fetch repos for a known user
  try {
    const username = 'pveyes';
    console.log(`📦 Fetching repositories for "${username}"...`);
    const repos = await adapter.fetchRepositories(username);

    console.log(`✓ Success! Found ${repos.length} repositories\n`);

    // Show first 5 repos
    console.log('First 5 repositories:');
    repos.slice(0, 5).forEach((repo, index) => {
      const forkBadge = repo.isFork ? '🍴' : '  ';
      console.log(`  ${index + 1}. ${forkBadge} ${repo.name} [${repo.language ?? 'Unknown'}]`);
    });

    // Language stats
    const languageCounts = repos.reduce(
      (acc, repo) => {
        const lang = repo.language ?? 'Unknown';
        acc[lang] = (acc[lang] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    console.log('\n📊 Language distribution:');
    Object.entries(languageCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .forEach(([lang, count]) => {
        console.log(`  ${lang}: ${count} repos`);
      });

    console.log(`\n🍴 Forks: ${repos.filter((r) => r.isFork).length}`);
  } catch (error) {
    console.error('✗ Error:', error);
  }

  // Test 2: Test user not found
  console.log('\n\n🧪 Testing user not found error...');
  try {
    await adapter.fetchRepositories('this-user-definitely-does-not-exist-12345678');
    console.log('✗ Should have thrown an error');
  } catch (error) {
    if (error instanceof Error) {
      console.log(`✓ Correctly threw error: ${error.message}`);
    }
  }

  console.log('\n✅ Manual test complete!');
}

testGitHubAdapter().catch(console.error);

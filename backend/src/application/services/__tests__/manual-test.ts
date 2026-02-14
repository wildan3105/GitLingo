/**
 * Manual Test for SearchService
 * Run with: npx tsx src/application/services/__tests__/manual-test.ts
 *
 * Requires GITHUB_TOKEN in .env for higher rate limits
 */

import 'dotenv/config';
import { GitHubGraphQLAdapter } from '../../../infrastructure/providers/GitHubGraphQLAdapter';
import { SearchService } from '../SearchService';

async function testSearchService(): Promise<void> {
  console.log('🧪 Testing SearchService...\n');

  // Setup
  const token = process.env.GITHUB_TOKEN;
  const adapter = new GitHubGraphQLAdapter(token);
  const searchService = new SearchService(adapter);

  console.log(`Provider: ${adapter.getProviderName()}`);
  console.log(
    `Token: ${typeof token === 'string' && token.length > 0 ? '✓ Provided' : '✗ Not provided'}\n`
  );

  // Test 1: Successful search
  const username = 'sonnylazuardi';
  console.log(`📊 Test 1: Search for "${username}"...`);
  try {
    const result = await searchService.searchLanguageStatistics(username);

    if (!result.ok) {
      console.error('✗ Error:', result.error);
      return;
    }

    console.log(`✓ Success!\n`);
    console.log(`Profile:`);
    console.log(`  Username: ${result.profile.username}`);
    console.log(`  Type: ${result.profile.type}`);
    console.log(`  Provider ID: ${result.profile.providerUserId}\n`);

    console.log(`Metadata:`);
    console.log(`  Generated at: ${result.metadata.generatedAt}`);
    console.log(`  Unit: ${result.metadata.unit}`);
    console.log(`  Total repos: ${result.metadata.limit}\n`);

    console.log(`Language Statistics (${result.series.length} entries):`);
    result.series.forEach((stat, index) => {
      const emoji = stat.key === '__forks__' ? '🍴' : '📦';
      console.log(
        `  ${index + 1}. ${emoji} ${stat.label}: ${stat.value} ${result.metadata.unit} [${stat.color}]`
      );
    });
  } catch (error) {
    console.error('✗ Unexpected error:', error);
  }

  // Test 2: User not found
  console.log('\n\n📊 Test 2: Search for non-existent user...');
  try {
    const result = await searchService.searchLanguageStatistics(
      'this-user-does-not-exist-12345678'
    );

    if (result.ok) {
      console.log('✗ Should have returned an error');
      return;
    }

    console.log(`✓ Correctly returned error response`);
    console.log(`  Code: ${result.error.code}`);
    console.log(`  Message: ${result.error.message}`);
  } catch (error) {
    console.error('✗ Unexpected error:', error);
  }

  // Test 3: Test with another user
  console.log('\n\n📊 Test 3: Search for "torvalds"...');
  try {
    const result = await searchService.searchLanguageStatistics('torvalds');

    if (!result.ok) {
      console.error('✗ Error:', result.error);
      return;
    }

    console.log(`✓ Success! Found ${result.metadata.limit} repositories\n`);
    console.log(`Top 5 languages:`);
    result.series.slice(0, 5).forEach((stat, index) => {
      console.log(`  ${index + 1}. ${stat.label}: ${stat.value} repos [${stat.color}]`);
    });
  } catch (error) {
    console.error('✗ Unexpected error:', error);
  }

  console.log('\n✅ SearchService test complete!');
}

testSearchService().catch(console.error);

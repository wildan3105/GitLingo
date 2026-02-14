/**
 * GitLingo Backend - Entry Point
 * DDD-based orchestration layer for version control statistics
 */

import { getLanguageColor } from './shared';

const lang = 'Go';

const main = (): void => {
  console.log('🚀 GitLingo Backend - DDD Structure Ready');
  console.log('📦 Domain models: Repository, Profile, LanguageStatistic');
  console.log('🔌 Provider port interface ready');
  console.log(`🎨 Language colors loaded (example: ${lang} = ${getLanguageColor(lang)})`);
  console.log('🔥 Ready for Task 4: GitHub Adapter');
};

main();

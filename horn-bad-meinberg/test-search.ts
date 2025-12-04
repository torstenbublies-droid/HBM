import { performWebSearch, requiresWebSearch } from './server/web-search';

async function test() {
  const query = "wer ist deutscher bundeskanzler?";
  console.log("Query:", query);
  console.log("Requires web search:", requiresWebSearch(query));
  
  if (requiresWebSearch(query)) {
    const results = await performWebSearch(query);
    console.log("Search results:", results);
  }
}

test().catch(console.error);

/**
 * Manual mock for @octokit/graphql
 * This allows us to mock the GraphQL client in tests while avoiding ES module issues
 */

// Create a mock function that actually makes HTTP requests so nock can intercept
const createGraphqlMock = () => {
  const mockFn = async (query, params) => {
    // Make a real HTTP request that nock can intercept
    const response = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authorization: 'token test_token',
      },
      body: JSON.stringify({ query, variables: params }),
    });

    if (!response.ok) {
      const error = new Error(`HTTP ${response.status}`);
      error.status = response.status;
      error.message = await response.text();
      throw error;
    }

    return response.json();
  };

  mockFn.defaults = () => createGraphqlMock();

  return mockFn;
};

module.exports = {
  graphql: createGraphqlMock(),
};

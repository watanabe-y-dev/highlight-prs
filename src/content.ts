type PullRequest = {
  id: number,
  number: number,
  title: string,
  requested_reviewers: Reviewer[],
};

type Reviewer = {
  id: number,
  login: string,
};

const getUsername = async (token: string): Promise<string | null> => {
  try {
    const response = await fetch("https://api.github.com/user", {
      headers: {
        authorization: `token ${token}`,
      },
    });
    const data = await response.json();
    return data.login;
  } catch (error) {
    console.error("Error fetching GitHub username:", error);
    return null;
  }
};

const getPRsOpened = async (token: string): Promise<PullRequest[]> => {
  try {
    const url = "https://api.github.com/repos/CyberAgentAI/aoc-satudora-app/pulls?state=open"
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    return data as PullRequest[];
  } catch (error) {
    console.error("Error fetching GitHub Pull Requests:", error);
    return [];
  }
};

const highlightAssignedPRs = async (token: string): Promise<void> => {
  const username = await getUsername(token);

  if (!username) {
    return;
  }

  const prs = await getPRsOpened(token);
  const prElements = prs
    .filter((pr) => {
      const reviewerNames = pr.requested_reviewers.map((reviewer) => reviewer.login);
      return reviewerNames.indexOf(username) >= 0;
    })
    .map((pr) => `issue_${pr.number}`)
    .map((id) => document.getElementById(id));

  prElements.forEach((e) => {
    if (e) {
      e.style.border = "1px dashed #ffa500";
    }
  });
}

highlightAssignedPRs("MY_GITHUB_TOKEN");

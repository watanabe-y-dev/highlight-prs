import CryptoJS from "crypto-js";

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

// トークンの復号
const decryptToken = (encryptedToken: string, secretKey: string): string => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedToken, secretKey);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    if (!decrypted) {
      throw new Error("復号化に失敗しました");
    }
    return decrypted;
  } catch (error) {
    console.error("トークンの復号に失敗しました:", error);
    throw error;
  }
}

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

const highlightAssignedPRs = async (): Promise<void> => {
  try {
    // 保存されたトークンとシークレットキーを取得
    const { githubToken, secretKey } = await chrome.storage.local.get(["githubToken", "secretKey"]);
    
    if (!githubToken || !secretKey) {
      console.error("GitHubトークンまたはシークレットキーが見つかりません");
      return;
    }

    // トークンを復号化
    const decryptedToken = decryptToken(githubToken, secretKey);
    
    const username = await getUsername(decryptedToken);
    if (!username) {
      console.error("GitHubユーザー名の取得に失敗しました");
      return;
    }

    const prs = await getPRsOpened(decryptedToken);
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
  } catch (error) {
    console.error("PRのハイライト処理中にエラーが発生しました:", error);
  }
}

// ページ読み込み時に実行
document.addEventListener("DOMContentLoaded", () => {
  highlightAssignedPRs();
});

import CryptoJS from "crypto-js";

// シークレットキーの生成（ユーザーごとに一意のキーを生成）
const generateSecretKey = (): string => {
  return CryptoJS.lib.WordArray.random(16).toString();
};

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("settings-form") as HTMLFormElement;
  const message = document.getElementById("message") as HTMLElement;
  const saveButton = document.getElementById("save-button") as HTMLButtonElement;
  const tokenInput = document.getElementById("token") as HTMLInputElement;

  // シークレットキーの取得または生成
  chrome.storage.local.get("secretKey", (data) => {
    let secretKey = data.secretKey;
    if (!secretKey) {
      secretKey = generateSecretKey();
      chrome.storage.local.set({ secretKey });
    }
  });

  // 保存済みのトークンを表示
  chrome.storage.local.get("githubToken", (data) => {
    if (data.githubToken) {
      tokenInput.placeholder = "トークンが保存されています";
      tokenInput.type = "text";
      tokenInput.value = "********";
      saveButton.classList.add("has-token");
    }
  });

  // トークン入力時のイベント
  tokenInput.addEventListener("input", () => {
    if (tokenInput.value && tokenInput.value !== "********") {
      saveButton.classList.add("has-token");
    } else {
      saveButton.classList.remove("has-token");
    }
  });

  // トークンフィールドフォーカス時のイベント
  tokenInput.addEventListener("focus", () => {
    if (tokenInput.value === "********") {
      tokenInput.type = "password";
      tokenInput.value = "";
      saveButton.classList.remove("has-token");
    }
  });

  // トークンフィールドフォーカスアウト時のイベント
  tokenInput.addEventListener("blur", () => {
    if (!tokenInput.value) {
      tokenInput.type = "text";
      tokenInput.value = "********";
      saveButton.classList.add("has-token");
    }
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    saveButton.disabled = true;

    const token = tokenInput.value;
    if (!token || token === "********") {
      showMessage("トークンを入力してください", "error");
      saveButton.disabled = false;
      return;
    }

    try {
      const { secretKey } = await chrome.storage.local.get("secretKey");
      if (!secretKey) {
        throw new Error("シークレットキーが見つかりません");
      }

      const encryptedToken = encryptToken(token, secretKey);
      await chrome.storage.local.set({ githubToken: encryptedToken });
      
      showMessage("トークンが保存されました", "success");
      tokenInput.type = "text";
      tokenInput.value = "********";
      saveButton.classList.add("has-token");
    } catch (error) {
      console.error("トークンの保存に失敗しました:", error);
      showMessage("トークンの保存に失敗しました", "error");
    } finally {
      saveButton.disabled = false;
    }
  });

  // メッセージ表示関数
  const showMessage = (text: string, type: "success" | "error") => {
    message.textContent = text;
    message.className = `message ${type}`;
    message.style.display = "block";
    setTimeout(() => {
      message.style.display = "none";
    }, 3000);
  };
});

// トークンの暗号化
const encryptToken = (token: string, secretKey: string): string => {
  try {
    return CryptoJS.AES.encrypt(token, secretKey).toString();
  } catch (error) {
    console.error("トークンの暗号化に失敗しました:", error);
    throw error;
  }
}

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

// トークンの取得
const getToken = async (): Promise<string | null> => {
  try {
    const { githubToken, secretKey } = await chrome.storage.local.get(["githubToken", "secretKey"]);
    if (!githubToken || !secretKey) {
      return null;
    }
    return decryptToken(githubToken, secretKey);
  } catch (error) {
    console.error("トークンの取得に失敗しました:", error);
    return null;
  }
}

import CryptoJS from "crypto-js";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("settings-form") as HTMLFormElement;
  const message = document.getElementById("message") as HTMLElement;

  // トークン保存イベントの設定
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const token = (document.getElementById("token") as HTMLInputElement).value;

    // トークンをChromeストレージに保存
    // chrome.storage.sync.set({ githubToken: token }, () => {
    //   message.textContent = "Token is saved!";
    //   setTimeout(() => {
    //     message.textContent = "";
    //   }, 3000);
    // });
  });
});

// トークンの暗号化
const encryptToken = (token: string, secretKey: string): string => {
  return CryptoJS.AES.encrypt(token, secretKey).toString();
}

// トークンの復号
const decryptToken = (encryptedToken: string, secretKey: string): string => {
  const bytes = CryptoJS.AES.decrypt(encryptedToken, secretKey);
  return bytes.toString(CryptoJS.enc.Utf8);
}

// トークンの保存
const saveToken = (token: string, secretKey: string): void =>  {
  const encryptedToken = encryptToken(token, secretKey);
  chrome.storage.sync.set({ githubToken: encryptedToken }, () => {
    console.log("Token is saved!");
  });
}

// トークンの取得
const getToken = (secretKey: string, callback: (token: string | null) => void): void => {
  chrome.storage.sync.get("githubToken", (data) => {
    if (data.githubToken) {
      const decryptedToken = decryptToken(data.githubToken, secretKey);
      callback(decryptedToken);
    } else {
      callback(null);
    }
  });
}

/* ===========================================================
   ケアスイート for Claude  ── 共通ユーティリティ
   =========================================================== */

/** トースト通知 */
function toast(msg) {
  let el = document.getElementById("toast");
  if (!el) {
    el = document.createElement("div");
    el.id = "toast";
    el.className = "toast";
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove("show"), 1800);
}

/** クリップボードへコピー */
async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    toast("コピーしました ✓");
  } catch (e) {
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
    toast("コピーしました ✓");
  }
}

/** 出力ボックスの内容をコピー */
function copyOutput(id) {
  const el = document.getElementById(id);
  if (!el || !el.textContent.trim()) { toast("先に生成してください"); return; }
  copyText(el.textContent);
}

/** Claude（claude.ai）を新しいタブで開く */
function openClaude() {
  window.open("https://claude.ai/new", "_blank");
}

/** localStorage 保存ヘルパー */
const Store = {
  get(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch (e) { return fallback; }
  },
  set(key, val) { localStorage.setItem(key, JSON.stringify(val)); },
  del(key) { localStorage.removeItem(key); }
};

/** フォームの全入力値をオブジェクトで取得（name属性ベース） */
function readForm(formEl) {
  const data = {};
  formEl.querySelectorAll("[name]").forEach((el) => {
    if (el.type === "checkbox") {
      if (!data[el.name]) data[el.name] = [];
      if (el.checked) data[el.name].push(el.value);
    } else if (el.type === "radio") {
      if (el.checked) data[el.name] = el.value;
    } else {
      data[el.name] = el.value;
    }
  });
  return data;
}

/** チップ（複数選択トグル）の初期化 */
function initChips(container) {
  container.querySelectorAll(".chip").forEach((chip) => {
    chip.addEventListener("click", () => chip.classList.toggle("on"));
  });
}
function selectedChips(container) {
  return [...container.querySelectorAll(".chip.on")].map((c) => c.textContent.trim());
}

/* ===========================================================
   お問い合わせ（メール起動）
   静的サイトのため、入力内容を本文に差し込んでメーラーを起動します。
   =========================================================== */
const CONTACT_EMAIL = "kiminari.takahashi@pluspivot.co.jp";
// Web3Forms のアクセスキー（https://web3forms.com で上記メール宛に発行）。
// ※このキーは「指定メールへの送信」専用で、公開しても問題ありません。
const WEB3FORMS_ACCESS_KEY = "b52e86ba-a0e8-4d34-b071-e2c2c71fd95a";
const TOOL_OPTIONS = [
  "シフト作成ツール",
  "介護記録 作成支援",
  "加算区分 判定ツール",
  "水分摂取 記録・管理",
  "バイタル記録",
  "食事摂取量 記録",
  "申し送り 作成支援",
  "ケアプラン 文案作成",
  "服薬管理",
  "ヒヤリハット・事故報告 作成支援",
  "転倒リスク評価",
  "レクリエーション企画",
  "複数のツール / その他",
];

/** 「詳細を問い合わせる」── メーラーを直接起動 */
function contactByMail(tool) {
  const subject = `【ケアスイート】お問い合わせ${tool ? "（" + tool + "）" : ""}`;
  const body =
`ケアスイート for Claude へのお問い合わせ${tool ? "（対象：" + tool + "）" : ""}

──────────────
※ 以下にご記入のうえ送信してください。
お名前：
施設名：
ご連絡先（電話）：
ご連絡先（メール）：
お問い合わせ内容：
──────────────`;
  window.location.href =
    `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/** お問い合わせフォームのHTMLを生成 */
function contactSectionHTML(currentTool) {
  const opts = TOOL_OPTIONS.map(
    (t) => `<option value="${t}" ${t === currentTool ? "selected" : ""}>${t}</option>`
  ).join("");
  return `
  <section class="card" id="contact" style="border-color:var(--teal-light);">
    <h2 style="font-size:1.3rem;">お問い合わせ</h2>
    <p style="color:var(--ink-soft);margin-top:-4px;">導入のご相談・カスタマイズのご要望など、お気軽にどうぞ。</p>
    <form onsubmit="submitContact(event)">
      <div class="field">
        <label>気になるAIツール</label>
        <select name="tool" required>
          <option value="" disabled ${currentTool ? "" : "selected"}>選択してください</option>
          ${opts}
        </select>
      </div>
      <div class="grid-2">
        <div class="field"><label>お名前 <span class="hint">必須</span></label><input type="text" name="name" required placeholder="例：高橋 太郎"></div>
        <div class="field"><label>施設名 <span class="hint">必須</span></label><input type="text" name="facility" required placeholder="例：◯◯介護施設"></div>
      </div>
      <div class="grid-2">
        <div class="field"><label>ご連絡先（電話番号） <span class="hint">必須</span></label><input type="tel" name="phone" required placeholder="例：03-1234-5678"></div>
        <div class="field"><label>ご連絡先（メールアドレス） <span class="hint">必須</span></label><input type="email" name="email" required placeholder="例：info@example.com"></div>
      </div>
      <div class="field">
        <label>お問い合わせ内容 <span class="hint">任意</span></label>
        <textarea name="message" rows="4" placeholder="ご相談内容をご記入ください（任意）"></textarea>
      </div>
      <!-- スパム対策（人間には見えない） -->
      <input type="checkbox" name="botcheck" tabindex="-1" autocomplete="off" style="display:none !important;">
      <button type="submit" class="btn btn-primary">送信する</button>
      <button type="button" class="btn btn-ghost btn-sm" style="margin-left:10px;" onclick="contactByMail('${(currentTool || "").replace(/'/g, "")}')">または直接メールする ✉️</button>
      <p class="hint" id="contact-status" style="margin-top:12px;">送信ボタンを押すと内容が送信され、担当者に通知が届きます。</p>
    </form>
  </section>`;
}

/** フォーム送信 → Web3Forms へ送信（ページ遷移なし） */
async function submitContact(e) {
  e.preventDefault();
  const f = e.target;
  const d = readForm(f);
  const status = f.querySelector("#contact-status");

  // アクセスキー未設定時はメーラー起動にフォールバック
  if (!WEB3FORMS_ACCESS_KEY || WEB3FORMS_ACCESS_KEY === "YOUR_ACCESS_KEY_HERE") {
    if (status) status.textContent = "（フォーム送信は準備中です。メールソフトを起動します）";
    contactByMail(d.tool);
    return;
  }

  const btn = f.querySelector('button[type="submit"]');
  const orig = btn.textContent;
  btn.disabled = true; btn.textContent = "送信中…";
  if (status) { status.style.color = "var(--ink-soft)"; status.textContent = "送信しています…"; }

  const payload = {
    access_key: WEB3FORMS_ACCESS_KEY,
    subject: `【ケアスイート】お問い合わせ（${d.tool}）`,
    from_name: "ケアスイート for Claude",
    "気になるAIツール": d.tool,
    "お名前": d.name,
    "施設名": d.facility,
    "ご連絡先（電話番号）": d.phone,
    "ご連絡先（メールアドレス）": d.email,
    "お問い合わせ内容": d.message || "（記載なし）",
    replyto: d.email,
    botcheck: d.botcheck && d.botcheck.length ? true : false,
  };

  try {
    const res = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (json.success) {
      f.reset();
      if (status) { status.style.color = "var(--ok)"; status.textContent = "✓ 送信しました。担当者よりご連絡いたします。ありがとうございました。"; }
      toast("送信しました ✓");
    } else {
      throw new Error(json.message || "送信に失敗しました");
    }
  } catch (err) {
    if (status) { status.style.color = "var(--danger)"; status.innerHTML = "送信できませんでした。お手数ですが「直接メールする」からご連絡ください。"; }
    toast("送信に失敗しました");
  } finally {
    btn.disabled = false; btn.textContent = orig;
  }
}

/** 指定要素にお問い合わせフォームを差し込む（id="contact-mount"） */
function mountContact(currentTool) {
  const el = document.getElementById("contact-mount");
  if (el) el.innerHTML = contactSectionHTML(currentTool || "");
}

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

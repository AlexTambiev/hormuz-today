const elements = {
  answer: document.querySelector("#answer"),
  summary: document.querySelector("#summary"),
  verdict: document.querySelector("#verdict"),
  headline: document.querySelector("#headline"),
  method: document.querySelector("#method"),
  generatedAt: document.querySelector("#generated-at"),
  lookback: document.querySelector("#lookback"),
  relevantCount: document.querySelector("#relevant-count"),
  evidenceList: document.querySelector("#evidence-list"),
  sourceList: document.querySelector("#source-list"),
  refreshButton: document.querySelector("#refresh-button"),
};

function formatDate(value) {
  if (!value) return "--";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function safeLink(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? url.href : "";
  } catch {
    return "";
  }
}

function renderEvidence(evidence = []) {
  if (!evidence.length) {
    elements.evidenceList.innerHTML = `
      <div class="empty-state">
        No high-signal headlines were found. This is either calming or merely the internet saving its drama for later.
      </div>
    `;
    return;
  }

  elements.evidenceList.innerHTML = evidence
    .map((item, index) => {
      const link = safeLink(item.link);
      const titleText = escapeHtml(item.title);
      const title = link
        ? `<a href="${escapeHtml(link)}" target="_blank" rel="noreferrer">${titleText}</a>`
        : titleText;
      const source = escapeHtml(item.source || item.feed || "Unknown source");
      const date = item.publishedAt ? formatDate(item.publishedAt) : "No date";
      const signal = ["closed", "open", "risk", "threat"].includes(item.signal)
        ? item.signal
        : "background";

      return `
        <article class="evidence evidence--${signal}" style="animation-delay: ${index * 70}ms">
          <h3>${title}</h3>
          <div class="evidence__meta">
            <strong>${source}</strong><br />
            <span>${escapeHtml(date)}</span>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderSources(sources = []) {
  elements.sourceList.innerHTML = sources
    .map(
      (source) => `
        <li>
          <strong>${escapeHtml(source.source)}</strong>
          <span>${source.ok ? `${source.count} items` : "failed"}</span>
        </li>
      `,
    )
    .join("");
}

function renderStatus(data) {
  elements.verdict.dataset.status = data.status || "unknown";
  elements.answer.textContent = data.answer || "Unknown";
  elements.summary.textContent = data.summary || "No summary available.";
  elements.headline.textContent = data.headline || "No verdict headline available.";
  elements.method.textContent = data.method || "";
  elements.generatedAt.textContent = formatDate(data.generatedAt);
  elements.lookback.textContent = data.lookbackDays ? `${data.lookbackDays} days` : "--";
  elements.relevantCount.textContent = String(data.totalRelevantItems ?? "--");
  renderEvidence(data.evidence);
  renderSources(data.sourceHealth);
}

async function loadStatus({ force = false } = {}) {
  elements.refreshButton.disabled = true;
  elements.refreshButton.setAttribute("aria-label", "Refreshing");

  try {
    const response = await fetch(`/api/status${force ? "?force=1" : ""}`, {
      cache: "no-store",
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.errors?.[0] || "Status request failed");
    }

    renderStatus(data);
  } catch (error) {
    renderStatus({
      status: "unknown",
      answer: "Unknown",
      headline: "The tracker tripped over its own clipboard.",
      summary: error.message,
      generatedAt: new Date().toISOString(),
      lookbackDays: 7,
      totalRelevantItems: 0,
      evidence: [],
      sourceHealth: [],
      method: "Try refreshing once network access is available.",
    });
  } finally {
    elements.refreshButton.disabled = false;
    elements.refreshButton.setAttribute("aria-label", "Refresh now");
  }
}

elements.refreshButton.addEventListener("click", () => {
  loadStatus({ force: true });
});

loadStatus();

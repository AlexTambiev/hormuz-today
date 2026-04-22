const test = require("node:test");
const assert = require("node:assert/strict");
const { classifyItem, verdictFromEvidence } = require("../src/newsStatus");

function item(title, summary = "", source = "Reuters") {
  return {
    title,
    summary,
    source,
    feed: "Test feed",
    link: "https://example.com",
    publishedAt: new Date().toISOString(),
  };
}

function itemAt(title, publishedAt, summary = "", source = "Reuters") {
  return {
    ...item(title, summary, source),
    publishedAt,
  };
}

test("direct closure language is classified as closed", () => {
  const result = classifyItem(item("Iran closes Strait of Hormuz to shipping"));
  assert.equal(result.signal, "closed");
  assert.ok(result.weight >= 4);
});

test("hypothetical closure language is treated as a threat", () => {
  const result = classifyItem(item("Iran warns it could close the Strait of Hormuz"));
  assert.equal(result.signal, "threat");
});

test("blockade headlines that exclude the Strait are not classified as closed", () => {
  const result = classifyItem(
    item("US general clarifies Iranian ports under blockade, not Strait of Hormuz"),
  );
  assert.notEqual(result.signal, "closed");
});

test("reopened language is classified as open", () => {
  const result = classifyItem(item("Shipping resumes as Strait of Hormuz reopens"));
  assert.equal(result.signal, "open");
});

test("credible closure evidence produces a closed verdict", () => {
  const evidence = [
    classifyItem(item("Iran closes Strait of Hormuz to shipping", "", "Reuters")),
  ];
  const verdict = verdictFromEvidence(evidence, [], []);
  assert.equal(verdict.status, "closed");
});

test("newer open evidence overrides older closure evidence", () => {
  const evidence = [
    classifyItem(
      itemAt("Iran closes Strait of Hormuz to shipping", "2026-04-18T12:00:00.000Z"),
    ),
    classifyItem(
      itemAt("Iran reopens Strait of Hormuz to shipping", "2026-04-21T12:00:00.000Z"),
    ),
  ];
  const verdict = verdictFromEvidence(evidence, [], []);
  assert.equal(verdict.status, "open");
});

test("newer closure evidence overrides older open evidence", () => {
  const evidence = [
    classifyItem(
      itemAt("Iran reopens Strait of Hormuz to shipping", "2026-04-18T12:00:00.000Z"),
    ),
    classifyItem(
      itemAt("Shipping traffic through Hormuz still largely halted", "2026-04-21T12:00:00.000Z"),
    ),
  ];
  const verdict = verdictFromEvidence(evidence, [], []);
  assert.equal(verdict.status, "closed");
});

test("evidence is returned newest first", () => {
  const evidence = [
    classifyItem(
      itemAt("Iran closes Strait of Hormuz to shipping", "2026-04-18T12:00:00.000Z"),
    ),
    classifyItem(
      itemAt("Iran reopens Strait of Hormuz to shipping", "2026-04-21T12:00:00.000Z"),
    ),
  ];
  const verdict = verdictFromEvidence(evidence, [], []);
  assert.match(verdict.evidence[0].title, /reopens/);
});

test("threat evidence does not become a closed verdict", () => {
  const evidence = [
    classifyItem(item("Iran warns it could close the Strait of Hormuz", "", "Reuters")),
  ];
  const verdict = verdictFromEvidence(evidence, [], []);
  assert.equal(verdict.status, "disrupted");
});

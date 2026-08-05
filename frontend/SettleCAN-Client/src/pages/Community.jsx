import { useState, useEffect, useContext } from "react";
import { Container, Row, Col, Button, Form } from "react-bootstrap";
import { AuthContext } from "../state/AuthContext";
import {
  fetchCommunityPosts,
  createCommunityPost,
  deleteCommunityPost,
  createCommunityReply,
  deleteCommunityReply,
  fetchFAQ,
} from "../service/taskService";
import "../scss/Community.scss";

const TAG_COLORS = {
  Legal: "tag-legal",
  Financial: "tag-financial",
  Academic: "tag-academic",
  Housing: "tag-housing",
  Healthcare: "tag-healthcare",
  Jobs: "tag-jobs",
  Question: "tag-question",
  Tip: "tag-tip",
  Update: "tag-general",
  Discussion: "tag-general",
};

const COMPOSE_TAGS = ["Legal", "Financial", "Academic", "Housing", "Healthcare", "Jobs"];
const FILTER_TAGS = [...COMPOSE_TAGS, "Question", "Tip"];

// Shown only while the real fetch is in flight or if the backend is
// unreachable — never as a silent permanent stand-in for real data (that
// masked whether posts were actually persisting).
const OFFLINE_POSTS = [
  {
    id: "offline-1",
    title: "How long does it take to receive my study permit extension?",
    author: "Rasa",
    time: "2 hours ago",
    tags: ["Legal", "Question"],
    body: "I applied online three weeks ago and haven't received any update yet. Has anyone recently gone through this process?",
    replies: [],
    replyCount: 12,
    views: 34,
  },
  {
    id: "offline-2",
    title: "Tip for opening a Canadian bank account as a newcomer",
    author: "Joon K.",
    time: "5 hours ago",
    tags: ["Financial", "Tip"],
    body: "RBC and TD both have newcomer banking packages with no monthly fees for the first year. Bring your passport, study permit, and proof of address.",
    replies: [],
    replyCount: 8,
    views: 61,
  },
];

const TRENDING = [
  "Study permit extension",
  "SIN application",
  "OHIP",
  "Finding housing",
  "Part-time jobs",
];

const TAG_FILTER_KEY = "settlecan_community_tag_filters";
function loadFilterTags() {
  try {
    const saved = JSON.parse(localStorage.getItem(TAG_FILTER_KEY));
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function initialsOf(name) {
  return (name || "?").trim().slice(0, 2).toUpperCase();
}

// Normalise a DB row (community_qa, with nested community_replies) -> the UI post shape
function normalisePost(row, currentUserId) {
  const isMine = !!currentUserId && row.user_id === currentUserId;
  const replies = Array.isArray(row.community_replies)
    ? [...row.community_replies]
        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
        .map((r) => normaliseReply(r, currentUserId))
    : [];
  return {
    id: row.qa_id ?? row.id,
    title: row.question ?? row.title ?? "",
    author: isMine ? "You" : "Member",
    isMine,
    time: row.created_at
      ? new Date(row.created_at).toLocaleDateString("en-CA", { month: "short", day: "numeric" })
      : "Recently",
    tags: row.tags ?? [],
    body: row.question ?? row.body ?? "",
    replies,
    replyCount: replies.length,
    views: 1,
  };
}

function normaliseReply(row, currentUserId) {
  const isMine = !!currentUserId && row.user_id === currentUserId;
  const author = isMine ? "You" : "Member";
  return {
    id: row.reply_id,
    author,
    initials: initialsOf(author),
    isMine,
    time: row.created_at
      ? new Date(row.created_at).toLocaleDateString("en-CA", { month: "short", day: "numeric" })
      : "Recently",
    text: row.reply_text,
  };
}

export default function Community() {
  const { user } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [postsLoaded, setPostsLoaded] = useState(false);
  const [postText, setPostText] = useState("");
  const [postType, setPostType] = useState("Question");
  const [selectedTags, setSelectedTags] = useState([]);
  const [postError, setPostError] = useState("");
  const [expandedPosts, setExpandedPosts] = useState({});
  const [savedPosts, setSavedPosts] = useState({});
  const [replyInputs, setReplyInputs] = useState({});
  const [search, setSearch] = useState("");
  const [filterTags, setFilterTags] = useState(loadFilterTags);
  const [toast, setToast] = useState("");
  const [faqs, setFaqs] = useState([]);
  const [openFaqId, setOpenFaqId] = useState(null);

  // Load posts from the API on mount; only fall back to OFFLINE_POSTS if the
  // backend is genuinely unreachable — a real empty result stays empty, so
  // "did my post actually save?" is never masked by a hardcoded stand-in.
  useEffect(() => {
    fetchCommunityPosts()
      .then((data) => {
        setPosts(Array.isArray(data) ? data.map((row) => normalisePost(row, user?.id)) : []);
      })
      .catch(() => setPosts(OFFLINE_POSTS))
      .finally(() => setPostsLoaded(true));
  }, [user?.id]);

  // Load FAQ entries for the sidebar
  useEffect(() => {
    fetchFAQ()
      .then((data) => {
        if (Array.isArray(data)) setFaqs(data);
      })
      .catch(() => {
        /* sidebar just won't show FAQ if offline */
      });
  }, []);

  // Tag filters persist across visits/reloads, same as any other saved
  // browsing preference.
  useEffect(() => {
    localStorage.setItem(TAG_FILTER_KEY, JSON.stringify(filterTags));
  }, [filterTags]);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  }

  function toggleTag(tag) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  }

  function toggleFilterTag(tag) {
    setFilterTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  }

  async function handlePost() {
    if (!postText.trim()) {
      setPostError("Please write something before posting.");
      return;
    }
    setPostError("");

    const tempId = `temp-${Date.now()}`;
    const optimistic = {
      id: tempId,
      title: postText.length > 80 ? postText.slice(0, 80) + "…" : postText,
      author: "You",
      isMine: true,
      time: "Just now",
      tags: [postType, ...selectedTags],
      body: postText,
      replies: [],
      replyCount: 0,
      views: 1,
    };

    setPosts((prev) => [optimistic, ...prev]);
    setPostText("");
    setSelectedTags([]);

    try {
      const saved = await createCommunityPost({ question: optimistic.body, tags: optimistic.tags });
      setPosts((prev) => prev.map((p) => (p.id === tempId ? normalisePost(saved, user?.id) : p)));
      showToast("Post published!");
    } catch {
      setPosts((prev) => prev.filter((p) => p.id !== tempId));
      showToast("Couldn't publish — check your connection.");
    }
  }

  async function handleDeletePost(post) {
    setPosts((prev) => prev.filter((p) => p.id !== post.id));
    showToast("Post deleted.");
    try {
      await deleteCommunityPost(post.id);
    } catch {
      showToast("Couldn't delete on the server — it may reappear on refresh.");
    }
  }

  function toggleExpand(id) {
    setExpandedPosts((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function toggleSave(id) {
    setSavedPosts((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      showToast(next[id] ? "Post saved!" : "Post unsaved.");
      return next;
    });
  }

  function handleReplyChange(postId, val) {
    setReplyInputs((prev) => ({ ...prev, [postId]: val }));
  }

  async function submitReply(postId) {
    const text = (replyInputs[postId] || "").trim();
    if (!text) return;

    const tempId = `temp-${Date.now()}`;
    const optimisticReply = { id: tempId, author: "You", initials: initialsOf("You"), isMine: true, time: "Just now", text };

    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, replies: [...p.replies, optimisticReply], replyCount: p.replyCount + 1 } : p,
      ),
    );
    setReplyInputs((prev) => ({ ...prev, [postId]: "" }));

    try {
      const saved = await createCommunityReply(postId, { text });
      const real = normaliseReply(saved, user?.id);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, replies: p.replies.map((r) => (r.id === tempId ? real : r)) } : p,
        ),
      );
      showToast("Reply posted!");
    } catch {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, replies: p.replies.filter((r) => r.id !== tempId), replyCount: p.replyCount - 1 }
            : p,
        ),
      );
      showToast("Couldn't post reply — check your connection.");
    }
  }

  async function handleDeleteReply(postId, reply) {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, replies: p.replies.filter((r) => r.id !== reply.id), replyCount: p.replyCount - 1 }
          : p,
      ),
    );
    try {
      await deleteCommunityReply(reply.id);
    } catch {
      showToast("Couldn't delete on the server — it may reappear on refresh.");
    }
  }

  const filteredPosts = posts.filter((p) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      p.title.toLowerCase().includes(q) ||
      p.tags.join(" ").toLowerCase().includes(q) ||
      p.body.toLowerCase().includes(q);
    const matchesTags = filterTags.length === 0 || filterTags.some((t) => p.tags.includes(t));
    return matchesSearch && matchesTags;
  });

  return (
    <div className="community-page">
      <Container fluid className="community-container">
        <h1 className="community-title">Community</h1>
        <p className="community-subtitle">
          Ask questions, share tips, and find support from newcomers
        </p>

        <Row className="g-4">
          {/* Left column */}
          <Col md={8}>
            {/* Create Post */}
            <div className="create-post-card mb-3">
              <h3 className="create-title">Create Post</h3>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Ask a question or share an update…"
                value={postText}
                onChange={(e) => {
                  setPostText(e.target.value);
                  if (postError) setPostError("");
                }}
                className="post-textarea"
              />
              <div className="post-controls mt-2">
                <Form.Select
                  value={postType}
                  onChange={(e) => setPostType(e.target.value)}
                  className="post-type-select"
                >
                  <option>Question</option>
                  <option>Tip</option>
                  <option>Update</option>
                  <option>Discussion</option>
                </Form.Select>
              </div>
              <div className="tag-pills mt-2">
                {COMPOSE_TAGS.map((tag) => (
                  <button
                    key={tag}
                    className={`tag-pill ${selectedTags.includes(tag) ? "selected" : ""}`}
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
              <div className="post-bottom mt-3">
                {postError && <span className="post-error">{postError}</span>}
                <Button className="btn-post ms-auto" onClick={handlePost}>
                  Post
                </Button>
              </div>
            </div>

            {/* Tag filter bar */}
            <div className="create-post-card mb-3">
              <div className="d-flex align-items-center justify-content-between" style={{ marginBottom: "10px" }}>
                <h3 className="create-title" style={{ marginBottom: 0 }}>Filter by tag</h3>
                {filterTags.length > 0 && (
                  <button className="action-btn" onClick={() => setFilterTags([])}>Clear filters</button>
                )}
              </div>
              <div className="tag-pills">
                {FILTER_TAGS.map((tag) => (
                  <button
                    key={tag}
                    className={`tag-pill ${filterTags.includes(tag) ? "selected" : ""}`}
                    onClick={() => toggleFilterTag(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Posts */}
            {!postsLoaded ? (
              <div className="text-center text-muted py-5">Loading posts…</div>
            ) : filteredPosts.length === 0 ? (
              <div className="text-center text-muted py-5">
                {posts.length === 0 ? "No posts yet — be the first to ask or share something!" : "No posts match your search/filters."}
              </div>
            ) : (
              filteredPosts.map((post) => (
                <div key={post.id} className="post-card mb-3">
                  <div
                    className="post-title"
                    onClick={() => toggleExpand(post.id)}
                  >
                    {post.title}
                  </div>
                  <div className="post-meta">
                    <strong>{post.author}</strong> · {post.time}
                  </div>
                  <div className="post-tags">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className={`post-tag ${TAG_COLORS[tag] || "tag-general"}`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="post-body">{post.body}</div>
                  <div className="post-footer">
                    <span className="post-stats">
                      {post.replyCount} replies · {post.views} views
                    </span>
                    <div className="post-actions">
                      <button
                        className="action-btn"
                        onClick={() => toggleExpand(post.id)}
                      >
                        {expandedPosts[post.id] ? "Hide" : "View"}
                      </button>
                      <button
                        className={`action-btn ${savedPosts[post.id] ? "saved" : ""}`}
                        onClick={() => toggleSave(post.id)}
                      >
                        {savedPosts[post.id] ? "Saved ✓" : "Save"}
                      </button>
                      {post.isMine && (
                        <button className="action-btn action-btn--danger" onClick={() => handleDeletePost(post)}>
                          Delete
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Replies */}
                  {expandedPosts[post.id] && (
                    <div className="replies-section">
                      {post.replies.map((r) => (
                        <div key={r.id} className="reply-item">
                          <div className="reply-avatar">{r.initials}</div>
                          <div className="reply-bubble">
                            <div className="reply-author">
                              {r.author} · {r.time}
                            </div>
                            <div className="reply-text">{r.text}</div>
                          </div>
                          {r.isMine && (
                            <button
                              className="reply-delete"
                              onClick={() => handleDeleteReply(post.id, r)}
                              aria-label="Delete reply"
                              title="Delete reply"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      ))}
                      <div className="reply-input-row">
                        <Form.Control
                          type="text"
                          placeholder="Write a reply…"
                          className="reply-input"
                          value={replyInputs[post.id] || ""}
                          onChange={(e) =>
                            handleReplyChange(post.id, e.target.value)
                          }
                          onKeyDown={(e) =>
                            e.key === "Enter" && submitReply(post.id)
                          }
                        />
                        <Button
                          className="btn-reply"
                          onClick={() => submitReply(post.id)}
                        >
                          Reply
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </Col>

          {/* Right column */}
          <Col md={4}>
            <div className="side-card mb-3">
              <h3 className="side-title">Search Community</h3>
              <Form.Control
                type="text"
                placeholder="Search topics…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="side-search"
              />
            </div>

            <div className="side-card mb-3">
              <h3 className="side-title">Trending Topics</h3>
              <ul className="trending-list">
                {TRENDING.map((topic) => (
                  <li key={topic}>
                    <button
                      className="trending-link"
                      onClick={() => setSearch(topic.toLowerCase())}
                    >
                      {topic}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {faqs.length > 0 && (
              <div className="side-card mb-3">
                <h3 className="side-title">Frequently Asked Questions</h3>
                <ul className="trending-list">
                  {faqs.slice(0, 6).map((f) => (
                    <li key={f.faq_id}>
                      <button
                        className="trending-link"
                        style={{ textAlign: "left", display: "block" }}
                        onClick={() =>
                          setOpenFaqId((prev) =>
                            prev === f.faq_id ? null : f.faq_id,
                          )
                        }
                      >
                        {f.question}
                      </button>
                      {openFaqId === f.faq_id && (
                        <p
                          style={{
                            fontSize: "0.82rem",
                            color: "#7a6a70",
                            marginTop: "0.3rem",
                            paddingLeft: "0.2rem",
                          }}
                        >
                          {f.answer}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="side-card">
              <h3 className="side-title">Community Guidelines</h3>
              <ul className="guideline-list">
                <li>Be respectful</li>
                <li>No legal impersonation</li>
                <li>Share verified sources when possible</li>
              </ul>
            </div>
          </Col>
        </Row>
      </Container>

      {toast && <div className="community-toast">{toast}</div>}
    </div>
  );
}

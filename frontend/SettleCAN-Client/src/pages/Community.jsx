import { useState, useEffect, useContext } from "react";
import { Container, Row, Col, Button, Form } from "react-bootstrap";
import { AuthContext } from "../state/AuthContext";
import {
  fetchCommunityPosts,
  createCommunityPost,
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

const INITIAL_POSTS = [
  {
    id: 1,
    title: "How long does it take to receive my study permit extension?",
    author: "Rasa",
    time: "2 hours ago",
    tags: ["Legal", "Question"],
    body: "I applied online three weeks ago and haven't received any update yet. Has anyone recently gone through this process?",
    replies: [
      {
        id: 1,
        author: "Ahmed M.",
        initials: "AM",
        time: "1 hour ago",
        text: "Mine took about 6 weeks. Make sure you check your IRCC account for any missing document requests.",
      },
      {
        id: 2,
        author: "Sofia L.",
        initials: "SL",
        time: "45 min ago",
        text: "Processing times vary a lot right now. I'd recommend calling the IRCC call centre if it's been more than 8 weeks.",
      },
    ],
    replyCount: 12,
    views: 34,
  },
  {
    id: 2,
    title: "Tip for opening a Canadian bank account as a newcomer",
    author: "Joon K.",
    time: "5 hours ago",
    tags: ["Financial", "Tip"],
    body: "RBC and TD both have newcomer banking packages with no monthly fees for the first year. Bring your passport, study permit, and proof of address.",
    replies: [
      {
        id: 1,
        author: "Priya R.",
        initials: "PR",
        time: "3 hours ago",
        text: "Also Scotiabank has a great newcomer package. I opened mine within a week of arriving!",
      },
    ],
    replyCount: 8,
    views: 61,
  },
  {
    id: 3,
    title: "Where to find affordable student housing near York University?",
    author: "Maria T.",
    time: "Yesterday",
    tags: ["Housing", "Question"],
    body: "Looking for recommendations for off-campus housing that's safe and within budget. Any Facebook groups or websites you'd suggest?",
    replies: [],
    replyCount: 5,
    views: 22,
  },
];

const TRENDING = [
  "Study permit extension",
  "SIN application",
  "OHIP",
  "Finding housing",
  "Part-time jobs",
];

// Normalise a DB row (community_qa) → the UI post shape
function normalisePost(row) {
  return {
    id: row.qa_id ?? row.id ?? Date.now(),
    title: row.question ?? row.title ?? "",
    author: row.author ?? "Member",
    time: row.created_at
      ? new Date(row.created_at).toLocaleDateString("en-CA", {
          month: "short",
          day: "numeric",
        })
      : "Recently",
    tags: row.tags ?? [],
    body: row.question ?? row.body ?? "",
    replies: [],
    replyCount: 0,
    views: 1,
  };
}

export default function Community() {
  const { user } = useContext(AuthContext);
  const [posts, setPosts] = useState(INITIAL_POSTS);
  const [postText, setPostText] = useState("");
  const [postType, setPostType] = useState("Question");
  const [selectedTags, setSelectedTags] = useState([]);
  const [postError, setPostError] = useState("");
  const [expandedPosts, setExpandedPosts] = useState({});
  const [savedPosts, setSavedPosts] = useState({});
  const [replyInputs, setReplyInputs] = useState({});
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState("");
  const [faqs, setFaqs] = useState([]);
  const [openFaqId, setOpenFaqId] = useState(null);

  // Load posts from API on mount; fall back to INITIAL_POSTS if unavailable
  useEffect(() => {
    fetchCommunityPosts()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setPosts(data.map(normalisePost));
        }
      })
      .catch(() => {
        /* keep mock posts */
      });
  }, []);

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

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  }

  function toggleTag(tag) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  }

  async function handlePost() {
    if (!postText.trim()) {
      setPostError("Please write something before posting.");
      return;
    }
    setPostError("");

    const optimistic = {
      id: Date.now(),
      title: postText.length > 80 ? postText.slice(0, 80) + "…" : postText,
      author: user?.name ?? "You",
      time: "Just now",
      tags: [postType, ...selectedTags],
      body: postText,
      replies: [],
      replyCount: 0,
      views: 1,
    };

    // Optimistic: show immediately
    setPosts((prev) => [optimistic, ...prev]);
    setPostText("");
    setSelectedTags([]);
    showToast("Post published!");

    // Persist to backend in the background
    try {
      await createCommunityPost({
        question: optimistic.body,
        tags: optimistic.tags,
      });
    } catch {
      // Non-fatal — post stays visible locally
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

  function submitReply(postId) {
    const text = (replyInputs[postId] || "").trim();
    if (!text) return;
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        return {
          ...p,
          replies: [
            ...p.replies,
            {
              id: Date.now(),
              author: "Rasa",
              initials: "R",
              time: "Just now",
              text,
            },
          ],
          replyCount: p.replyCount + 1,
        };
      }),
    );
    setReplyInputs((prev) => ({ ...prev, [postId]: "" }));
    showToast("Reply posted!");
  }

  const filteredPosts = posts.filter((p) => {
    const q = search.toLowerCase();
    return (
      !q ||
      p.title.toLowerCase().includes(q) ||
      p.tags.join(" ").toLowerCase().includes(q) ||
      p.body.toLowerCase().includes(q)
    );
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
                {[
                  "Legal",
                  "Financial",
                  "Academic",
                  "Housing",
                  "Healthcare",
                  "Jobs",
                ].map((tag) => (
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

            {/* Posts */}
            {filteredPosts.length === 0 && (
              <div className="text-center text-muted py-5">
                No posts match your search.
              </div>
            )}
            {filteredPosts.map((post) => (
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
            ))}
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

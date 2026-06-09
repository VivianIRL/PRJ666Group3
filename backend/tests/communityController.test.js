const {
  getAllPosts,
  createPost,
  replyToPost,
  deletePost,
} = require("../../backend/src/controllers/communityController");

jest.mock("../../backend/db/supabase", () => ({ from: jest.fn() }));
const supabase = require("../../backend/db/supabase");

function mockRes() {
  const res = {};
  res.json = jest.fn().mockReturnValue(res);
  res.status = jest.fn().mockReturnValue(res);
  return res;
}

describe("getAllPosts", () => {
  beforeEach(() => jest.clearAllMocks());

  test("returns posts on success", async () => {
    const posts = [{ qa_id: 1, question: "What is OHIP?" }];
    supabase.from.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({ data: posts, error: null }),
    });
    const res = mockRes();
    await getAllPosts({}, res);
    expect(res.json).toHaveBeenCalledWith({ success: true, posts });
  });

  test("returns 500 on DB error", async () => {
    supabase.from.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      order: jest
        .fn()
        .mockResolvedValue({ data: null, error: { message: "fail" } }),
    });
    const res = mockRes();
    await getAllPosts({}, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("createPost", () => {
  beforeEach(() => jest.clearAllMocks());

  test("creates post and returns 201", async () => {
    const post = { qa_id: 2, question: "Test?" };
    supabase.from.mockReturnValue({
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: post, error: null }),
    });
    const res = mockRes();
    await createPost({ body: { user_id: 1, question: "Test?" } }, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ success: true, post });
  });

  test("returns 400 when question missing", async () => {
    const res = mockRes();
    await createPost({ body: {} }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("returns 500 on DB error", async () => {
    supabase.from.mockReturnValue({
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest
        .fn()
        .mockResolvedValue({ data: null, error: { message: "fail" } }),
    });
    const res = mockRes();
    await createPost({ body: { question: "Q?" } }, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("replyToPost", () => {
  beforeEach(() => jest.clearAllMocks());

  test("updates post with answer", async () => {
    const updated = { qa_id: 1, answer: "Yes!" };
    supabase.from.mockReturnValue({
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: updated, error: null }),
    });
    const res = mockRes();
    await replyToPost({ params: { id: "1" }, body: { answer: "Yes!" } }, res);
    expect(res.json).toHaveBeenCalledWith({ success: true, post: updated });
  });

  test("returns 400 when answer missing", async () => {
    const res = mockRes();
    await replyToPost({ params: { id: "1" }, body: {} }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });
});

describe("deletePost", () => {
  beforeEach(() => jest.clearAllMocks());

  test("deletes post and returns success", async () => {
    supabase.from.mockReturnValue({
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({ error: null }),
    });
    const res = mockRes();
    await deletePost({ params: { id: "1" } }, res);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Post deleted.",
    });
  });

  test("returns 500 on DB error", async () => {
    supabase.from.mockReturnValue({
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({ error: { message: "fail" } }),
    });
    const res = mockRes();
    await deletePost({ params: { id: "1" } }, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

const {
  getAllContent,
  createContent,
  updateContent,
  deleteContent,
} = require("../../backend/src/controllers/contentController");

jest.mock("../../backend/db/supabase", () => ({ from: jest.fn() }));
const supabase = require("../../backend/db/supabase");

function mockRes() {
  const res = {};
  res.json = jest.fn().mockReturnValue(res);
  res.status = jest.fn().mockReturnValue(res);
  return res;
}

describe("getAllContent", () => {
  beforeEach(() => jest.clearAllMocks());

  test("returns articles on success", async () => {
    const articles = [{ content_id: 1, page_name: "health" }];
    supabase.from.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({ data: articles, error: null }),
    });
    const res = mockRes();
    await getAllContent({}, res);
    expect(res.json).toHaveBeenCalledWith({ success: true, articles });
  });

  test("returns 500 on DB error", async () => {
    supabase.from.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      order: jest
        .fn()
        .mockResolvedValue({ data: null, error: { message: "fail" } }),
    });
    const res = mockRes();
    await getAllContent({}, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("createContent", () => {
  beforeEach(() => jest.clearAllMocks());

  test("creates article and returns 201", async () => {
    const article = { content_id: 1, page_name: "work-permit" };
    supabase.from.mockReturnValue({
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: article, error: null }),
    });
    const res = mockRes();
    await createContent(
      { body: { page_name: "work-permit", body_content: "Info" } },
      res,
    );
    expect(res.status).toHaveBeenCalledWith(201);
  });

  test("returns 400 when page_name missing", async () => {
    const res = mockRes();
    await createContent({ body: { body_content: "Info" } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("returns 400 when body_content missing", async () => {
    const res = mockRes();
    await createContent({ body: { page_name: "health" } }, res);
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
    await createContent(
      { body: { page_name: "health", body_content: "X" } },
      res,
    );
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("updateContent", () => {
  beforeEach(() => jest.clearAllMocks());

  test("updates and returns article", async () => {
    const article = { content_id: 1, page_name: "health" };
    supabase.from.mockReturnValue({
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: article, error: null }),
    });
    const res = mockRes();
    await updateContent(
      {
        params: { id: "1" },
        body: { page_name: "health", body_content: "Updated" },
      },
      res,
    );
    expect(res.json).toHaveBeenCalledWith({ success: true, article });
  });

  test("returns 500 on DB error", async () => {
    supabase.from.mockReturnValue({
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest
        .fn()
        .mockResolvedValue({ data: null, error: { message: "fail" } }),
    });
    const res = mockRes();
    await updateContent({ params: { id: "1" }, body: {} }, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("deleteContent", () => {
  beforeEach(() => jest.clearAllMocks());

  test("deletes and returns success", async () => {
    supabase.from.mockReturnValue({
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({ error: null }),
    });
    const res = mockRes();
    await deleteContent({ params: { id: "1" } }, res);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Article deleted.",
    });
  });

  test("returns 500 on DB error", async () => {
    supabase.from.mockReturnValue({
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({ error: { message: "fail" } }),
    });
    const res = mockRes();
    await deleteContent({ params: { id: "1" } }, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

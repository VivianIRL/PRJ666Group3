const {
  getWorkPermitInfo,
  getHealthInfo,
} = require("../../backend/src/controllers/infoController");

jest.mock("../../backend/db/supabase", () => ({ from: jest.fn() }));
const supabase = require("../../backend/db/supabase");

function mockRes() {
  const res = {};
  res.json = jest.fn().mockReturnValue(res);
  res.status = jest.fn().mockReturnValue(res);
  return res;
}

describe("getWorkPermitInfo", () => {
  beforeEach(() => jest.clearAllMocks());

  test("returns content and resources on success", async () => {
    const content = [{ content_id: 1, page_name: "work-permit" }];
    const resources = [{ resource_id: 1, title: "IRCC" }];
    supabase.from
      .mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({ data: content, error: null }),
      })
      .mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: resources, error: null }),
      });
    const res = mockRes();
    await getWorkPermitInfo({}, res);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      content: content[0],
      resources,
    });
  });

  test("returns null content when no row found", async () => {
    supabase.from
      .mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({ data: [], error: null }),
      })
      .mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: [], error: null }),
      });
    const res = mockRes();
    await getWorkPermitInfo({}, res);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, content: null }),
    );
  });

  test("returns 500 on DB error", async () => {
    supabase.from.mockReturnValueOnce({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      limit: jest
        .fn()
        .mockResolvedValue({ data: null, error: { message: "DB error" } }),
    });
    const res = mockRes();
    await getWorkPermitInfo({}, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("getHealthInfo", () => {
  beforeEach(() => jest.clearAllMocks());

  test("returns content and resources on success", async () => {
    const content = [{ content_id: 2, page_name: "health" }];
    const resources = [{ resource_id: 2, title: "OHIP" }];
    supabase.from
      .mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({ data: content, error: null }),
      })
      .mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: resources, error: null }),
      });
    const res = mockRes();
    await getHealthInfo({}, res);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      content: content[0],
      resources,
    });
  });

  test("returns 500 on resource fetch error", async () => {
    supabase.from
      .mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        limit: jest
          .fn()
          .mockResolvedValue({ data: [{ content_id: 2 }], error: null }),
      })
      .mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: null,
          error: { message: "resource error" },
        }),
      });
    const res = mockRes();
    await getHealthInfo({}, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

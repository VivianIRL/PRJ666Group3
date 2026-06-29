const request = require("supertest");
const app = require("../app");
const logger = require("../logger");

// Mock the logger so test outputs remain clean in the terminal

// Mock the logger cleanly without stripping away Pino's internal structural properties
jest.mock("../logger", () => {
  const actualPino = jest.requireActual("pino");
  
  // Create a real pino instance but route its outputs into an empty destination stream
  const silentLogger = actualPino({ level: "silent" });

  // Attach Jest spies to the logging levels so your tests can track them
  silentLogger.info = jest.fn();
  silentLogger.debug = jest.fn();
  silentLogger.warn = jest.fn();

  return silentLogger;
});


describe("Express App Configuration (app.js)", ()=>{
    beforeEach(()=>{
        jest.clearAllMocks();
    });

    // Test Health Check 
    describe("GET / (Health Check)", ()=>{
        it("should return status 200 and the correct API metadata", async ()=>{
            const response = await request(app).get("/");
            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                status: "SettleCAN API running",
                version: "1.0.0",
            });
        });
    });
    // Test CORS Configuration
    describe("CORS Middleware", ()=>{
        it("Should allow requests comming from an allowed origin", async()=>{
            const response = await request(app)
            .get("/")
            .set("Origin", "http://localhost:5173");

            expect(response.headers["access-control-allow-origin"]).toBe("http://localhost:5173");
            expect(response.headers["access-control-allow-credentials"]).toBe("true");
        });
        it("should NOT allow requests coming from an unauthorized origin", async ()=>{
            const response = await request(app)
            .get("/")
            .set("Origin", "http://malicous-site.com");

            // CORS will refuse to echo back unauthroized origins in the header
            expect(response.headers["access-control-allow-origin"]).toBeUndefined();
        });
    })
    describe("404 Fallback Handler", () => {
    it("should return 404 and log a warning for unregistered endpoints", async () => {
      const response = await request(app).get("/api/completely-broken-route");

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: "Route not found." });
      
      // Verifies that your logger.warn safety catch was triggered
      expect(logger.warn).toHaveBeenCalled();
    });
  });

  // ── Test 4: Route Gateway Mounting ─────────────────────────────────────────
  // ── Test 4: Route Gateway Mounting ─────────────────────────────────────────
 // ── Test 4: Route Gateway Mounting ─────────────────────────────────────────
  describe("Route Gateways", () => {
    const routesToTest = [
      { path: "/api/auth/me", name: "Auth" },
      { path: "/api/profile", name: "Profile" },
      { path: "/api/tasks", name: "Tasks" },
      
      // Fixed: targets an active route path
      { path: "/api/info/health", name: "Info" }, 
      
      { path: "/api/content", name: "Content" },
      
      // Fixed: targets an active, public route path
      { path: "/api/community/faq", name: "Community" }, 
      
      { path: "/api/notifications", name: "Notifications" },
    ];

    routesToTest.forEach(({ path, name }) => {
      it(`should successfully mount and resolve the ${name} router path`, async () => {
        const response = await request(app).get(path);
        
        // Assert that it DID NOT hit the 404 fallback handler.
        expect(response.status).not.toBe(404);
        expect(response.body.message).not.toBe("Route not found.");
      });
    });
  });
})

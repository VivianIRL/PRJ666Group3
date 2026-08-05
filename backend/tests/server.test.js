const app = require("./app");
const logger = require("./logger"); // Import the logger so Jest can track it

// 1. Mock the app module so it doesn't open a real network port
jest.mock("./app", () => ({
    listen: jest.fn((port, callback) => {
        if (callback) callback(); 
    })
}));

// 2. Mock the logger module so it doesn't print messy JSON to your terminal
jest.mock("./logger", () => ({
    info: jest.fn() // Replaces logger.info with a tracking spy
}));

describe("Server.js Entry Point", () => {
    
    beforeEach(() => {
        // Clear mock history and the Node require cache between tests
        jest.clearAllMocks();
        jest.resetModules();
    });

    it("should start the server using the PORT defined in process.env", () => {
        process.env.PORT = "8080";
        
        // Trigger the file execution 
        require("./server");
        
        expect(app.listen).toHaveBeenCalledWith("8080", expect.any(Function));
        // Assert on the logger mock instead of console.log
        expect(logger.info).toHaveBeenCalledWith("SettleCAN API running on http://localhost:8080");
    });

    it("should default to port 5000 if process.env.PORT is missing", () => {
        delete process.env.PORT;
        
        // Trigger the file execution
        require("./server");

        expect(app.listen).toHaveBeenCalledWith(5000, expect.any(Function));
        // Assert on the logger mock instead of console.log
        expect(logger.info).toHaveBeenCalledWith("SettleCAN API running on http://localhost:5000");
    });
});
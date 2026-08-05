require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const supabase = require("./supabase");

async function testConnection() {
  try {
    // TEST 1: profiles table
    const { data, error } = await supabase
      .from("profiles")
      .select("*");

    if (error) {
      throw error;
    }

    console.log("✅ Supabase Connected Successfully!");
    console.log("Profiles data:");
    console.log(data);
  } catch (err) {
    console.error("❌ Connection Error:", err.message);
  }
}

testConnection();
// Simple script to set up .env.local file with Google AI API key
const fs = require("fs");
const path = require("path");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Path to .env.local
const envPath = path.join(process.cwd(), ".env.local");

console.log("Google AI API Key Setup");
console.log("======================");
console.log(
  "This script will help you set up your Google AI API key for the AI Assistant feature.",
);
console.log("You can get a Google AI API key from: https://ai.google.dev/");
console.log();

rl.question("Please enter your Google AI API key: ", apiKey => {
  if (!apiKey || apiKey.trim() === "") {
    console.log("No API key provided. Setup canceled.");
    rl.close();
    return;
  }

  try {
    // Check if .env.local exists
    let envContent = "";
    if (fs.existsSync(envPath)) {
      // Read existing content
      envContent = fs.readFileSync(envPath, "utf8");

      // Check if GOOGLE_AI_API_KEY already exists
      if (envContent.includes("GOOGLE_AI_API_KEY=")) {
        // Replace existing key
        envContent = envContent.replace(
          /GOOGLE_AI_API_KEY=.*/,
          `GOOGLE_AI_API_KEY=${apiKey}`,
        );
      } else {
        // Add key to existing file
        envContent += `\n# Google AI API Key\nGOOGLE_AI_API_KEY=${apiKey}\n`;
      }
    } else {
      // Create new .env.local file
      envContent = `# Environment Variables\n\n# Google AI API Key\nGOOGLE_AI_API_KEY=${apiKey}\n`;
    }

    // Write the updated content
    fs.writeFileSync(envPath, envContent);
    console.log("\nAPI key has been successfully added to .env.local");
    console.log("You can now use the AI Assistant feature!");
  } catch (error) {
    console.error("Error setting up API key:", error.message);
  } finally {
    rl.close();
  }
});

// Add instructions on script exit
rl.on("close", () => {
  console.log("\nTo start your app with the new API key, run:");
  console.log("npm run dev");
  console.log("\nDone!");
  process.exit(0);
});

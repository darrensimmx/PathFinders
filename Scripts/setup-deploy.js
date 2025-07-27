const { execSync } = require("child_process");

function run(cmd) {
  console.log(`\n> ${cmd}`);
  execSync(cmd, { stdio: "inherit", shell: true });
}

try {
  // Clean frontend install
  run("rm -rf client/node_modules client/package-lock.json");
  run("npm install --prefix client");
  run("npm install --prefix client react-icons");

  console.log("\n Deployment setup complete!");
} catch (error) {
  console.error("\n Deployment setup failed:", error.message);
  process.exit(1);
}

const { execSync } = require("child_process");

function run(cmd) {
  console.log(`\n> ${cmd}`);
  execSync(cmd, { stdio: "inherit", shell: true });
}

try {
  // Uninstall global vite
  run("npm uninstall -g vite");

  // Remove node_modules and lockfiles
  run("rm -rf client/node_modules client/package-lock.json");
  run("rm -rf BackEnd/server/node_modules BackEnd/server/package-lock.json");

  // Install client dependencies
  run("npm install --prefix client");
  run("npm install --prefix client react-icons");
  run("npm install --prefix client --save-dev cypress");

  // Install backend dependencies
  run("npm install --prefix BackEnd/server");
  run("npm install --prefix BackEnd/server mongoose bcrypt jsonwebtoken cookie-parser");
  run("npm install --prefix BackEnd/server --save-dev jest supertest mongodb-memory-server");

  // Install route-related packages
  run("npm install --prefix BackEnd/server @mapbox/polyline @turf/turf node-fetch@2 axios");

  console.log("\n✅ Setup complete!");
} catch (error) {
  console.error("\n❌ Setup failed:", error.message);
  process.exit(1);
}

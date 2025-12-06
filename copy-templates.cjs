const fs = require("fs");
const path = require("path");

const src = path.join(__dirname, "src/utils/mail/templates");
const dest = path.join(__dirname, "dist/src/utils/mail/templates");

function copyDir(srcDir, destDir) {
  if (!fs.existsSync(srcDir)) {
    console.error("❌ SOURCE TEMPLATE NOT FOUND:", srcDir);
    process.exit(1);
  }

  fs.mkdirSync(destDir, { recursive: true });

  const files = fs.readdirSync(srcDir);
  for (const file of files) {
    const srcFile = path.join(srcDir, file);
    const destFile = path.join(destDir, file);

    const stat = fs.statSync(srcFile);
    if (stat.isDirectory()) {
      copyDir(srcFile, destFile);
    } else {
      fs.copyFileSync(srcFile, destFile);
    }
  }
}

copyDir(src, dest);

console.log("✅ Email templates copied to:", dest);

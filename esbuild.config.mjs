import "dotenv/config";
import esbuild from "esbuild";
import process from "process";

const prod = process.argv[2] === "production";

const DEFAULT_DROPBOX_APP_KEY = process.env.DROPBOX_APP_KEY || "";
const DEFAULT_ONEDRIVE_CLIENT_ID = process.env.ONEDRIVE_CLIENT_ID || "";
const DEFAULT_ONEDRIVE_AUTHORITY = process.env.ONEDRIVE_AUTHORITY || "";

const context = await esbuild
  .context({
    loader: {
      ".svg": "text",
    },
    entryPoints: ["./src/main.ts"],
    bundle: true,
    external: ["obsidian", "electron", "fs", "tls", "net", "http", "https"],
    inject: ["./esbuild.injecthelper.mjs"],
    format: "cjs",
    target: "esnext",
    logLevel: "info",
    sourcemap: prod ? false : "inline",
    treeShaking: prod,
    minify: prod,
    outfile: "main.js",
    define: {
      "process.env.DEFAULT_DROPBOX_APP_KEY": `"${DEFAULT_DROPBOX_APP_KEY}"`,
      "process.env.DEFAULT_ONEDRIVE_CLIENT_ID": `"${DEFAULT_ONEDRIVE_CLIENT_ID}"`,
      "process.env.DEFAULT_ONEDRIVE_AUTHORITY": `"${DEFAULT_ONEDRIVE_AUTHORITY}"`,
      global: "window",
      "process.env.NODE_DEBUG": `undefined`, // ugly fix
      "process.env.DEBUG": `undefined`, // ugly fix
    },
    legalComments: "none",
  })
  .catch(() => process.exit(1));

if (prod) {
  await context.rebuild();
  context.dispose();
} else {
  await context.watch();
}

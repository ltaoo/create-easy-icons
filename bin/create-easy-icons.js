#!/usr/bin/env node
const path = require("path");

const fsExtra = require("fs-extra");
const del = require("del");
const chalk = require("chalk");
const program = require("commander");
const minimist = require("minimist");

const { downloadTemplate } = require("../lib");

const CWD = process.cwd();
function resolve(...paths) {
  return path.resolve(CWD, ...paths);
}
const TMP_DIR = resolve(".tmp");

const pkg = require("../package");
program
  .version(`v${pkg.version}`)
  .enablePositionalOptions("<project-directory>")
  .usage(`${chalk.green("<project-directory>")} [options]`);

program
  .arguments("<project-directory>")
  .option("-f, --framework <framework>", "use react or vue", "react")
  .action((projectDirectory, options) => {
    if (minimist(process.argv.slice(3))._.length > 1) {
      console.log(
        chalk.yellow(
          "\n Info: You provided more than one argument. The first one will be used as the app's name, the rest are ignored."
        )
      );
    }
    const { framework } = options;
    // console.log(projectDirectory, framework);
    if (!["react", "vue"].includes(framework)) {
      console.log(
        `${chalk.redBright(
          "error"
        )} framework must be react or vue, but got ${framework}.`
      );
      process.exit(1);
    }
    initTemplate({ projectDirectory, framework });
  });

// output help information on unknown commands
program.on("command:*", ([cmd]) => {
  program.outputHelp();
  console.log(`  ` + chalk.red(`Unknown command ${chalk.yellow(cmd)}.`));
  console.log();
  process.exitCode = 1;
});

// add some useful info on help
program.on("--help", () => {
  console.log();
  console.log(
    `  Run ${chalk.cyan(
      `create-easy-icons <command> --help`
    )} for detailed usage of given command.`
  );
  console.log();
});

program.commands.forEach((c) => c.on("--help", () => console.log()));
program.parse(process.argv);

/**
 * 使用指定参数更新指定 pkg
 * @param {string} projectDirectory
 * @param {{ [key: string]: any }} modified
 */
function updatePackage(projectDirectory, modified = {}) {
  const pkgPath = resolve(projectDirectory, "package.json");
  const pkg = require(pkgPath);
  Object.assign(pkg, modified);
  fsExtra.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
}

function initTemplate({ projectDirectory, framework }) {
  downloadTemplate("ltaoo/e-icons-template", TMP_DIR, {}, (err) => {
    if (err) {
      console.log(err);
      return;
    }
    fsExtra.copySync(resolve(TMP_DIR, framework), resolve(projectDirectory));
    const projectName = path.parse(projectDirectory).name;
    updatePackage(resolve(projectDirectory), {
      name: projectName,
    });
    del(TMP_DIR);
    console.log(`${chalk.greenBright("Success")} Initialize project ${chalk.blueBright(projectName)} success.`);
  });
}

import * as ts from "typescript";
import * as fs from "fs";
import * as path from "path";
import { extractPackageNames } from "./extract/extractPackageNames";
import { extractImportStatements } from "./extract/extractImportStatements";
import { extractComponentNames } from "./extract/extractComponentNames";
import { findFirstJsxOpeningLikeElementWithName } from "./extract/findFirstJsxOpeningLikeElementWithName";
import { generateReactComponent } from "./template/generateReactComponent";

const srcPath = path.join("../src");
const buildPath = path.join("../test");

function processFile(filePath: string): void {
  const sourceCode = fs.readFileSync(filePath, "utf-8");
  const sourceFile = ts.createSourceFile("input.tsx", sourceCode, ts.ScriptTarget.Latest, true);
  const packageName = extractPackageNames(sourceFile);
  const importStatement = extractImportStatements(sourceFile);
  const componentNames = extractComponentNames(importStatement);
  console.log(`File: ${filePath}`);

  const fileName = path.basename(filePath, path.extname(filePath));
  const componentName = fileName.charAt(0).toUpperCase() + fileName.slice(1);

    const jsxElements = findFirstJsxOpeningLikeElementWithName(sourceFile, componentNames)
      .map((element) => element.getText())
      .join("\n");

      console.log(jsxElements)
    const componentCode = generateReactComponent(importStatement, componentName, jsxElements);

    const outputDirPath = path.join(buildPath, path.basename(filePath, path.extname(filePath)));
    if (!fs.existsSync(outputDirPath)) {
      fs.mkdirSync(outputDirPath, { recursive: true });
    }

    const outputFilePath = path.join(outputDirPath, "page.tsx");
    fs.writeFileSync(outputFilePath, componentCode);
    console.log(`Generated file: ${outputFilePath}`);
}

function walkDirectory(dirPath: string): void {
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stats = fs.statSync(filePath);
    if (stats.isDirectory()) {
      walkDirectory(filePath);
    } else if (stats.isFile() && path.extname(file).toLowerCase() === ".fsml") {
      processFile(filePath);
    }
  }
}

walkDirectory(srcPath);
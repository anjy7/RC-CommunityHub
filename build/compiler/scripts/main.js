"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ts = require("typescript");
var fs = require("fs");
var path = require("path");
var extractPackageNames_1 = require("./extract/extractPackageNames");
var extractImportStatements_1 = require("./extract/extractImportStatements");
var extractComponentNames_1 = require("./extract/extractComponentNames");
var findFirstJsxOpeningLikeElementWithName_1 = require("./extract/findFirstJsxOpeningLikeElementWithName");
var generateReactComponent_1 = require("./transform/generateReactComponent");
var transformImportStatements_1 = require("./transform/transformImportStatements");
var transformDataItems_1 = require("./transform/transformDataItems");
var extractData_1 = require("./extract/extractData");
var rootDir = path.resolve(process.cwd(), '../');
console.log(rootDir);
var srcPath = path.join(rootDir, 'src');
var buildPath = path.join(rootDir, 'build');
var buildPathApp = path.join(rootDir, 'build/app');
// Global Set to keep track of installed packages
var installedPackages = new Set();
function processFile(filePath) {
    var fileName = path.basename(filePath, path.extname(filePath));
    var sourceCode = fs.readFileSync(filePath, "utf-8");
    var sourceFile = ts.createSourceFile("input.tsx", sourceCode, ts.ScriptTarget.Latest, true);
    //extracting and transforming 
    var packageNames = (0, extractPackageNames_1.extractPackageNames)(sourceFile);
    var importStatement = (0, extractImportStatements_1.extractImportStatements)(sourceFile);
    var dataItems = (0, extractData_1.extractData)(sourceFile);
    var componentNames = (0, extractComponentNames_1.extractComponentNames)(importStatement);
    var transformedImports = (0, transformImportStatements_1.transformImportStatements)(importStatement);
    var transformedDataImports = (0, transformDataItems_1.transformDataItems)(dataItems, fileName);
    //generating component
    var componentName = fileName.charAt(0).toUpperCase() + fileName.slice(1);
    var jsxElements = (0, findFirstJsxOpeningLikeElementWithName_1.findFirstJsxOpeningLikeElementWithName)(sourceFile, componentNames)
        .map(function (element) { return element.getText(); })
        .join("\n");
    var componentCode = (0, generateReactComponent_1.generateReactComponent)(transformedImports, transformedDataImports, componentName, jsxElements);
    //installing npm packages used
    // installPackages(buildPathApp, packageNames, installedPackages);
    //creating files
    // const outputDirPath = path.join(buildPathApp, path.basename(filePath, path.extname(filePath)));
    // if (!fs.existsSync(outputDirPath)) {
    //   fs.mkdirSync(outputDirPath, { recursive: true });
    // }
    //   const outputFilePath = path.join(outputDirPath, "page.tsx");
    //   fs.writeFileSync(outputFilePath, componentCode);
    //   console.log(`Generated file: ${outputFilePath}`);
    // Creating files
    var outputDirPath = buildPathApp;
    if (fileName !== "main") {
        outputDirPath = path.join(outputDirPath, fileName);
    }
    if (!fs.existsSync(outputDirPath)) {
        fs.mkdirSync(outputDirPath, { recursive: true });
    }
    var outputFilePath = path.join(outputDirPath, "page.tsx");
    fs.writeFileSync(outputFilePath, componentCode);
    console.log("Generated file: ".concat(outputFilePath));
    // packageNames.forEach(packageName => extractPackageExports(buildPath, packageName));
    // Extract and log exports from each package
    // packageNames.forEach(packageName => extractPackageExports(buildPath, packageName));
}
function walkDirectory(dirPath) {
    var files = fs.readdirSync(dirPath);
    for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
        var file = files_1[_i];
        var filePath = path.join(dirPath, file);
        var stats = fs.statSync(filePath);
        if (stats.isDirectory()) {
            walkDirectory(filePath);
        }
        else if (stats.isFile() && path.extname(file).toLowerCase() === ".agml") {
            processFile(filePath);
        }
    }
}
walkDirectory(srcPath);
// function extractPackageExports(directory: string, packageName: string): void {
//   try {
//       // Resolve the package directory inside node_modules
//       const packageDir = path.join(directory, "node_modules", packageName, "dist");
//       const packageFiles = fs.readdirSync(packageDir);
//       packageFiles.forEach(file => {
//           const filePath = path.join(packageDir, file);
//           console.log("------",file)
//           if (path.extname(file) === '.js' || path.extname(file) === '.ts') {
//               const sourceCode = fs.readFileSync(filePath, "utf-8");
//               const sourceFile = ts.createSourceFile(filePath, sourceCode, ts.ScriptTarget.Latest, true);
//               extractExportsFromSourceFile(sourceFile, packageName);
//           }
//       });
//   } catch (error) {
//       console.error(`Error extracting exports from package ${packageName}:`, error);
//   }
// }
// function extractExportsFromSourceFile(sourceFile: ts.SourceFile, packageName: string): void {
//   const exports: string[] = [];
//   ts.forEachChild(sourceFile, node => {
//       if (ts.isExportDeclaration(node) || ts.isExportAssignment(node) || ts.isExportSpecifier(node)) {
//           const exportText = node.getText();
//           exports.push(exportText);
//       }
//   });
//   console.log(`Exports from ${packageName}:`, exports);
// }
// second way 
// async function extractPackageExports(directory: string, packageName: string): Promise<void> {
//   try {
//     const packageDir = path.join(directory, "node_modules", packageName, "dist");
//     // Import the main file (index.js)
//     const indexPath = path.join(packageDir, "index.js");
//     console.log(`Attempting to extract exports from: ${indexPath}`);
//     // Extract exports from index.js and resolve re-exports
//     await extractExportsFromFile(indexPath, packageDir);
//   } catch (error) {
//     console.error(`Error dynamically extracting exports from ${packageName}:`, error);
//   }
// }
// async function extractExportsFromFile(filePath: string, baseDir: string): Promise<void> {
//   try {
//     const sourceCode = fs.readFileSync(filePath, "utf-8");
//     const exportStatements = parseExportStatements(sourceCode);
//     for (const statement of exportStatements) {
//       if (statement.type === "re-export" && statement.path) {
//         // Only resolve the path if it's defined
//         const resolvedPath = path.resolve(baseDir, statement.path);
//         console.log(`Resolving re-export: ${resolvedPath}`);
//         // Recursively extract exports from the re-exported file
//         await extractExportsFromFile(resolvedPath, path.dirname(resolvedPath));
//       } else if (statement.type === "direct-export") {
//         console.log(`Found export: ${statement.exported}`);
//       }
//     }
//     // Extract all named exports like functions, constants, and classes
//     const namedExports = extractNamedExportsFromSourceCode(sourceCode);
//     if (namedExports.length > 0) {
//       console.log(`Named exports from ${filePath}:`, namedExports);
//     }
//   } catch (error) {
//     console.error(`Error extracting exports from file ${filePath}:`, error);
//   }
// }
// function parseExportStatements(sourceCode: string): { type: string, exported?: string, path?: string }[] {
//   const exportStatements: { type: string, exported?: string, path?: string }[] = [];
//   const exportRegex = /export\s+\*\s+from\s+['"](.+?)['"];|export\s+\{(.+?)\}\s+from\s+['"](.+?)['"];|export\s+(default|const|let|var|class|function)\s+(\w+)/g;
//   let match;
//   while ((match = exportRegex.exec(sourceCode)) !== null) {
//     if (match[1]) {
//       // Re-export (export * from ...)
//       exportStatements.push({ type: "re-export", path: match[1] });
//     } else if (match[2] && match[3]) {
//       // Named re-export (export { X } from ...)
//       exportStatements.push({ type: "re-export", path: match[3], exported: match[2] });
//     } else if (match[4] && match[5]) {
//       // Direct export (export const X, export function Y, etc.)
//       exportStatements.push({ type: "direct-export", exported: match[5] });
//     }
//   }
//   return exportStatements;
// }
// function extractNamedExportsFromSourceCode(sourceCode: string): string[] {
//   const sourceFile = ts.createSourceFile("temp.ts", sourceCode, ts.ScriptTarget.Latest, true);
//   const exports: string[] = [];
//   ts.forEachChild(sourceFile, node => {
//     if (ts.isFunctionDeclaration(node) && node.name) {
//       exports.push(`Function: ${node.name.getText()}`);
//     } else if (ts.isVariableStatement(node)) {
//       node.declarationList.declarations.forEach(declaration => {
//         if (ts.isIdentifier(declaration.name)) {
//           exports.push(`Variable: ${declaration.name.getText()}`);
//         }
//       });
//     } else if (ts.isClassDeclaration(node) && node.name) {
//       exports.push(`Class: ${node.name.getText()}`);
//     }
//   });
//   return exports;
// }

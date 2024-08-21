import ts = require("typescript");
import { readFileSync } from 'fs';
const fs = require('fs')
import { join, resolve } from 'path';

function isJsxOpeningLike(node: ts.Node): node is ts.JsxOpeningLikeElement {
  return node.kind === ts.SyntaxKind.JsxOpeningElement || node.kind === ts.SyntaxKind.JsxSelfClosingElement;
}

function findFirstJsxOpeningLikeElementWithName(node: ts.SourceFile, tagName: string) {
  return find(node);

  function find(node: ts.Node | undefined): ts.JsxOpeningLikeElement | undefined {
    if (!node) {
      return undefined;
    }

    // Is this a JsxElement with an identifier name?
    if (isJsxOpeningLike(node) && node.tagName.kind === ts.SyntaxKind.Identifier) {
      // Does the tag name match what we're looking for?
      if ((node.tagName as ts.Identifier).text === tagName) {
        return node;
      }
    }

    return ts.forEachChild(node, find);
  }
}

// const dataDir = join(__dirname, 'data');
// const files = readFileSync("./data", 'utf8').split('\n').filter(Boolean);
const files = fs.readdirSync("./data")
files.forEach((file: string) => {
  const filePath = join("./data", file);
  const fileContents = readFileSync(filePath, 'utf-8');
  const sourceFile = ts.createSourceFile("file.ts", fileContents, ts.ScriptTarget.ES2015, /*setParentNodes*/ true, ts.ScriptKind.TSX);

  const element = findFirstJsxOpeningLikeElementWithName(sourceFile, "NavigationMenuDemo");

  if (element) {
    console.log(`------------\nFile: ${file}`);
    console.log(element.getText());
  } else {
    console.log(`No Navbar element found in file: ${file}`);
  }
});
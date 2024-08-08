import * as ts from "typescript";

function isJsxOpeningLike(node: ts.Node): node is ts.JsxOpeningLikeElement {
    return node.kind === ts.SyntaxKind.JsxOpeningElement || node.kind === ts.SyntaxKind.JsxSelfClosingElement;
  }
  
  
export function findFirstJsxOpeningLikeElementWithName(node: ts.SourceFile, tagNames: string[]) {
    const elements: ts.JsxOpeningLikeElement[] = [];
    function find(node: ts.Node | undefined): void {
      if (!node) {
        return;
      }
      // Is this a JsxElement with an identifier name?
      if (isJsxOpeningLike(node) && node.tagName.kind === ts.SyntaxKind.Identifier) {
        // Check if the tag name matches any of the tagNames
        for (const tagName of tagNames) {
          if ((node.tagName as ts.Identifier).text === tagName) {
            elements.push(node);
            break;
          }
        }
      }
      ts.forEachChild(node, find);
    }
    find(node);
    return elements;
}
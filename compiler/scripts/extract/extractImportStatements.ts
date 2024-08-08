import * as ts from "typescript";

export function extractImportStatements(sourceFile: ts.SourceFile): string[] {
    const importStatements: string[] = [];
    ts.forEachChild(sourceFile, (node) => {
        if (ts.isImportDeclaration(node) || ts.isImportEqualsDeclaration(node)) {
            importStatements.push(node.getText(sourceFile));
        }
    });
    return importStatements;
  }
export function generateReactComponent(importStatement: string[], componentName: string, jsxElements: string): string {
  const imports = importStatement.join('\n');
  return `
import React from 'react';
${imports}
export default function ${componentName}() {
  return (
    <>
${jsxElements}
    </>
  );
};
`;
}
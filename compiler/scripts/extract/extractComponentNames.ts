export function extractComponentNames(importStatements :any): string[] {
    const componentNames: string[] = [];
    const regex = /\{([^}]+)\}/;
    
    for (const statement of importStatements) {
        const match = statement.match(regex);
        if (match) {
            const names = match[1].split(',').map((name: string)=> name.trim());
            componentNames.push(...names);
        }
    }
    
    return componentNames;
}
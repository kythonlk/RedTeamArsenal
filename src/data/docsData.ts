export interface DocFile {
  id: string;
  title: string;
  category: string;
  path: string;
  content: string;
}

const rawDocs = import.meta.glob('./docs/**/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
});

export function getDocsData(): DocFile[] {
  return Object.entries(rawDocs).map(([filePath, content]) => {
    const pathParts = filePath.split('/');
    const categoryRaw = pathParts[pathParts.length - 2];
    const fileName = pathParts[pathParts.length - 1];
    const id = fileName.replace(/\.md$/, '');

    // Transform "nmap-scanning" -> "Nmap Scanning"
    const title = id
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    // Transform "recon" -> "Recon"
    const category = categoryRaw.charAt(0).toUpperCase() + categoryRaw.slice(1);

    return {
      id,
      title,
      category,
      path: `${categoryRaw}/${fileName}`,
      content: content as string,
    };
  });
}

// Export a constant for easy use in your components
export const docsData: DocFile[] = getDocsData();

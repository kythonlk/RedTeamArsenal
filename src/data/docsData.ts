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
  return Object.entries(rawDocs)
    .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
    .map(([filePath, content]) => {
      const pathParts = filePath.split('/');
      const categoryRaw = pathParts[pathParts.length - 2];
      const fileName = pathParts[pathParts.length - 1];
      const id = fileName.replace(/\.md$/, '');

      // Transform "03-web-attacks" -> "Web Attacks" (drop leading numeric prefix for display)
      const title = id
        .replace(/^\d+[-_]?/, '')
        .split(/[-_]/)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      // Transform "recon" -> "Recon"; keep known acronyms uppercase
      const category = categoryRaw
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');

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

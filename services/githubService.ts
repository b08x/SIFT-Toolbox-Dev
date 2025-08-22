// A list of file extensions to include in the analysis.
// This helps to filter out binary files, images, etc.
const INCLUDED_EXTENSIONS = new Set([
  '.js', '.jsx', '.ts', '.tsx', '.json', '.md', '.html', '.css', '.scss', '.py', '.rb', '.java',
  '.go', '.php', '.rs', '.swift', '.kt', '.c', '.cpp', '.h', '.cs', '.sh', '.yml', '.yaml',
  '.toml', '.ini', '.cfg', 'Dockerfile', '.env.example', '.xml', '.svg'
]);

// A list of common directories to ignore.
// This helps to filter out dependencies, build artifacts, and git metadata.
const IGNORED_DIRS = new Set([
  'node_modules', 'dist', 'build', 'target', 'vendor', '.git', 'coverage', 'public', 'assets'
]);

const MAX_FILE_SIZE_BYTES = 1_000_000; // 1MB

interface RepoUrl {
  owner: string;
  repo: string;
}

interface GitHubFile {
  path: string;
  mode: string;
  type: 'blob' | 'tree';
  sha: string;
  size: number;
  url: string;
}

/**
 * Parses a GitHub repository URL to extract the owner and repo name.
 * @param url The full GitHub URL.
 * @returns An object with owner and repo, or null if the URL is invalid.
 */
function parseRepoUrl(url: string): RepoUrl | null {
  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.hostname !== 'github.com') {
      return null;
    }
    const pathParts = parsedUrl.pathname.split('/').filter(Boolean);
    if (pathParts.length < 2) {
      return null;
    }
    const [owner, repo] = pathParts;
    return { owner, repo: repo.replace('.git', '') };
  } catch (error) {
    return null;
  }
}

/**
 * Fetches the content of a file from GitHub's API.
 * The content is expected to be Base64 encoded.
 * @param fileUrl The API URL for the file blob.
 * @returns The decoded file content as a string.
 */
async function getFileContent(fileUrl: string): Promise<string> {
    const response = await fetch(fileUrl);
    if (!response.ok) {
        throw new Error(`Failed to fetch file content from ${fileUrl}: ${response.statusText}`);
    }
    const data = await response.json();
    if (data.encoding !== 'base64' || !data.content) {
        // Fallback for files that might not be base64 encoded, though API docs say they are.
        return '';
    }
    // The content is a Base64 encoded string with newlines. Replace them before decoding.
    return atob(data.content.replace(/\n/g, ''));
}


/**
 * Main function to import a public GitHub repository and format its content as a single string.
 * @param repoUrl The URL of the public GitHub repository.
 * @param onProgress A callback to report progress updates.
 * @returns A promise that resolves to the formatted string content, file count, and repo name.
 */
export async function importRepoToString(
    repoUrl: string,
    onProgress: (message: string) => void
): Promise<{ content: string, fileCount: number, repoName: string }> {

    const parsed = parseRepoUrl(repoUrl);
    if (!parsed) {
        throw new Error("Invalid GitHub repository URL. Please use a format like 'https://github.com/owner/repo'.");
    }
    const { owner, repo } = parsed;
    onProgress(`Fetching file list for ${owner}/${repo}...`);

    // 1. Get repo info to find the default branch
    const repoInfoResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
    if (!repoInfoResponse.ok) {
        const status = repoInfoResponse.status;
        let errorMessage = `Failed to fetch repository info: ${repoInfoResponse.statusText} (Status: ${status}).`;

        if (status === 404) {
            errorMessage = "Repository not found. Please check the URL and ensure it's a public repository.";
        } else if (status === 403) {
            try {
                const body = await repoInfoResponse.json();
                if (body && body.message) {
                    errorMessage = `GitHub API Error: ${body.message}`;
                    if (body.message.toLowerCase().includes('rate limit')) {
                        errorMessage += " The limit for unauthenticated requests is low. Please wait a while before trying again.";
                    }
                } else {
                    errorMessage = "Access to the repository is forbidden (Status: 403). This is often due to API rate limiting. Please wait a while before trying again.";
                }
            } catch (e) {
                errorMessage = "Access to the repository is forbidden (Status: 403) and the error details could not be read. This is often due to API rate limiting.";
            }
        }
        throw new Error(errorMessage);
    }
    const repoInfo = await repoInfoResponse.json();
    const defaultBranch = repoInfo.default_branch || 'main';

    // 2. Fetch the file tree recursively
    const treeUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`;
    const treeResponse = await fetch(treeUrl);

    if (!treeResponse.ok) {
       const status = treeResponse.status;
        let errorMessage = `Failed to fetch file tree: ${treeResponse.statusText} (Status: ${status}).`;
        
        if (status === 404) {
            errorMessage = `Could not find the default branch ('${defaultBranch}'). The repository might be empty or the branch name is incorrect.`;
        } else if (status === 403) {
            try {
                const body = await treeResponse.json();
                if (body && body.message) {
                    errorMessage = `GitHub API Error while fetching file list: ${body.message}`;
                     if (body.message.toLowerCase().includes('rate limit')) {
                        errorMessage += " The limit for unauthenticated requests is low. Please wait a while and try again.";
                    }
                } else {
                    errorMessage = "Access to the repository file list is forbidden (Status: 403). This is often due to API rate limiting.";
                }
            } catch (e) {
                errorMessage = "Access to the repository file list is forbidden (Status: 403) and the error details could not be read. This is often due to API rate limiting.";
            }
        }
        throw new Error(errorMessage);
    }
    const treeData = await treeResponse.json();

    if (treeData.truncated) {
        console.warn('Repository file tree is truncated. Some files may be missing from the analysis.');
    }

    // 3. Filter the file list
    const filesToFetch = (treeData.tree as GitHubFile[]).filter(file => {
        if (file.type !== 'blob') return false; // Only include files (blobs)
        if (file.size > MAX_FILE_SIZE_BYTES) return false; // Ignore large files
        if (file.path.split('/').some(part => IGNORED_DIRS.has(part))) return false; // Ignore common dependency/build folders

        // Check if the file extension is in our list, or if it has no extension (like 'Dockerfile')
        const extension = '.' + file.path.split('.').pop();
        const hasNoExtension = !file.path.includes('.');
        return INCLUDED_EXTENSIONS.has(hasNoExtension ? file.path : extension);
    });

    if (filesToFetch.length === 0) {
        throw new Error("No relevant source code files were found in this repository.");
    }

    onProgress(`Found ${filesToFetch.length} files. Fetching content...`);

    // 4. Fetch content for each file and format the output
    let fullContent = `Analyzing repository: ${owner}/${repo}\nBranch: ${defaultBranch}\nTotal files included: ${filesToFetch.length}\n\n`;
    const contentPromises = filesToFetch.map(async file => {
        try {
            const fileContent = await getFileContent(file.url);
            return `--- START OF FILE: ${file.path} ---\n\n${fileContent}\n\n--- END OF FILE: ${file.path} ---\n\n`;
        } catch (error) {
            console.error(`Skipping file ${file.path} due to error:`, error);
            return `--- FAILED TO LOAD FILE: ${file.path} ---\n\n`;
        }
    });

    const contents = await Promise.all(contentPromises);
    fullContent += contents.join('');

    return { 
      content: fullContent, 
      fileCount: filesToFetch.length,
      repoName: `${owner}/${repo}`
    };
}
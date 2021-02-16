import download from 'download-git-repo';

/**
 * 下载模板
 */
export function downloadTemplate(repo, dest, opts, fn) {
    download(repo, dest, opts, fn);
}

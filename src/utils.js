import { readdir } from 'node:fs/promises';
import { resolve } from 'node:path';

export async function* getFiles(dir) {
    const dirents = await readdir(dir, { withFileTypes: true });
    for (const dirent of dirents) {
        const res = resolve(dir, dirent.name);
        if (dirent.isDirectory()) yield* getFiles(res);
        if (!dirent.isDirectory()) yield res?.toLowerCase();
    }
}

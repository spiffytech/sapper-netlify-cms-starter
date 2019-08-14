import fm from 'front-matter';
import glob from 'glob';
import {fs} from 'mz';
import path from 'path';

export async function get(req, res) {
  // List the Markdown files and return their filenames
  const posts = await new Promise((resolve, reject) =>
      glob('static/_posts/*.md', (err, files) => {
      if (err) return reject(err);
      return resolve(files);
    }),
  );

  // Parse out the metadata from the files
  const postsFrontMatter = await Promise.all(
    posts.map(async post => {
      const content = (await fs.readFile(post)).toString();
      return {...fm(content).attributes, slug: path.parse(post).name};
    }),
  );

  // Sort by reverse datea, because ait's a blog
  postsFrontMatter.sort((a, b) => (a.date < b.date ? 1 : -1));

  res.writeHead(200, {
    'Content-Type': 'application/json',
  });

  res.end(JSON.stringify(postsFrontMatter));
}

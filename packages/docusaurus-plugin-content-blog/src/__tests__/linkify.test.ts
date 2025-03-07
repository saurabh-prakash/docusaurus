/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import fs from 'fs-extra';
import path from 'path';
import {linkify, type LinkifyParams, getSourceToPermalink} from '../blogUtils';
import type {
  BlogBrokenMarkdownLink,
  BlogContentPaths,
  BlogPost,
} from '../types';

const siteDir = path.join(__dirname, '__fixtures__', 'website');
const contentPaths: BlogContentPaths = {
  contentPath: path.join(siteDir, 'blog-with-ref'),
  contentPathLocalized: path.join(siteDir, 'blog-with-ref-localized'),
};
const pluginDir = 'blog-with-ref';
const blogPosts: BlogPost[] = [
  {
    id: 'Happy 1st Birthday Slash!',
    metadata: {
      permalink: '/blog/2018/12/14/Happy-First-Birthday-Slash',
      source: path.posix.join(
        '@site',
        pluginDir,
        '2018-12-14-Happy-First-Birthday-Slash.md',
      ),
      title: 'Happy 1st Birthday Slash!',
      description: `pattern name`,
      date: new Date('2018-12-14'),
      tags: [],
      prevItem: {
        permalink: '/blog/2019/01/01/date-matter',
        title: 'date-matter',
      },
      truncated: false,
    },
  },
];

const transform = async (
  filePath: string,
  options?: Partial<LinkifyParams>,
) => {
  const fileContent = await fs.readFile(filePath, 'utf-8');
  const transformedContent = linkify({
    filePath,
    fileString: fileContent,
    siteDir,
    contentPaths,
    sourceToPermalink: getSourceToPermalink(blogPosts),
    onBrokenMarkdownLink: (brokenMarkdownLink) => {
      throw new Error(
        `Broken markdown link found: ${JSON.stringify(brokenMarkdownLink)}`,
      );
    },
    ...options,
  });
  return [fileContent, transformedContent];
};

test('transform to correct link', async () => {
  const post = path.join(contentPaths.contentPath, 'post.md');
  const [content, transformedContent] = await transform(post);
  expect(transformedContent).toMatchSnapshot();
  expect(transformedContent).toContain(
    '](/blog/2018/12/14/Happy-First-Birthday-Slash',
  );
  expect(transformedContent).not.toContain(
    '](2018-12-14-Happy-First-Birthday-Slash.md)',
  );
  expect(content).not.toEqual(transformedContent);
});

test('report broken markdown links', async () => {
  const filePath = 'post-with-broken-links.md';
  const folderPath = contentPaths.contentPath;
  const postWithBrokenLinks = path.join(folderPath, filePath);
  const onBrokenMarkdownLink = jest.fn();
  const [, transformedContent] = await transform(postWithBrokenLinks, {
    onBrokenMarkdownLink,
  });
  expect(transformedContent).toMatchSnapshot();
  expect(onBrokenMarkdownLink).toHaveBeenCalledTimes(2);
  expect(onBrokenMarkdownLink).toHaveBeenNthCalledWith(1, {
    filePath: path.resolve(folderPath, filePath),
    contentPaths,
    link: 'postNotExist1.md',
  } as BlogBrokenMarkdownLink);
  expect(onBrokenMarkdownLink).toHaveBeenNthCalledWith(2, {
    filePath: path.resolve(folderPath, filePath),
    contentPaths,
    link: './postNotExist2.mdx',
  } as BlogBrokenMarkdownLink);
});

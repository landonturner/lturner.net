// main.js
import Metalsmith from 'metalsmith';
import babel from 'metalsmith-babel';
import collections from 'metalsmith-collections';
import layouts from 'metalsmith-layouts';
import markdown from 'metalsmith-markdown';
import permalinks from 'metalsmith-permalinks';
import sass from 'metalsmith-sass';
import debug from 'metalsmith-debug';
import discoverPartials from 'metalsmith-discover-partials';

const production = process.env.NODE_ENV === 'production';

Metalsmith(__dirname)
  .source('./source')
  .destination('./dist')
  .clean(true)

  .metadata({
    production,
  })

  .use(markdown())
  .use(collections({ sortBy: 'date' }))
  .use(permalinks({ relative: false }))

  .use(discoverPartials({
    directory: 'layouts/partials',
    pattern: /\.hbs$/,
  }))
  .use(layouts())

  .use(sass())
  .use(babel())

  .use(debug())

  .build((err) => {
    if (err) throw err;
  });

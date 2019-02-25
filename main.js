// main.js
import Metalsmith from 'metalsmith';
import layouts from 'metalsmith-layouts';
import markdown from 'metalsmith-markdown';
import sass from 'metalsmith-sass';
import babel from 'metalsmith-babel';

const production = process.env.NODE_ENV === 'production';

Metalsmith(__dirname)
  .source('./source')
  .destination('./dist')
  .clean(true)

  .metadata({
    production,
  })

  .use(markdown())
  .use(layouts())

  .use(sass())
  .use(babel())

  .build((err) => {
    if (err) throw err;
  });

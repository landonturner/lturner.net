---
title: Building This Blog
layout: blog-post.hbs
date: 2019-02-24
collection: blog
---

# Building This Blog With Metalsmith and Netlify

There are many blogging platforms that are great and easy to use. However, I
like to have more direct control over the source files, and I want my blog to
live under my own domain name. Another requirement for this project is that
each subsequent post should be easy to create. Finally, I need to be able to
see my changes reflected quickly in the browser. This post will detail how to
setup a dev environment to generate such a blog, deploy it to Netlify, and
allow comments with disqus.

Each individual post in the blog we will make will be a simple
[Markdown](https://en.wikipedia.org/wiki/Markdown) file that gets translated
into a fully formed html page using [Metalsmith](https://metalsmith.io/). The
html file then can be served directly over the internet.

This code for this blog is hosted publicy on
[github](https://github.com/landonturner/lturner.net) and the blog itself is
hosted using [Netlify](https://netlify.com) for free with their personal tier.

## Technical

The project is built off of Metalsmith and uses the handebars template
language. It uses an nginx container to serve the files in development, and
nodemon to automatically rebuild each file.

### Metalsmith

Metalsmith provides an easy and convenient way to construct a static site. I
like to think of Metalsmith as a pipeline mapping process. It applies each
plugin in succession to every page starts as a markdown file that gets
translated into html that gets inserted into a template.

[main.js](https://github.com/landonturner/lturner.net/blob/master/main.js)
```javascript
// main.js
import Metalsmith from 'metalsmith';
import babel from 'metalsmith-babel';
import collections from 'metalsmith-collections';
import layouts from 'metalsmith-layouts';
import markdown from 'metalsmith-markdown';
import permalinks from 'metalsmith-permalinks';
import sass from 'metalsmith-sass';
import debug from 'metalsmith-debug';

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
  .use(layouts())

  .use(sass())
  .use(babel())

  .use(debug())

  .build((err) => {
    if (err) throw err;
  });
```

Each plugin mutates the state and passes it to the next plugin. Because of this
the ordering of each plugin is significant. `markdown()` translates the
markdown to html, and must occur before `layouts()`, because it is important to
insert html into the handlebars template.

The collections plugin collects and sorts the blog files so that I can build an
index on the main page. Permalinks sorts the files in a way that nginx and
browsers expect (creating-a-blog/index.html). Sass translates the scss files
into plain css, and babel translates modern js into legacy js. Debug prints out
debug information when the correct env vars are produced.

Each markdown file defines metadata in its frontmatter that is used by the
plugins. For example, the collections plugin groups the files based on the
collecitons variable, and orders them by the date. Further, all of the metadata
can be used by templates. Title and Date are both expressed in the template and
appear in the final html file.

The finalized files are all output to the `dist/` folder, and this folder can
be served directly. You can see in the next section, nginx serves this folder
directly, and later, so does netlify.

### Production Build

There are certain elements that I only want to appear in production. Using the
standard `NODE_ENV` environment variable, I add a piece of metadata that I use
in the layouts to express these elements _cough cough Google Analytics cough
cough_.

## Development

### Nodemon

[Nodemon](https://nodemon.io/) is a great tool to watch a filesystem for
changes and issue a command when changes have been detected. I have added a
script in the package.json that issues the nodemon watcher and rebuilds the
site whenever a change has been made. In this way, any save will be reflected
in the dist file. Metalsmith has a quick build for such a small site so it
feels almost instant.

### Nginx

Using an nginx container with the dist folder mounted to serve all the files
allows for resolving all internal relative links, like css and js. It starts up
quickly, and because the files are mounted in, changes are immediately visible.
docker-compose is designed to coordinate an environment with different
containers, but here I am using it as a way to save the environment rather than
trying to remember later how I started it. I may choose to run my build process
in a container later, but for now this approach is working for me. 

```yaml
# docker-compose.yml
nginx:
  image: nginx
  container_name: blag-nginx
  volumes:
    - ./dist/:/usr/share/nginx/html
  ports:
    - 80:80
```

Something that this process is missing is live browser reloads. Anyone who is
familiar with webpack knows the default dev server will execaute a reload
whenever the build is finished. Sometime in the future I may try to work that
in. I figure this is going to involve replacing nginx with a custom server with
websocket functionality. I suspect there may be a library to easily do this,
and if not this seems like a great idea of something to open source.

## Styling and Javascript

I have chosen to incorporate bootstrap. It is an easy way to style a page, I am
somewhat familiar with it, but most importantly, most browsers have boostrap
cached, so there isn't any extra load time or size. At the time of this
writing, the main page looks terrible and I haven't really done much. I need to
fix that for sure.

## Production Deployment

### Netlify
I have found deploying with [Netlify](https://www.netlify.com) a delight.
_#not-an-ad_. Their service is free for people deploying personal sites.
Setting up webhooks for github was a snap, so any new code pushed to master
will be reflected in production in seconds. They run build commands, and
supports many languages and build types. This facilitates not having to check
in the dist folder. They made it extremely easy to hook up my previously owned
`lturner.net` domain and they manage all ssl certs (issued from letsencrypt
<3).

They provided an easy way to set up 404 and create redirects by simply adding [this file](https://github.com/landonturner/lturner.net/blob/master/source/_redirects) to the dist folder.

## Closing Thoughts

Metalsmith provides a simple way to make static parts with reusable parts. It
is simple, yet powerful. I did not go into creating customized plugins, because
my need was somewhat simple. But you can tailor metalsmith to do whatever you
wish.

Netlify was very convenient and extremely simple to set up. The entire setup
and eployment of my site (including webhook setup and dns migration) took about
5 minutes.


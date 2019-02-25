---
title: Building This Blog
layout: blog-post.hbs
date: 2019-02-24
collection: blog
---

# Building This Blog

There are many blogging platforms that are great and easy to use. However, I
like to have more direct control over the source files, and I want my blog to
live under my own domain name. Another requirement for this project is that
each subsequent post should be easy to create. Finally, I need to be able to
see my changes reflected quickly in the browser. This post will detail how to
setup a dev environment to generate such a blog.

Each individual post in the blog we will make will be a simple
[Markdown](https://en.wikipedia.org/wiki/Markdown) file that gets translated
into a fully formed html page using [Metalsmith](https://metalsmith.io/). The
html file then can be served directly over the internet.

I will walk through each technical design decision I have made, and if you
follow these steps (or just fork [the repo]()) you will have an efficient way
to administer your highly customizable blog. I will not go into UI and specific
styling choices as I think those are best left UI/UX experts. If you are a
UI/UX expert, I would love to hear comments on how I did.

I have all the code sitting in [this github
repo](https://github.com/landonturner/metalsmith-blog-seed). Feel free to bug
me about any errors or issues there.

## Project Setup

Use `npm init` to create your base project. The choices you make don't really
make that much of a difference as far as this post is concerend. I like the
styling on the airbnb eslint, so that is what I have included in the
`.eslintrc.yml` file. I personally use [vim ale](https://github.com/w0rp/ale)
to keep my project linted and fresh during development. That is outside the
scope of this post, however. You can skip all the linting if you are a complete
savage.

### Modern Javascript & Babel

I prefer the newer javascript syntax. Arrows, async/await, consts etc. Out of
the box node does not like this syntax so I use the [babel
transpiler](https://babeljs.io/) to convert the newer javascript into plain
javascript. Our main file is somewhat small, so skipping this completely and
using the older require syntax will be completely fine, just be warned you will
have to change main.js to suit your own needs.

Install babel with the following npm commands

```
npm install --save-dev @babel/cli @babel/core @babel/node @babel/polyfill @babel/preset-env
```

Create a file named `babel.config.js` in your root directory add the following:

```javascript
// bable.config.js
module.exports = { presets: ['@babel/env'] };
```

Create a `main.js` file in your root directory and dump in your favorite
javascript hello world as a placeholder. To demonstrate how babel transpiles
the code, you can run `./node_modules/.bin/babel main.js` from the command
line. This will display on your console your main.js file converted to plain
javascript. Kind of neat but not really that useful. Our `@babel/node`
dependency provided us a program called `babel-node` that will transpile _and_
run our code. Much more useful. Running `./node_modules/.bin/babel-node
main.js` will execute our main.js file. I find it tedious to run that command
by hand each time, so I added a script into the package.json like this:

```
  ...
  "scripts": {
    "build": "babel-node main.js"
  },
  ...
```

This works because npm has the superpower that it is aware of executibles
located in node-modules/.bin. You can run your project with `npm run build`
now.

### Structure

Here is what my directory structure looks like

```
$ tree -I node_modules -a
.
|-- .eslintrc.yml
|-- babel.config.js
|-- main.js
|-- package-lock.json
`-- package.json
```

At this point, we have our environment configured to run everything we want to
run. There is still one more piece for expedient development.

### Rebuilding Automatically

It seems pretty obvious to me why rebuilding your project automatically would
be useful. There is a tool called [nodemon](https://github.com/remy/nodemon)
that will watch your filesystem and run a command whenever it detects a file
has been changed. We can configure it to watch all our markdown, layout, js, and
style files and rebuild the site for us.

```
npm install --save-dev nodemon
```

Add this script into your package.json

```
"watch": "nodemon --watch source --watch layouts -e md,scss,hbs,js ./node_modules/.bin/babel-node main.js"
```

Start watching and rebuilding automoatically with `npm run watch`. Now if you
change file ending in `md`, `scss`, `hbs`, or `js` your project will rebuild
itself.

## Nginx

You should make sure you have [docker](https://www.docker.com/) and
docker-compose installed on your machine. I find this the easiest way to run
nginx for development purposes. Getting this server running is important for
developing the links between pages and using assets.

In our coming steps, metalsmith will output our html to the `dist` folder. If
you are following step by step, and have not just cloned the repo, you can
create the dist folder manually and put in a dummy index.html.

I use nginx to do my file serving, but an apache container would serve the same
purpose here. In a file named `docker-compose.yml`, dump the following yaml:

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

Start it with `docker-compose up`. The nice thing about doing it this way is
that because the dist folder is mounted in the container as a volume, any
changes are instantly reflected. navigate to
http://127.0.0.1/blog/awesome-blog-post and you can view your _beautiful_ blog
post. A further improvement here would be for live reloading on the browser
whenever something has changed. `webpack-dev-server` has this functionality but
I have not looked into integrating this yet.

## Metalsmith

Metalsmith bills itself as a simple, pluggable site generator. There are a lot
of cool things you can do with metalsmith. For example,
[MapR](https://mapr.com) uses metalsmith to build their entire public facing
marketing site. I like to think of metalsmith as a pipeline. Each stage of the
pipeline is a plugin that does a specific task. Usually the plugins mutate the
contents of a file into another form. The mutated files are then written out
the the destination folder. With no plugins at all the destination folder looks
exactly like the source folder. The first plugin `metalsmith-markdown` we will
introduce will translate the markdown into raw html.

```
npm install --save metalsmith metalsmith-markdown
```

### Translating Markdown to HTML

First create a folder to store all the markdown files. I'm calling mine
`source`. Add in a markdown file. Here is an example if you are feeling
uncreative. The folder name will become the URL link because the `index.html`
part is served by default.

```markdown
<!-- ./source/awesome-blog-post/index.md -->
# This is a terrible blog post

with unimaginative language
and boring word structure

### but the content is

[top notch](https://thenumbersnail.com)
[a one](https://leaveanote.io/oldtownbrown)
```

```javascript
// main.js
import Metalsmith from 'metalsmith';
import markdown from 'metalsmith-markdown';

Metalsmith(__dirname)
  .source('./source') // use source as the starting folder
  .destination('./dist') // output resulting files to ./dist
  .clean(false) // do not remove files from dist on each build

  .use(markdown()) // translates markdown to html

  .build((err) => {
    if (err) throw err;
  });
```

Run it with `npm run build`. It should run without errors and produce our html
file in the newly created `dist` folder.

```
$ tree -I node_modules
.
|-- babel.config.js
|-- dist
|   `-- blog
|       |-- awesome-blog-post
|       |   |-- index.html
|       `-- creating-a-blog
|           |-- index.html
|-- layouts
|   `-- blog-post.hbs
|-- main.js
|-- package-lock.json
|-- package.json
`-- source
    `-- blog
        |-- awesome-blog-post
        |   `-- index.md
        `-- creating-a-blog
            `-- index.md
```

You could probably guess for every markdown file in the source directory, a
corresponding html page will be created in the dist folder. It will even
respect the folder structure. I'm going to move all my blog posts under
`/blog`.

Inspecting these files and they are html, but they are just fragments; there
are no top level `<html>` tags and lack html best practices. Lets fix that with
metalsmith-layouts!

### Building Fully Formed Pages - Layouts

Layouts helps frame our html in an html document. There are many templating
language you can pick. I picked handlebars becasue I have some experience with
it. There are plenty of good ones out there, so if you hate handlebars feel
free to pick something else.

Install the layout and the jstransformer (handlebars) with these commands:

```bash
npm install --save metalsmith-layouts
npm install --save-dev jstransformer-handlebars
```

I try to install things that I import directly in my project as dependencies
(metalsmith, markdown, layouts, etc) and background packages (nodemon, babel,
jstransformers, etc) into dev dependencies.

Lets wrap our awesome blog post in html. Create a folder named `layouts` and
start writing our handlebars layout. We have two fields here that we will
address in a moment in our markdown file. Notice that content has three
curlies, because we do not want the content HTML encoded. The title should be
html encoded, so we use two curlies.

```html
{{!-- layouts/blog-post.hbs --}}
<!doctype html>
<html>
  <head>
    <title>{{ title }}</title>
  </head>
  <body>
    {{{ contents }}}
  </body>
</html>
```

In metalsmith, `contents` refers to the body of the document. It started as
markdown, and then the markdown plugin converted it to html, and now we are
going to insert it into this blog post layout. For more information on how
metalsmith works under the hood, check out the [metalsmith
documentation](https://metalsmith.io/#how-does-it-work-in-more-detail-)

We can add metadata to each file using
[frontmatter](https://middlemanapp.com/basics/frontmatter/) located at the start
of the markdown. The metadata we add is exposed to each plugin, and we can use
it in our layout. The `{{ title }}` expression in the layout file will be
populated from our frontmatter.

Certain plugins look for specific metadata in the frontmatter. The layouts
plugin needs to know which layout to use. You can set a default layout when you
initialize the plugin, but I have chosen to specify the layout in the
frontmatter.

```markdown
---
title: Awesome Blog Post
layout: blog-post.hbs
---
<!-- ./source/awesome-blog-post/index.md -->
...
```

And to put it all together, initialize the layouts in main.js. You must include
the layouts after markdown, so that we are templating the content _after_ we
transformed it into html.

```javascript
// main.js
import Metalsmith from 'metalsmith';
import markdown from 'metalsmith-markdown';
import layouts from 'metalsmith-layouts';

Metalsmith(__dirname)
  .source('./source')
  .destination('./dist')
  .clean(false)

  .use(markdown())
  .use(layouts()) // embeds the content in the handlebars layout

  .build((err) => {
    if (err) throw err;
  });
```

Running this now will produce a fullly formed html document! Open it in your
favorite browser and look at it. Its ugly, but it's unfortunately your baby, so
you have to love it. Protip the command `open .` on a mac will open the current
folder in finder. 

### Debugging

I had to do some debugging to figure out what was going on with the collections
in the next section, so I figured introducing the debugging here might help
solve potential issues in the coming sections. The debugger is straightforward.
It just prints out information about the current metalsmith state. You can use
this information to inform the availability of variables in your layouts, or
help with plugin ordering issues.

```
npm install --save metalsmith-debug
```

Calling the debugger like this `.use(debug())` in metalsmith shows you a
picture of the current pipeline state. To run it you need to provide the
environment variable `DEBUG=metalsmith:*`. The metalsmith debugger uses
[debug](https://github.com/visionmedia/debug) internally which is where that
notation comes from. I added the following script in my package.json for ease
of use.

```
"debug": "DEBUG=metalsmith:* babel-node main.js",
```

### Permalinks

Let's clean things up a a bit using
[metalsmith-permalinks](https://github.com/segmentio/metalsmith-permalinks).
This library allows us to organize our markdown in a more human readable way
and still maintain the generated index files.

```
npm install --save metalsmith-permalinks
```

I am going to move all of the markdown files.

```
/source/blog/awesome-blog-post/index.md -> /source/blog/awesome-blog-post.md
```

It will automatically translate your blog posts into the index.html format we
were doing manually before. Another important thing that permalinks does is add
a `path` variable on each file. I had to do some experimentation to find the
correct part of the stack to put the permalinks call. I found the sweet spot
after the markdown call and before the layouts call. Too early in the stack and
the path would reflect the markdown filetype, and too late and it had an
unnecessary index.html at the end.

```
// main.js
import Metalsmith from 'metalsmith';
import layouts from 'metalsmith-layouts';
import markdown from 'metalsmith-markdown';
import permalinks from 'metalsmith-permalinks';
import debug from 'metalsmith-debug';

Metalsmith(__dirname)
  .source('./source')
  .destination('./dist')
  .clean(false)

  .use(markdown())
  .use(permalinks())
  .use(layouts())

  .use(debug())

  .build((err) => {
    if (err) throw err;
  });
```

### Images

### Styling and Javascript

Let's put some lipstick on this pig. First we are going to make a site-wide
scss file that should be included in each page. I like scss because I'm not a
psychopath who enjoys tortuing myself with vanilla css. We don't have anything
that transforms css in our metalsmith pipeline at the moment, so if we were to
put a scss file in source, it would appear as a regular scss file in our dist.
There are handy plugins to do this conversion for us. Similarily, we will use a
metalsmith-babel plugin to take care of translating modern js into browser
friendly js.

The examples just contain some dummy data for example purposes.

```
npm install --save metalsmith-sass metalsmith-babel
```

```js
// source/assets/app.js
const square = x => x * x;
square(123);
```

```scss
// source/assets/app.scss
body {
  pre {
    background-color: black;
    color: white;
  }
}
```

To make load them in the html I am going to add them to the layout.

```html
{{!-- layouts/blog-post.hbs --}}
<!doctype html>
<html>
  <head>
    <title>{{ title }}</title>
    <link rel="stylesheet" href="/assets/app.css">
    <script src="/assets/app.js"></script>
  </head>
  <body>
    {{{ contents }}}
  </body>
</html>
```

To enable these add the following to your main.js. These plugins do not depend
on any plugins before or after, so it does really matter where you include this
in your metalsmith call chain.

```javascript
// main.js
import Metalsmith from 'metalsmith';
import markdown from 'metalsmith-markdown';
import layouts from 'metalsmith-layouts';
import permalinks from 'metalsmith-permalinks';
import sass from 'metalsmith-sass';
import babel from 'metalsmith-babel';

Metalsmith(__dirname)
  .source('./source')
  .destination('./dist')
  .clean(false)

  .use(markdown())
  .use(permalinks())
  .use(layouts())

  .use(sass()) // converts scss -> css
  .use(babel()) // converts modern js -> classic js

  .use(debug())

  .build((err) => {
    if (err) throw err;
  });
```

From this point you have a prety solid setup to create your html pages. Every
new blog post can easily created adding another markdown file and rebuilding.
Add in another layout for your main page and you have yourself a website! If
you want help making this site not look like trash, you're going to probably
have to do what I am about to do and spend hours tweaking it. 

### Indexes Using Collections

## Production Build

Sometimes you want to include things in your html that is only meant for
production. _cough cough Google Analytics cough cough_ Using if statements in
handlebars and providing an metadata flag in metlasmith will easily allow us to
only inlcude things only meant for production production build.

Metalsmith has a metadata method that provides each file with arbitrary
information. We can use this to include a flag that indicates if we are in a
production build.

```javascript
// main.js
import Metalsmith from 'metalsmith';
import markdown from 'metalsmith-markdown';
import layouts from 'metalsmith-layouts';
import permalinks from 'metalsmith-permalinks';
import sass from 'metalsmith-sass';
import babel from 'metalsmith-babel';

const production = process.env.NODE_ENV === 'production';

Metalsmith(__dirname)
  .source('./source')
  .destination('./dist')
  .clean(false)

  .metadata({ production }) // adds { producion: true } in metadata of
                            // all files during production builds
  .use(markdown())
  .use(permalinks())
  .use(layouts())

  .use(sass())
  .use(babel())

  .build((err) => {
    if (err) throw err;
  });
```
I am going to modify the build script in `package.json` a bit to include the
environment. The watch script will build the project for development, and the
build script will produce the final output.

```
"build": "NODE_ENV=production babel-node main.js",
```

### Adding Production HTML

In our layout we can wrap our google analyitcs tag in an if statment

```
{{!-- layouts/blog-post.hbs --}}
    {{#if production}}
    <div>GOOOOOOGLE ANNNNNNNALYITCS</div>
    {{/if}}
```

Now running an `npm run build` will mark that it is a production build.

## Deployment

There are plenty of great ways to deploy a static site. Honestly, you should
probably just deploy it using [Netlify](https://www.netlify.com) #not-an-ad.
It's free for one user and if you are only running the static pages created
here its probably worth saving yourself the headache of administering your own
setup. I was going to try to self host this blog, but netlify looks pretty
great and I am going to use that instead.


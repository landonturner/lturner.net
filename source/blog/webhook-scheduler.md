---
title: Webhook Scheduler
layout: blog-post.hbs
date: 2019-03-25
displayDate: March 25, 2019
collection: blog
description: The Webhook Scheduler is a project that calls a remote endpoint when a scheduled event occurs. It is a complete front end and backend api that allows persistence between runs and user authentication. The backend api is written in golang and the frontend vue.
---

## Purpose

Recently I had a use case for a service that would call out to a remote
webhook early in the morning. Before this service was made, someone on my
team would have to wake up, log on, push a button, go back to sleep. I like
my sleep, so I created this a webhook scheduler. This repo could be easily
adapted to run any code. You can sorta think about it as a web cron, but
less periodic in nature. The GitHub for this project is located
[here](https://github.com/landonturner/scheduler).

![scheduler screen shot](/images/webhook-scheduler-main.png)

![scheduler screen shot](/images/webhook-scheduler-new.png)

## Technology Choices

### Frontend
I used [vue](https://vuejs.org) + [vuetify](https://vuetifyjs.com/en/) as the
front end. I chose vue because I have a bit of experience with it and wanted
a bit more given that it has been [blowing up
lately](https://twitter.com/vuejs/status/1108985101436637185). Overall vue
has felt very simple to use and configure. There were a few things I
discovered this time around that really blew me away (proxy support) in the
dev server.

The `vue-client-service` that is configured automatically when using `vue
create` is a very powerful and simple tool. You can easily proxy the api as I
have in the vue.config.js file which removes cross domain concerns when in
development.

I wanted this to be a totally self-contained app. The front end builds static
files into the `/dist` folder and can be served as regular files. The only
catch is that in order to not trip CORS policies, they must be served from
the same domain as the api server. I chose to serve them directly through the
api server itself, however, the same end can be achieved with apache or nginx
using a proxy for the api.

### Backend
The backend is written entirely in [golang](https://golang.org). The server
runs the api, checks for schedules and executes the webhook call, and also
serves all frontend files. I am relatively new to golang, and this project
was an exploration for me in many ways.

The persistence layer is a simple sqlite3 database that is saved in the
current working directory. As with anything, there are improvements to be
made here, but it got the job done and done quickly; sqlite3 is so easy.
Thanks to [the fantastic ORM library gorm](https://gorm.io), this could
easily be adapted to a different data source.

It is important that the index.html is served instead of a 404. For example,
if a user navigates to `localhost:1337/blabla` it should allow vue to handle
the 404 message. This allows the front end to make pathing decisions. It also
enables the use of back and forward buttons. I did a bit of digging into the
the File Server internals and found a way to shortcut the not found route.

### Authentication
I have chosen to use [JWT](https://jwt.io)s to secure the user session. On a
successful login, the browser saves the JWT in local storage. On every api
call, it is sent in the Authorization header as a bearer token. This works
well for me with this small project.

There are a few advantages of using JWTs instead of other auth methods (and a
few drawbacks as well). I chose it here for a couple of reasons (one of which
turned out to not matter at all).

First, it is completely stateless - the trust on a JWT is generated from the
cryptographic signature attached to the token itself rather than checking a
data store for a session. There are security concerns here for when a token is
compromised and needs to be revoked. There are many ways to handle that
scenario but all workarounds I know of involve a database hit (which makes it
not so stateless).

The second reason was that I needed to be able to send the token across
domains. When running in development I thought that I would have to send the
token from the front localhost:8080 (vue server) to localhost:1337 (api).
This ended up not being a valid reason as soon as I discovered how to proxy
the api server in the file `client/vue.config.js`.

A downside is they can be a little annoying to deal with the token on the
frontend. There isn't really a standard way to do this. Cookies save and send
themselves automatically (typically used with sessions). I stored the JWT in
local storage and add it as the header in the HTTP call.

## Closing Thoughts
This very simple app has saved us a lot of time already with our early
morning deploys. It's simple but secure. I might take this as a starting off
point for a different project. I do like how serving the client from the api
turned out.

I enjoyed the Golang styling and syntax. I didn't mention it in the writeup,
but the testing was simple and fluid. I'm sure there are better more DRY ways
of doing the testing, and if this were a larger project, I would have spent
more time exploring different testing environments. I will be spending more
time in go, hopefully creating more than simple APIs. The gorilla HTTP
utilities were easy to configure and use.

The front end is very simple, but Vue was easy to get running and configure.
The defaults were almost perfect for this use-case.

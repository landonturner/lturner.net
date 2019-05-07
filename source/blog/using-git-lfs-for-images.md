---
title: Using Git LFS For Reducing Large Repo Size
layout: blog-post.hbs
date: 2019-04-01
displayDate: April 1, 2019
collection: blog
description: Our main website repository was ballooning out of control. Frequently we were experiencing troubles with Bitbucket's hard 2GB limit. We switched to LFS and it was all good
---

## Notes

```
Size: 1.2 GB
LFS: 0 bytes of space used.
```

WHAT IM DOIN

```bash
brew install git-lfs
```

forked the repo so i don't break nothin

```
cd content
git lfs install
git lfs track '*.png'
git lfs track '*.gif'
git lfs track '*.jpg'
git lfs track '*.jpeg'
git lfs track '*.pdf'

git add .
git commit -m 'Use git-lfs'
git push
```

NOW WE WAIT
`Uploading LFS objects:  10% (750/7635), 109 MB | 923 KB/s`

```
Size: 1.2 GB
LFS: 947.8 MB of space used.
```

Dang the size is still large. I bet its reflected in the git history.

Squashing HIstory - YUCK

STARTING OVER. Creating new git repo actually

```
rm -rf .git
git init
git add .
git commit -m 'Initial commit. Adding LFS support'
git remote add origin git@bitbucket.org:maprtech/content-lfs-test.git
git push -u origin master
```

```
Size: 13.1 MB
LFS: 947.8 MB of space used.
```

CLONING THE REPO FRESH WITH IMAGES

```
rm -rf content-lfs-test/
git lfs install # if you are on a different machine
git clone git@bitbucket.org:maprtech/content-lfs-test.git
```

badda boom badda bing. everyone commiting needs to run the install.

# lturner.net blog

Hello! This is the code that runs lturner.net.

## How To Run

#### Production Build
```bash
npm run build
```

#### Development Mode
```bash
docker-compose up -d
npm run watch
```

### Project Structure

Put markdown files in `/source/blog`. Those get turned into blog posts. The
site will be built into the `dist` folder. Any asset or image gets copied into
that folder as well. (JS and SASS will be transformed). Have fun!

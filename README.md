# lturner.net blog

Hello!

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
that folder as well. (JS and SASS will be transformed).

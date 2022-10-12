# Food Tracker

View the app at https://food.jennybelanger.com/

## Development

### Requirements

- [Git](https://git-scm.com/)
- [Yarn](https://classic.yarnpkg.com/en/docs/install)

### Setup

First, setup the [Food API](https://github.com/jlbelanger/food-api).

``` bash
# Clone the app repo
git clone https://github.com/jlbelanger/food-app.git
cd food-app

# Configure the environment settings
cp .env.example .env
cp .env.example .env.production
cp cypress.env.example.json cypress.env.json

# Install dependencies
yarn install
```

### Run

``` bash
yarn start
```

Your browser should automatically open http://localhost:3000/

### Lint

``` bash
yarn lint
```

### Test

``` bash
yarn test:cypress
```

### Generate splash screens

``` bash
npx pwa-asset-generator public/favicon.svg ./public/img/splash --background "#f9f9f9" --splash-only --type png --portrait-only --padding "35%"
```

## Deployment

Note: The deploy script included in this repo depends on other scripts that only exist in my private repos. If you want to deploy this repo, you'll have to create your own script.

``` bash
./deploy.sh
```

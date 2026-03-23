name: Post New Shop Items to Facebook

on:
  push:
    branches: [ main ]
    paths:
      - 'shop-items.js'

jobs:
  post-new-items:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repo (with history)
        uses: actions/checkout@v4
        with:
          fetch-depth: 2

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm install node-fetch@2

      - name: Find new items and post to Facebook
        env:
          FB_PAGE_ID:    ${{ secrets.FB_PAGE_ID }}
          FB_PAGE_TOKEN: ${{ secrets.FB_PAGE_TOKEN }}
          SHOP_URL:      ${{ secrets.SHOP_URL }}
        run: node .github/Scripts/post-new-items.js

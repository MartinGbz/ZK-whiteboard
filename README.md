# ZK-whiteboard

## Express yourself freely & anonymously without bots spamming

ZK-whiteboard is a platform for creating whiteboards: spaces where each member of a specific group can post a single message. Messages are anonymous. No link can be done between messages of a same author on different whiteboards.

ZK-whiteboard is an app built using [Sismo](https://github.com/orgs/sismo-core/repositories?type=all). The Sismo Data Vault allows you to prove that you have met specials requirements written above without disclosing the address(es) you used. It also allows to create an anonymous user id to post anonymous messages among all whiteboards.

To use ZK-whiteboard you will need to created a Sismo Data Vault. More information on Sismo [here](https://www.sismo.io/).

**The app is live on [zk-whiteboard.xyz](https://www.zk-whiteboard.xyz/)**

## Project Usage

### Install dependencies

```bash
# install frontend / backend dependencies
yarn
```

### Set your PostgreSQL databse url

```bash
cp .example.env .env
# set the DATABASE_URL variable with your own databse url in the freshly created .env file
source .env
```

### Start the app

```bash
# this will start your Next.js app
# the frontend is available on http://localhost:3000/
# it also starts a local backend

npm run dev
# or
yarn dev
# or
pnpm dev
```

Then, the app will be running on http://localhost:3000.

# ZK-whiteboard

## Express yourself freely & anonymously without bots spamming.

ZK-whiteboard is a space where each member of a specific group can post a single message. Messages are anonymous.

Currently, the ZK-whiteboard app can be used by anyone who owns:

- An [ENS](https://ens.domains/fr/)
- A [Gitcoin Passport](https://passport.gitcoin.co/#/)

ZK-whiteboard is an app built using [Sismo](https://github.com/orgs/sismo-core/repositories?type=all). The Sismo Data Vault allows you to prove that you have met the 2 requirements written above without disclosing the address(es) you used.

To use ZK-whiteboard you will need to created a Sismo Data Vault. More information on Sismo [here](https://www.sismo.io/).

## Usage

### Install dependencies

```bash
# install frontend / backend dependencies
yarn
```

### Set your PostgreSQL databse url

```bash
cp .example.env .env
# set the DATABASE_URL variable with your own databse url in the freshly created .env file
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

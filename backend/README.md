# Notespot backend

Backend API built with Express.js, TypeScript, MongoDB, integrated with Clerk for authentication and AWS S3 for file storage.

## Getting Started

Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

Next, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

### Deploying to EC2

1. Create a new EC2 (Ubuntu) instance with a login key pair

2. SSH into the instance using the private key file for the login key pair from above

```bash
ssh -i <path-to-private-key-file> <username>@<public-dns-name>
```

3. Install Node.js and PM2

https://nodejs.org/en/download

```bash
# Update the package list and upgrade the system
sudo apt-get update
sudo apt-get upgrade -y

# Download and install nvm:
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash

# instead of restarting the shell to use nvm, run the following command
\. "$HOME/.nvm/nvm.sh"

# Download and install Node.js :
nvm install 22

# Verify the Node.js version:
node -v # Should print "v22.17.1".
nvm current # Should print "v22.17.1".

# Verify npm version:
npm -v # Should print "10.9.2".

# Install PM2 globally:
npm install -g pm2

# Configure PM2 to start on system boot
pm2 startup

# run the command which appears after running the above command

# Start the server
pm2 start dist/index.js --name notespot-backend

# save the current PM2 process list
pm2 save
```

3. Clone the repository

```bash
git clone https://github.com/LaeekAhmed/Notespot.git
mv Notespot notespot-backend
cd notespot-backend
git pull origin main
```

4. Install dependencies

```bash
npm ci
```

5. Build the project

```bash
npm run build
```

6. Restart the server with PM2 if not already running

```bash
pm2 restart notespot-backend || pm2 start dist/index.js --name notespot-backend 
```



# Mysten-Labs-SuiChat

## Steps to Set Up and Run the Application

### Compatibility Notice
This application currently only officially supports MacOS 13 and later, which is what this guide targets. It may work on other operating systems, but it has not been tested on them and support will not be offered for them as of now.

This application is designed to run on Chrome with the Suiet Sui Wallet extension. It may not function as expected on other browsers or without the extension.

Currently SuiChat web interface can only be used on localhost on the machine running the server.

### Prerequisites
- Homebrew must be installed. Instructions can be found on the homebrew website here https://brew.sh/
### 1. Install Sui
Install Sui on your local device:  

`brew install sui`

Or follow the instructions in the [Sui documentation](https://docs.sui.io/guides/developer/getting-started).

### 2. Generate a Sui Address
Once Sui is installed, run the following command in your terminal to generate a new address:

'sui client'

- Use the ed25519 keypair scheme if prompted.
- **Record the secret recovery phrase for future use in Step 8**.

To view your address later:

`sui client addresses` 

More information in the [Sui Documentation](https://docs.sui.io/guides/developer/getting-started/get-address)

Note that the currently the sui client active address needs to be the address you want to use in SuiChat. 
For free use of sui chat use the sui test net to use the service for free testing purposes. This is not recommended for real use of suichat

### 3. Get Sui Tokens
Run the faucet command to get tokens:

`sui client faucet`

- The faucet may limit requests to a few times per minute.
- It might take a moment for the tokens to appear in your account.
  
### 4. Pull the Code
Clone the repository containing the application code.

`git clone git@github.com:bwr02/Mysten-Labs-SuiChat.git`

### 5. Install Node
If you don't have Node installed or the node package mannager (npm), run:

`brew install node`

### 6. Install Yarn v1.22.22
If you don't have Yarn installed, run:

`npm install --global yarn`

More information on installing Yarn in the [documentation](https://classic.yarnpkg.com/lang/en/docs/install/#mac-stable)

This project is designed to be used with Yarn v1.22.22 and may not work with other versions. Use:

`yarn --version`

To ensure you have the correct version.

### 5. Install pnpm
If you don't have pnpm installed run:

`npm install -g pnpm`

### 7. Run the API
Navigate to the API folder from the top directory:

`cd api`

Install dependencies and start the server:

`yarn install`

setup the api's database:

`yarn db:setup:dev`

Note if the database fails due to a migration you may have to delete the folder starting with 2024 in the migrations folder and run the command again.

When the api is running it will display prisma queryies and that terminal will be dedicated to the api.
To run the api use:

`yarn dev`

If you ever need to reset the database, run:

`yarn db:reset:dev`

### 8. Run the Frontend
In a separate terminal, navigate to the frontend folder from the top directory:

`cd frontend`

Install dependencies and start the development server:

`yarn install`

`yarn dev`

Open the application at [http://localhost:5173/](http://localhost:5173/).

**Note:** Use Chrome for compatibility with required extensions.

### 9. Connect Wallet
- Click "Connect Wallet" in the application.
- Follow the instructions to install the Suiet Sui Wallet extension from the [Chrome Web Store](https://chromewebstore.google.com/detail/suiet-sui-wallet/khpkpbbcccdmmclmpigdgddabeilkdpd
).
- The connect wallet button will give you the option to download Suiet from the Chrome Web Store. However if using this option you must reload SuiChat after installing the extension.
- When connecting the wallet:
  - Select Suiet.
  - Import Wallet (Using Recovery Phrase).
  - Use the secret recovery phrase from Step 2 to recover your account.
  - Ensure the wallet is set to operate on testnet, not mainnet.

### 10. Send a Message
- Click the address book icon next to the SuiChat header.
- Enter the recipient's address (examples below):
  - **Ashton**: `0x69807a150b291e82423fe41024e7453da050dd0809fbbaaa3cd87c651b66432c`
  - **Ben**: `0x7b8946c19220c8914ee5b5287e9e06cb735d1a3cc783cc6c7c4d47072735b2d0`
  - **Sophia**: `0xcb4634806b80bfc969935294391fa38169b42da5d66303b2710d93af101c9509`
- After entering the message, click Send.
- Approve the transaction in the Chrome extension.
- 
### 11. View Local Database
To view changes in the database:

Navigate to the API directory from top directory:

`cd api`

Open the database studio:

`yarn db:studio`

This will launch a browser window displaying the database contents. Refresh the page to see new messages.

# WhatsApp Chatbot Integration Guide

This guide will help you connect your local "Commercial Engine" to a real WhatsApp number using the Meta (Facebook) Cloud API.

### Prerequisites
1.  **Meta Developer Account**: [developers.facebook.com](https://developers.facebook.com/)
2.  **Ngrok**: A tool to expose your localhost to the internet. [Download Ngrok](https://ngrok.com/download)

---

### Step 1: Start Ngrok
WhatsApp needs a public URL to send messages to. Since you are running on `localhost`, we use Ngrok.

1.  Open a terminal.
2.  Run: `ngrok http 3000`
3.  Copy the **Forwarding URL** (looks like `https://a1b2-c3d4.ngrok-free.app`).

### Step 2: Create Meta App
1.  Go to [Meta For Developers](https://developers.facebook.com/apps/).
2.  Click **Create App** -> Select **Other** -> Select **Business**.
3.  Give it a name (e.g., "BOQ Bot").
4.  On the dashboard, look for **WhatsApp** and click **Set up**.

### Step 3: Configure Webhook
1.  In the WhatsApp settings (left sidebar), click **Configuration**.
2.  Find the **Webhook** section and click **Edit**.
3.  **Callback URL**: Paste your Ngrok URL + `/api/webhook/whatsapp`
    *   Example: `https://a1b2-c3d4.ngrok-free.app/api/webhook/whatsapp`
4.  **Verify Token**: Enter `my_secure_token_123` (or whatever you changed it to in the code).
5.  Click **Verify and Save**.
6.  Click **Manage** under Webhook fields, and subscribe to `messages`.

### Step 4: Get Credentials
1.  Go to **API Setup** in the WhatsApp sidebar.
2.  Copy these values and add them to your `.env` file in the project:

```env
# Bottom of your .env file
WHATSAPP_TOKEN="Variables from Meta Dashboard (Temporary Access Token)"
WHATSAPP_PHONE_ID="Phone Number ID (Under Send and Receive messages)"
WHATSAPP_VERIFY_TOKEN="my_secure_token_123"
```

### Step 5: Test It!
1.  Add your personal phone number to the **"To"** field in the API Setup page (Test Number section).
2.  Send a message from your phone to the test number provided by Meta.
3.  Type a Part Code (e.g., the ones in your Excel).
4.  The bot should reply!

---

**Note**: The "Temporary Access Token" expires in 24 hours. for permanent use, you need to create a System User in Meta Business Suite, but this is perfect for testing.

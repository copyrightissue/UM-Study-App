### ** Generate the JSON File**
1. Go to **[Firebase Console](https://console.firebase.google.com/)**
2. Select your Firebase project.
3. Click on the **⚙️ Gear icon (Project Settings)** in the top left.
4. Navigate to the **"Service accounts"** tab.
5. Click **"Generate new private key"** (this downloads a JSON file).
6. Move this file into the `functions/` directory.

### ** Secure the JSON File**
- **DO NOT commit this file to Git!** Add it to `.gitignore`
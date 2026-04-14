Development notes

- Disable native OTA updates during local development: `app.json` has `"updates": { "enabled": false }` to avoid native update checks blocking startup.

- Environment / Firebase: copy `.env.example` to `.env` and fill the values (do not commit secrets).

- Helpful scripts (run from project root):

```bash
npm run start
npm run android
npm run ios
npm run web
npm run lint
npm run tsc
npm run format
```

- Start Expo with cleared cache:

```bash
npx expo start -c
```

- If you hit the native "Failed to download remote update" error again, uninstall Expo Go from the device and reinstall from Play Store to clear cached update state.

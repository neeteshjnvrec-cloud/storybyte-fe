import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyBYjLWuyXiPuXMo7BVyqcDBv45uv4AeRhI",
  projectId: "storybytes-e7576",
  storageBucket: "storybytes-e7576.firebasestorage.app",
  appId: "1:863084826254:android:046054bef7172e20c143df"
};

const app = initializeApp(firebaseConfig);

let analytics = null;

// Only initialize analytics if supported (web only)
isSupported().then(yes => {
  if (yes) {
    analytics = getAnalytics(app);
  }
}).catch(() => {
  console.log('Analytics not supported');
});

export { app, analytics };

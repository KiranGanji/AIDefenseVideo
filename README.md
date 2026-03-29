## Run the remotion studio
npx remotion studio src/index.jsx

## Render the remotion video
npx remotion render src/index.jsx AIDefenseVideo out/video_v2.mp4 --muted


## Render only part of the video
npx remotion render AIDefenseVideo out/scene6.mp4 --frames=3750-4649 --muted
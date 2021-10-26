# Twitch Chat Replay

A static site that recreates twitch chat next to a youtube video, hosted at https://clickityclack.co.uk

### Running the project locally

In the project directory, run `npm start`. This will run the app in development mode

Open [http://localhost:3000](http://localhost:3000) to view it in the browser. It will auto-reload on any change.

#### Testing the chat locally

Chat files should be placed in `public/videos`. Due to their size, these are not included in the repo with the exception of `1087079172.json`, which is provided for testing purposes.

The link to view the video + chat for this file is:

http://localhost:3000/?youtubeId=cMWFYamc4xk&twitchId=1087079172

If you want to download other chat files for testing, you should be able to pull them from https://clickityclack.co.uk for Northernlion vods. Alternatively, you can download them directly from twitch using [Twitch Chat Downloader](https://github.com/PetterKraabol/Twitch-Chat-Downloader), with the command `tcd --format json --video <video-id>`

### Contributing

Contributions are very welcome! I'll do my absolute best to review them in good time.

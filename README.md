# NASA Space Explorer

NASA Space Explorer is a web app that uses NASA's Astronomy Picture of the Day (APOD) API to display space images and videos for a selected date range.

## Features

- Select a start and end date
- Fetch APOD entries from NASA's API
- Display results in a responsive gallery
- Show a random "Did You Know?" space fact on page load
- Open each gallery item in a modal with full details
- Handle both image and video APOD entries
- Show a loading message while data is being fetched
- Add a hover zoom effect for gallery images

## Project Structure

```text
.
├── index.html
├── style.css
├── img/
│   ├── NASA-Logo-Large.jpg
│   └── nasa-worm-logo.png
└── js/
    ├── dateRange.js
    └── script.js
const API_KEY = 'NmlTioVbt5vhwMJhyi4d0xHrDDLvx5qs3Lzo52AY';
const APOD_URL = 'https://api.nasa.gov/planetary/apod';

const spaceFacts = [
  'A day on Venus is longer than a year on Venus.',
  'Neutron stars can spin at hundreds of times per second.',
  'The footprints left on the Moon can last for millions of years.',
  'Jupiter is so large that more than 1,300 Earths could fit inside it.',
  'A spoonful of material from a neutron star would weigh billions of tons on Earth.',
  'The Sun contains more than 99 percent of the mass in our solar system.',
  'Saturn would float in water because its average density is lower than water.',
  'One million Earths could fit inside the Sun.',
  'Mars has the tallest volcano in the solar system: Olympus Mons.',
  'There are more stars in the observable universe than grains of sand on Earth.'
];

const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');
const fetchButton = document.getElementById('fetchButton');
const gallery = document.getElementById('gallery');
const statusMessage = document.getElementById('statusMessage');
const factElement = document.getElementById('spaceFact');

const modal = document.getElementById('imageModal');
const modalBackdrop = document.getElementById('modalBackdrop');
const closeModalButton = document.getElementById('closeModalButton');
const modalMediaWrapper = document.getElementById('modalMediaWrapper');
const modalDate = document.getElementById('modalDate');
const modalTitle = document.getElementById('modalTitle');
const modalExplanation = document.getElementById('modalExplanation');
const modalLink = document.getElementById('modalLink');

setupDateInputs(startInput, endInput);
displayRandomFact();

fetchButton.addEventListener('click', fetchSpaceImages);
closeModalButton.addEventListener('click', closeModal);
modalBackdrop.addEventListener('click', closeModal);
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !modal.classList.contains('hidden')) {
    closeModal();
  }
});
window.addEventListener('load', fetchSpaceImages);

async function fetchSpaceImages() {
  const startDate = startInput.value;
  const endDate = endInput.value;

  if (!startDate || !endDate) {
    showStatus('Please select both a start date and an end date.', true);
    gallery.innerHTML = createPlaceholderMarkup('Please select valid dates to load APOD entries.');
    return;
  }

  if (new Date(startDate) > new Date(endDate)) {
    showStatus('The start date cannot be later than the end date.', true);
    gallery.innerHTML = createPlaceholderMarkup('Your selected date range is invalid.');
    return;
  }

  const requestUrl = `${APOD_URL}?api_key=${API_KEY}&start_date=${startDate}&end_date=${endDate}`;

  try {
    setLoadingState(true);
    showStatus('🔄 Loading space photos...');
    gallery.innerHTML = createPlaceholderMarkup('Loading space photos...');

    const response = await fetch(requestUrl);

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const data = await response.json();

    if (!Array.isArray(data) || data.length === 0) {
      gallery.innerHTML = createPlaceholderMarkup('No space images were found for that date range.');
      showStatus('No results were returned. Try a different date range.', true);
      return;
    }

    const sortedItems = data.sort((a, b) => new Date(b.date) - new Date(a.date));
    renderGallery(sortedItems);
    showStatus(`Loaded ${sortedItems.length} APOD ${sortedItems.length === 1 ? 'entry' : 'entries'} from ${formatDate(startDate)} to ${formatDate(endDate)}.`);
  } catch (error) {
    console.error('Error fetching APOD data:', error);
    gallery.innerHTML = createPlaceholderMarkup('Something went wrong while loading NASA data. Please try again.');
    showStatus('Unable to load NASA images right now. Check your connection and try again.', true);
  } finally {
    setLoadingState(false);
  }
}

function renderGallery(items) {
  gallery.innerHTML = '';

  items.forEach((item) => {
    const card = document.createElement('article');
    card.className = 'gallery-item';

    const mediaContainer = document.createElement('button');
    mediaContainer.type = 'button';
    mediaContainer.className = 'media-button';
    mediaContainer.setAttribute('aria-label', `Open details for ${item.title}`);

    if (item.media_type === 'image') {
      const image = document.createElement('img');
      image.className = 'gallery-media';
      image.src = item.url;
      image.alt = item.title;
      image.loading = 'lazy';
      mediaContainer.appendChild(image);
    } else {
      mediaContainer.innerHTML = `
        <div class="video-link-card">
          <div class="video-link-inner">
            <div class="video-icon">🎬</div>
            <p class="video-link-text">Video APOD — click to view details</p>
          </div>
        </div>
      `;
    }

    mediaContainer.addEventListener('click', () => openModal(item));

    const content = document.createElement('div');
    content.className = 'gallery-content';

    const date = document.createElement('p');
    date.className = 'gallery-date';
    date.textContent = formatDate(item.date);

    const badge = document.createElement('span');
    badge.className = 'media-badge';
    badge.textContent = item.media_type === 'video' ? 'Video' : 'Image';

    const title = document.createElement('h2');
    title.className = 'gallery-title';
    title.textContent = item.title;

    const description = document.createElement('p');
    description.className = 'gallery-description';
    description.textContent = truncateText(item.explanation, 140);

    content.append(date, badge, title, description);

    if (item.media_type === 'video') {
      const link = document.createElement('a');
      link.className = 'media-link';
      link.href = item.url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = 'Open Video';
      content.appendChild(link);
    }

    card.append(mediaContainer, content);
    gallery.appendChild(card);
  });
}

function openModal(item) {
  modalMediaWrapper.innerHTML = '';
  modalDate.textContent = formatDate(item.date);
  modalTitle.textContent = item.title;
  modalExplanation.textContent = item.explanation;

  if (item.media_type === 'image') {
    const image = document.createElement('img');
    image.src = item.hdurl || item.url;
    image.alt = item.title;
    modalMediaWrapper.appendChild(image);
    modalLink.classList.add('hidden');
  } else {
    const frame = document.createElement('iframe');
    frame.src = item.url;
    frame.title = item.title;
    frame.allowFullscreen = true;
    modalMediaWrapper.appendChild(frame);

    modalLink.href = item.url;
    modalLink.textContent = 'Open original video';
    modalLink.classList.remove('hidden');
  }

  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('no-scroll');
}

function closeModal() {
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden', 'true');
  modalMediaWrapper.innerHTML = '';
  document.body.classList.remove('no-scroll');
}

function displayRandomFact() {
  const randomIndex = Math.floor(Math.random() * spaceFacts.length);
  factElement.textContent = spaceFacts[randomIndex];
}

function showStatus(message, isError = false) {
  statusMessage.textContent = message;
  statusMessage.style.color = isError ? '#ffb4b4' : '#dce5ff';
}

function setLoadingState(isLoading) {
  fetchButton.disabled = isLoading;
  fetchButton.textContent = isLoading ? 'Loading...' : 'Get Space Images';
}

function formatDate(dateString) {
  return new Date(`${dateString}T00:00:00`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function truncateText(text, maxLength) {
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength).trim()}...`;
}

function createPlaceholderMarkup(message) {
  return `
    <div class="placeholder">
      <div class="placeholder-icon">🚀</div>
      <p>${message}</p>
    </div>
  `;
}
import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const form = document.querySelector('.search-form');
const gallery = document.querySelector('.gallery');
const loadMoreBtnEl = document.querySelector('.load-more');

let currentPage = 1;
let searchQuery = null;
let lightbox = new SimpleLightbox('.gallery a', {
  captions: true,
  captionsData: 'alt',
  captionDelay: 250,
});

form.addEventListener('submit', handlerSubmitform);
loadMoreBtnEl.addEventListener('click', handlerLoadMoreBtn);

// Шукаємо картинки

function fetchImage(value, page) {
  const URL = 'https://pixabay.com/api/';
  const KEY = '35069278-a919d6c36aed6148f5a573eb5';
  const searchEl = `?key=${KEY}&q=${value}&image_type=photo&orientation=horizontal&safesearch=true&per_page=40&page=${page}`;

  return axios.get(`${URL}${searchEl}`);
}

// Створення розмітки

function createMarkup(data) {
  let markupPost = data
    .map(
      ({
        largeImageURL,
        webformatURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => {
        return `<a class="photo-card" href="${largeImageURL}">
  <img src="${webformatURL}" alt="${tags}" loading="lazy" />
  <div class="info">
    <p class="info-item">
      <b>Likes</b></br>${likes}
    </p>
    <p class="info-item">
      <b>Views</b></br>${views}
    </p>
    <p class="info-item">
      <b>Comments</b></br>${comments}
    </p>
    <p class="info-item">
      <b>Downloads</b></br>${downloads}
    </p>
  </div>
</a>`;
      }
    )
    .join('');

  gallery.insertAdjacentHTML('beforeend', markupPost);
}

// Сабміт форми

function handlerSubmitform(e) {
  e.preventDefault();
  clearForm();
  searchQuery = e.currentTarget.searchQuery.value;
  fetchImage(searchQuery, currentPage)
    .then(response => {
      if (response.data.hits.length === 0) {
        Notiflix.Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
        return;
      }

      createMarkup(response.data.hits);
      lightbox.refresh();

      if (response.data.hits.length === 40) {
        loadMore();
      }
      return response.data;
    })
    .catch(console.warn);
}

// Клік Load More

function handlerLoadMoreBtn(e) {
  e.preventDefault();

  fetchImage(searchQuery, currentPage)
    .then(response => {
      createMarkup(response.data.hits);
      lightbox.refresh();
// Додаємо прокрутку
      const { height: cardHeight } =
        gallery.firstElementChild.getBoundingClientRect();
      window.scrollBy({
        top: cardHeight * 2,
        behavior: 'smooth',
      });

      const totalPage = response.data.totalHits / 40;

      if (totalPage <= currentPage) {
        loadMoreBtnEl.classList.add('hidden');
        Notiflix.Notify.success(
          "We're sorry, but you've reached the end of search results."
        );

        return response.data;
      }

      currentPage += 1;
    })
    .catch(console.error());
}

// Очищуємо форму

function clearForm() {
  gallery.innerHTML = '';
  currentPage = 1;
  searchQuery = null;
  loadMoreBtnEl.classList.add('hidden');
}

// Завнтажити більше

function loadMore() {
  currentPage += 1;
  loadMoreBtnEl.classList.remove('hidden');
}

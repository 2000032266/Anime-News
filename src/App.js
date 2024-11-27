import React, { useState, useEffect } from 'react';
import './App.css'; 
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('');
  const [genre, setGenre] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    fetchAnimeNews();
  }, [currentPage, filter, genre, searchQuery]);

  const fetchAnimeNews = async () => {
    setLoading(true);
    try {
      let url = `https://api.jikan.moe/v4/anime?page=${currentPage}&limit=${ITEMS_PER_PAGE}`;
      if (filter) url += `&type=${filter}`;
      if (genre) url += `&genre=${genre}`;
      if (searchQuery) url += `&q=${searchQuery}`;

      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
      const data = await response.json();

      const newsItems = data.data.map((anime) => ({
        title: anime.title,
        synopsis: anime.synopsis || 'No description available.',
        imageUrl: anime.images.jpg.large_image_url,
        url: anime.url,
        airing: anime.aired.string || 'Unknown',
      }));

      setNewsList(newsItems);
      setTotalPages(Math.ceil(data.pagination.items.total / ITEMS_PER_PAGE));
      setError(null);
    } catch (err) {
      console.error('Error fetching news:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchAnimeNews();
  };

  const handleGenreChange = (e) => {
    setGenre(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (direction) => {
    if (direction === 'next' && currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    } else if (direction === 'prev' && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="container mt-5">
      <h1> Anime News</h1>

      {/* Search, Filter, and Genre Section */}
      <div className="mb-4 filter-pagination">
        <form onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search anime..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>
        <div className="d-flex gap-3">
          <select value={filter} onChange={handleFilterChange}>
            <option value="">All Types</option>
            <option value="TV">TV</option>
            <option value="Movie">Movie</option>
            <option value="OVA">OVA</option>
            <option value="Special">Special</option>
          </select>
          <select value={genre} onChange={handleGenreChange}>
            <option value="">All Genres</option>
            <option value="Action">Action</option>
            <option value="Adventure">Adventure</option>
            <option value="Fantasy">Fantasy</option>
            <option value="Romance">Romance</option>
          </select>
        </div>
      </div>

      {/* Display News */}
      {loading ? (
        <div className="spinner-border text-primary" role="status"></div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : (
        <div className="row">
          {newsList.map((news, index) => (
            <div key={index} className="col-12 col-md-6 col-lg-4">
              <div className="card mb-4">
                <img
                  src={news.imageUrl}
                  alt={news.title}
                  className="card-img-top"
                />
                <div className="card-body">
                  <h5 className="card-title">{news.title}</h5>
                  <p className="card-text">{news.synopsis}</p>
                  <p>
                    <strong>Aired:</strong> {news.airing}
                  </p>
                  <a href={news.url} target="_blank" rel="noopener noreferrer">
                    Read More
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="pagination-buttons mt-4">
        <button
          onClick={() => handlePageChange('prev')}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <button
          onClick={() => handlePageChange('next')}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default App;

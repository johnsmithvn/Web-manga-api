// /src/pages/home.js

function renderSourceList(listId, keys, type) {
  const container = document.getElementById(listId);
  if (!container) return;
  container.innerHTML = "";

  keys.forEach((key) => {
    const btn = document.createElement("div");
    btn.className = "source-btn";
    btn.textContent = `📁 ${key}`;
    btn.onclick = () => {
      localStorage.setItem("sourceKey", key);
      if (type === "manga") {
        window.location.href = "/select.html";
      } else if (type === "movie") {
        window.location.href = "/movie-index.html";
      }
    };
    container.appendChild(btn);
  });
}

// Đảm bảo 2 script đã load lên window trước khi render (script inline .js nên yên tâm)
window.addEventListener("DOMContentLoaded", () => {
  renderSourceList("manga-list", window.mangaKeys || [], "manga"); // source-manga.js sẽ gán window.sourceKeys
  renderSourceList("movie-list", window.movieKeys || [], "movie");  // source-movies.js sẽ gán window.movieKeys
});



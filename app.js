const API_URL = 'http://localhost:3000'; 

const getElement = (selector) => document.querySelector(selector);
const getElements = (selector) => document.querySelectorAll(selector);

getElements('.nav-btn').forEach(button => {
    button.addEventListener('click', (e) => {
        getElements('.nav-btn').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        
        getElements('.view-section').forEach(section => section.classList.add('hidden'));
        
        const viewName = e.target.dataset.view;
        const viewElement = document.getElementById(`view-${viewName}`);
        if(viewElement) {
            viewElement.classList.remove('hidden');
            loadViewData(viewName); 
        }
    });
});

function loadViewData(view) {
    if (view === 'movies') fetchMovies();
    if (view === 'rooms') fetchRooms();
    if (view === 'sessions') fetchSessions();
    if (view === 'sales') fetchSales();
}

async function fetchMovies() {
    const list = getElement('#moviesList');
    list.innerHTML = '<p>Carregando filmes...</p>';
    
    try {
        // const res = await fetch(`${API_URL}/movies`); 
        // const data = await res.json();
        
        // MOCK PARA TESTE VISUAL (Remova isso e descomente o fetch acima quando tiver backend)
        const data = [
            { _id: '1', title: 'O Poderoso Chefão', genre: 'Drama', duration: 175, rating: '16' },
            { _id: '2', title: 'Barbie', genre: 'Comédia', duration: 114, rating: '12' }
        ];

        list.innerHTML = data.map(movie => `
            <div class="card">
                <div>
                    <h3>${movie.title}</h3>
                    <p>${movie.genre} • ${movie.duration} min</p>
                    <p>Classificação: ${movie.rating}</p>
                </div>
                <div class="card-actions">
                    <button onclick="alert('Detalhes ID: ${movie._id}')">Detalhes</button>
                    <button onclick="editMovie('${movie._id}')">Editar</button>
                    <button onclick="deleteMovie('${movie._id}')" style="color: #ff6b6b">Excluir</button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        list.innerHTML = '<p>Erro ao carregar filmes.</p>';
        console.error(error);
    }
}
     
getElement('#btnOpenMovieForm').onclick = () => {
    getElement('#movieForm').reset();
    getElement('#movieModal').classList.remove('hidden');
};

getElement('#btnCancelMovie').onclick = () => {
    getElement('#movieModal').classList.add('hidden');
};


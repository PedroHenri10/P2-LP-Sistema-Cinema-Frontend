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


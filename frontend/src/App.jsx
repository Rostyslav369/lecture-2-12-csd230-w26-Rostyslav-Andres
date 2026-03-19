import { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router'
import axios from 'axios'
import Navbar from './NavBar'
import Home from './Home'
import Book from './Book'
import BookForm from './BookForm'
import Magazine from './Magazine'
import MagazineForm from './MagazineForm'
import Cart from './Cart'
import './App.css'

// Centralized Axios Configuration
const api = axios.create({
    baseURL: '/api/rest'
});

function App() {
    const [books, setBooks] = useState([]);
    const [magazines, setMagazines] = useState([]);
    const [cartCount, setCartCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [booksRes, magsRes, cartRes] = await Promise.all([
                    api.get('/books'),
                    api.get('/magazines'),
                    api.get('/cart')
                ]);
                setBooks(booksRes.data);
                setMagazines(magsRes.data);
                setCartCount(cartRes.data.products.length);
                setLoading(false);
            } catch (err) {
                console.error("Failed to load data", err);
            }
        };
        loadInitialData();
    }, []);

    const handleAddToCart = async (productId) => {
        try {
            const res = await api.post(`/cart/add/${productId}`);
            setCartCount(res.data.products.length);
            alert("Added to cart!");
        } catch (err) {
            alert("Error adding to cart");
        }
    };

    const handleDeleteBook = async (id) => {
        if (!window.confirm("Delete book?")) return;
        await api.delete(`/books/${id}`);
        setBooks(books.filter(b => b.id !== id));
    };

    const handleUpdateBook = async (id, data) => {
        const res = await api.put(`/books/${id}`, data);
        setBooks(books.map(b => b.id === id ? res.data : b));
    };

    if (loading) return <h2>Loading Bookstore...</h2>;

    return (
        <div className="app-container">
            <Navbar cartCount={cartCount} />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/inventory" element={
                    <div className="book-list">
                        <h1>Books</h1>
                        {books.map(b => (
                            <Book key={b.id} {...b}
                                  onDelete={handleDeleteBook}
                                  onUpdate={handleUpdateBook}
                                  onAddToCart={handleAddToCart} />
                        ))}
                    </div>
                } />
                <Route path="/magazines" element={
                    <div className="magazine-list">
                        <h1>Magazines</h1>
                        {magazines.map(m => (
                            <Magazine key={m.id} {...m}
                                      onAddToCart={handleAddToCart}
                                      onDelete={(id) => api.delete(`/magazines/${id}`).then(() => setMagazines(magazines.filter(mag => mag.id !== id)))}
                                      onUpdate={(id, data) => api.put(`/magazines/${id}`, data).then(res => setMagazines(magazines.map(mag => mag.id === id ? res.data : mag)))}
                            />
                        ))}
                    </div>
                } />
                <Route path="/cart" element={<Cart api={api} onCartChange={(count) => setCartCount(count)} />} />
                <Route path="/add" element={<BookForm onBookAdded={(b) => setBooks([...books, b])} api={api} />} />
                <Route path="/add-magazine" element={<MagazineForm onMagazineAdded={(m) => setMagazines([...magazines, m])} api={api} />} />
            </Routes>
        </div>
    )
}

export default App;


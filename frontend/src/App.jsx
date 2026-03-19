import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router';
import Navbar from './NavBar';
import Home from './Home';
import Book from './Book';
import BookForm from './BookForm';
import Magazine from './Magazine';
import MagazineForm from './MagazineForm';
import Cart from './Cart';
import Login from './pages/Login';
import Logout from './pages/Logout';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { useAuth } from './provider/authProvider';
import api from './api/axiosConfig';
import './App.css';

function App() {
    const { token } = useAuth();

    const [books, setBooks] = useState([]);
    const [magazines, setMagazines] = useState([]);
    const [cartCount, setCartCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!token) {
            setLoading(false);
            return;
        }

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
            } catch (err) {
                console.error("Failed to load data", err);
            } finally {
                setLoading(false);
            }
        };

        loadInitialData();
    }, [token]);

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

        try {
            await api.delete(`/books/${id}`);
            setBooks(books.filter(b => b.id !== id));
        } catch (err) {
            alert("Error deleting book");
        }
    };

    const handleUpdateBook = async (id, data) => {
        try {
            const res = await api.put(`/books/${id}`, data);
            setBooks(books.map(b => b.id === id ? res.data : b));
        } catch (err) {
            alert("Error updating book");
        }
    };

    const handleDeleteMagazine = async (id) => {
        try {
            await api.delete(`/magazines/${id}`);
            setMagazines(magazines.filter(m => m.id !== id));
        } catch (err) {
            alert("Error deleting magazine");
        }
    };

    const handleUpdateMagazine = async (id, data) => {
        try {
            const res = await api.put(`/magazines/${id}`, data);
            setMagazines(magazines.map(m => m.id === id ? res.data : m));
        } catch (err) {
            alert("Error updating magazine");
        }
    };

    if (loading) return <h2>Loading Bookstore...</h2>;

    return (
        <div className="app-container">
            {token && <Navbar cartCount={cartCount} />}

            <Routes>
                <Route path="/login" element={<Login />} />

                <Route element={<ProtectedRoute />}>
                    <Route path="/" element={<Home />} />

                    <Route
                        path="/inventory"
                        element={
                            <div className="book-list">
                                <h1>Books</h1>
                                {books.map(b => (
                                    <Book
                                        key={b.id}
                                        {...b}
                                        onDelete={handleDeleteBook}
                                        onUpdate={handleUpdateBook}
                                        onAddToCart={handleAddToCart}
                                    />
                                ))}
                            </div>
                        }
                    />

                    <Route
                        path="/magazines"
                        element={
                            <div className="magazine-list">
                                <h1>Magazines</h1>
                                {magazines.map(m => (
                                    <Magazine
                                        key={m.id}
                                        {...m}
                                        onAddToCart={handleAddToCart}
                                        onDelete={handleDeleteMagazine}
                                        onUpdate={handleUpdateMagazine}
                                    />
                                ))}
                            </div>
                        }
                    />

                    <Route
                        path="/cart"
                        element={<Cart api={api} onCartChange={(count) => setCartCount(count)} />}
                    />

                    <Route
                        path="/add"
                        element={<BookForm onBookAdded={(b) => setBooks([...books, b])} api={api} />}
                    />

                    <Route
                        path="/add-magazine"
                        element={
                            <MagazineForm
                                onMagazineAdded={(m) => setMagazines([...magazines, m])}
                                api={api}
                            />
                        }
                    />

                    <Route path="/logout" element={<Logout />} />
                </Route>
            </Routes>
        </div>
    );
}

export default App;
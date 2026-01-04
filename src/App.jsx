import React, { useState, useEffect, useReducer, useContext, createContext } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Menu, 
  X, 
  CreditCard, 
  User, 
  LogIn, 
  Trash2, 
  CheckCircle, 
  AlertCircle, 
  Package, 
  ArrowRight, 
  Star, 
  Filter
} from 'lucide-react';

// --- MOCK DATA & TYPES ---

const PRODUCTS = [
  { id: 1, name: "Sony WH-1000XM5", price: 1499.00, category: "Audio", image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=500&q=80", rating: 4.8, reviews: 120, desc: "Wiodąca w branży redukcja hałasu i doskonała jakość dźwięku." },
  { id: 2, name: "MacBook Air M2", price: 5999.00, category: "Laptopy", image: "https://images.unsplash.com/photo-1659135890064-d57187f0946c?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", rating: 4.9, reviews: 85, desc: "Niesamowicie smukły design i nowa generacja wydajności z procesorem M2." },
  { id: 3, name: "iPhone 15 Pro", price: 5299.00, category: "Smartfony", image: "https://images.unsplash.com/photo-1710023038502-ba80a70a9f53?q=80&w=764&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", rating: 4.7, reviews: 230, desc: "Tytanowa konstrukcja. Czip A17 Pro. Nowy przycisk czynności." },
  { id: 4, name: "Herman Miller Aeron", price: 6500.00, category: "Biuro", image: "https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?auto=format&fit=crop&w=500&q=80", rating: 5.0, reviews: 40, desc: "Ikona designu biurowego. Ergonomia na najwyższym poziomie." },
  { id: 5, name: "Canon EOS R6", price: 10500.00, category: "Foto", image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=500&q=80", rating: 4.9, reviews: 65, desc: "Szybkość, jakiej potrzebujesz, by uchwycić decydujący moment." },
  { id: 6, name: "Mechanical Keyboard", price: 450.00, category: "Akcesoria", image: "https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=500&q=80", rating: 4.6, reviews: 112, desc: "Przełączniki Cherry MX Brown, podświetlenie RGB i aluminiowa obudowa." },
];

// --- STATE MANAGEMENT (REDUX PATTERN) ---

const initialState = {
  cart: [], // { product, quantity }
  user: null, // { id, name, email, orders: [] }
  isCartOpen: false,
  notifications: [], // { id, type, message }
};

const ACTIONS = {
  ADD_TO_CART: 'ADD_TO_CART',
  REMOVE_FROM_CART: 'REMOVE_FROM_CART',
  UPDATE_QUANTITY: 'UPDATE_QUANTITY',
  CLEAR_CART: 'CLEAR_CART',
  SET_USER: 'SET_USER',
  TOGGLE_CART: 'TOGGLE_CART',
  ADD_ORDER: 'ADD_ORDER',
  SHOW_NOTIFICATION: 'SHOW_NOTIFICATION',
  HIDE_NOTIFICATION: 'HIDE_NOTIFICATION'
};

function appReducer(state, action) {
  switch (action.type) {
    case ACTIONS.ADD_TO_CART: {
      const existingItem = state.cart.find(item => item.product.id === action.payload.id);
      if (existingItem) {
        return {
          ...state,
          cart: state.cart.map(item =>
            item.product.id === action.payload.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
          isCartOpen: true
        };
      }
      return {
        ...state,
        cart: [...state.cart, { product: action.payload, quantity: 1 }],
        isCartOpen: true
      };
    }
    case ACTIONS.REMOVE_FROM_CART:
      return {
        ...state,
        cart: state.cart.filter(item => item.product.id !== action.payload)
      };
    case ACTIONS.UPDATE_QUANTITY:
      return {
        ...state,
        cart: state.cart.map(item =>
          item.product.id === action.payload.id
            ? { ...item, quantity: Math.max(1, action.payload.quantity) }
            : item
        )
      };
    case ACTIONS.CLEAR_CART:
      return { ...state, cart: [] };
    case ACTIONS.SET_USER:
      return { ...state, user: action.payload };
    case ACTIONS.TOGGLE_CART:
      return { ...state, isCartOpen: !state.isCartOpen };
    case ACTIONS.ADD_ORDER:
      if (!state.user) return state;
      return {
        ...state,
        user: {
          ...state.user,
          orders: [action.payload, ...(state.user.orders || [])]
        },
        cart: []
      };
    case ACTIONS.SHOW_NOTIFICATION:
      return {
        ...state,
        notifications: [...state.notifications, { id: Date.now(), ...action.payload }]
      };
    case ACTIONS.HIDE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload)
      };
    default:
      return state;
  }
}

const AppContext = createContext();

// --- MOCK BACKEND SERVICES ---

const api = {
  login: async (email, password) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ id: 'u1', name: 'Jan Kowalski', email, orders: [] });
      }, 800);
    });
  },
  processPayment: async (paymentDetails, amount) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Symulacja walidacji - odrzuca jeśli CVC to '000'
        if (paymentDetails.cvc === '000') {
          reject(new Error("Płatność odrzucona przez bank."));
        } else {
          resolve({ transactionId: `txn_${Date.now()}`, status: 'success' });
        }
      }, 2000);
    });
  }
};

// --- COMPONENTS ---

const Button = ({ children, variant = 'primary', className = '', loading, ...props }) => {
  const baseStyle = "px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-500/30",
    secondary: "bg-white text-slate-800 border border-slate-200 hover:bg-slate-50 hover:border-slate-300",
    ghost: "text-slate-600 hover:bg-slate-100",
    danger: "bg-red-50 text-red-600 hover:bg-red-100"
  };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
      {children}
    </button>
  );
};

const Input = ({ label, error, ...props }) => (
  <div className="flex flex-col gap-1.5">
    {label && <label className="text-sm font-medium text-slate-700">{label}</label>}
    <input 
      className={`px-4 py-2.5 rounded-lg border ${error ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:ring-indigo-200 focus:border-indigo-500'} outline-none focus:ring-4 transition-all bg-white`}
      {...props}
    />
    {error && <span className="text-xs text-red-500">{error}</span>}
  </div>
);

const ProductCard = ({ product }) => {
  const { dispatch } = useContext(AppContext);

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 hover:shadow-xl transition-all duration-300 group flex flex-col h-full">
      <div className="relative aspect-square overflow-hidden bg-slate-100">
        <img src={product.image} alt={product.name} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold text-indigo-600 shadow-sm">
          {product.category}
        </div>
      </div>
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg text-slate-900 leading-tight">{product.name}</h3>
          <span className="flex items-center text-amber-400 text-sm font-medium">
            <Star size={14} className="fill-current mr-1" /> {product.rating}
          </span>
        </div>
        <p className="text-slate-500 text-sm mb-4 line-clamp-2 flex-grow">{product.desc}</p>
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
          <span className="text-xl font-bold text-slate-900">{product.price.toFixed(2)} zł</span>
          <button 
            onClick={() => {
              dispatch({ type: ACTIONS.ADD_TO_CART, payload: product });
              dispatch({ type: ACTIONS.SHOW_NOTIFICATION, payload: { type: 'success', message: 'Dodano do koszyka' } });
            }}
            className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-indigo-600 transition-colors"
          >
            <ShoppingBag size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

const CartSidebar = () => {
  const { state, dispatch } = useContext(AppContext);
  const total = state.cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  if (!state.isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => dispatch({ type: ACTIONS.TOGGLE_CART })} />
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ShoppingBag className="text-indigo-600" /> Koszyk ({state.cart.length})
          </h2>
          <button onClick={() => dispatch({ type: ACTIONS.TOGGLE_CART })} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {state.cart.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <ShoppingBag size={48} className="mx-auto mb-4 opacity-20" />
              <p>Twój koszyk jest pusty</p>
            </div>
          ) : (
            state.cart.map(({ product, quantity }) => (
              <div key={product.id} className="flex gap-4">
                <img src={product.image} alt={product.name} className="w-20 h-20 rounded-lg object-cover bg-slate-100" />
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900 line-clamp-1">{product.name}</h4>
                  <p className="text-sm text-slate-500 mb-2">{product.category}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center border border-slate-200 rounded-lg">
                      <button 
                        className="px-2 py-1 hover:bg-slate-50 text-slate-600"
                        onClick={() => quantity > 1 ? dispatch({ type: ACTIONS.UPDATE_QUANTITY, payload: { id: product.id, quantity: quantity - 1 } }) : dispatch({ type: ACTIONS.REMOVE_FROM_CART, payload: product.id })}
                      >-</button>
                      <span className="px-2 text-sm font-medium">{quantity}</span>
                      <button 
                        className="px-2 py-1 hover:bg-slate-50 text-slate-600"
                        onClick={() => dispatch({ type: ACTIONS.UPDATE_QUANTITY, payload: { id: product.id, quantity: quantity + 1 } })}
                      >+</button>
                    </div>
                    <span className="font-bold text-slate-900">{(product.price * quantity).toFixed(2)} zł</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {state.cart.length > 0 && (
          <div className="p-6 bg-slate-50 border-t border-slate-100">
            <div className="flex justify-between mb-4 text-lg font-bold text-slate-900">
              <span>Suma</span>
              <span>{total.toFixed(2)} zł</span>
            </div>
            <Button 
              className="w-full" 
              onClick={() => {
                dispatch({ type: ACTIONS.TOGGLE_CART });
                window.dispatchEvent(new CustomEvent('navigate', { detail: 'checkout' }));
              }}
            >
              Przejdź do płatności
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

const CheckoutView = () => {
  const { state, dispatch } = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('shipping'); // shipping, payment, success
  const total = state.cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  
  const [formData, setFormData] = useState({
    name: '', email: '', address: '', city: '', zip: '',
    cardNumber: '', expiry: '', cvc: ''
  });

  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!state.user) {
        // Auto login for demo
        dispatch({ type: ACTIONS.SET_USER, payload: { id: 'guest', name: formData.name, email: formData.email, orders: [] } });
    }

    try {
      // Symulacja wywołania API Stripe/Payment Gateway
      const response = await api.processPayment({
        cardNumber: formData.cardNumber,
        cvc: formData.cvc
      }, total);

      // Sukces
      const order = {
        id: response.transactionId,
        date: new Date().toISOString(),
        items: state.cart,
        total: total,
        status: 'Opłacone'
      };

      dispatch({ type: ACTIONS.ADD_ORDER, payload: order });
      dispatch({ type: ACTIONS.SHOW_NOTIFICATION, payload: { type: 'success', message: 'Płatność przyjęta pomyślnie!' } });
      setStep('success');
    } catch (error) {
      dispatch({ type: ACTIONS.SHOW_NOTIFICATION, payload: { type: 'error', message: error.message } });
    } finally {
      setLoading(false);
    }
  };

  if (state.cart.length === 0 && step !== 'success') {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <ShoppingBag size={64} className="text-slate-200 mb-4" />
        <h2 className="text-2xl font-bold text-slate-800">Twój koszyk jest pusty</h2>
        <Button className="mt-6" onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'home' }))}>
          Wróć do sklepu
        </Button>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="max-w-lg mx-auto py-20 text-center px-4">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={40} className="text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Dziękujemy za zamówienie!</h2>
        <p className="text-slate-600 mb-8">Twoje zamówienie zostało przekazane do realizacji. Potwierdzenie wysłaliśmy na maila.</p>
        <Button onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'home' }))}>
          Kontynuuj zakupy
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 grid grid-cols-1 lg:grid-cols-2 gap-12">
      <div>
        <div className="flex gap-4 mb-8">
          <div className={`flex-1 pb-2 border-b-2 ${step === 'shipping' ? 'border-indigo-600 text-indigo-600' : 'border-slate-200 text-slate-400'} font-medium`}>
            1. Dostawa
          </div>
          <div className={`flex-1 pb-2 border-b-2 ${step === 'payment' ? 'border-indigo-600 text-indigo-600' : 'border-slate-200 text-slate-400'} font-medium`}>
            2. Płatność
          </div>
        </div>

        {step === 'shipping' ? (
          <form onSubmit={(e) => { e.preventDefault(); setStep('payment'); }} className="space-y-6 animate-in slide-in-from-left duration-300">
            <h2 className="text-2xl font-bold mb-4">Dane do wysyłki</h2>
            <div className="grid grid-cols-2 gap-4">
              <Input required label="Imię i Nazwisko" placeholder="Jan Kowalski" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="col-span-2" />
              <Input required type="email" label="Email" placeholder="jan@example.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="col-span-2" />
              <Input required label="Adres" placeholder="ul. Prosta 1/2" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="col-span-2" />
              <Input required label="Miasto" placeholder="Warszawa" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
              <Input required label="Kod pocztowy" placeholder="00-001" value={formData.zip} onChange={e => setFormData({...formData, zip: e.target.value})} />
            </div>
            <div className="pt-4">
              <Button type="submit" className="w-full">Przejdź do płatności <ArrowRight size={18} /></Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handlePayment} className="space-y-6 animate-in slide-in-from-right duration-300">
            <h2 className="text-2xl font-bold mb-4">Bezpieczna płatność</h2>
            
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-6">
              <div className="flex justify-between items-center mb-6">
                <span className="font-semibold text-slate-700">Karta płatnicza</span>
                <div className="flex gap-2">
                  <div className="w-8 h-5 bg-slate-300 rounded"></div>
                  <div className="w-8 h-5 bg-slate-300 rounded"></div>
                </div>
              </div>
              <div className="space-y-4">
                <Input 
                  required 
                  label="Numer karty" 
                  placeholder="0000 0000 0000 0000" 
                  maxLength={19}
                  value={formData.cardNumber} 
                  onChange={e => setFormData({...formData, cardNumber: e.target.value})} 
                  icon={<CreditCard size={18} />}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input required label="Data ważności" placeholder="MM/YY" maxLength={5} value={formData.expiry} onChange={e => setFormData({...formData, expiry: e.target.value})} />
                  <Input required label="CVC" placeholder="123" maxLength={3} type="password" value={formData.cvc} onChange={e => setFormData({...formData, cvc: e.target.value})} />
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="secondary" onClick={() => setStep('shipping')} disabled={loading}>Wróć</Button>
              <Button type="submit" className="flex-1" loading={loading}>Zapłać {total.toFixed(2)} zł</Button>
            </div>
            <p className="text-xs text-center text-slate-400 mt-4 flex items-center justify-center gap-1">
              <AlertCircle size={12} /> Płatności są szyfrowane i bezpieczne.
            </p>
          </form>
        )}
      </div>

      <div className="bg-slate-50 p-8 rounded-2xl h-fit border border-slate-100 sticky top-24">
        <h3 className="text-lg font-bold mb-6">Podsumowanie</h3>
        <div className="space-y-4 mb-6">
          {state.cart.map((item) => (
            <div key={item.product.id} className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded bg-indigo-100 text-indigo-600 text-xs font-bold flex items-center justify-center">
                  {item.quantity}x
                </div>
                <span className="text-slate-700 text-sm">{item.product.name}</span>
              </div>
              <span className="text-slate-900 font-medium">{(item.product.price * item.quantity).toFixed(2)} zł</span>
            </div>
          ))}
        </div>
        <div className="border-t border-slate-200 pt-4 space-y-2">
          <div className="flex justify-between text-slate-500">
            <span>Suma częściowa</span>
            <span>{total.toFixed(2)} zł</span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>Dostawa</span>
            <span>0.00 zł</span>
          </div>
          <div className="flex justify-between text-xl font-bold text-slate-900 pt-2">
            <span>Do zapłaty</span>
            <span>{total.toFixed(2)} zł</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const UserProfile = () => {
  const { state } = useContext(AppContext);

  if (!state.user) return <div className="p-12 text-center">Proszę się zalogować.</div>;

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="flex items-center gap-4 mb-8 pb-8 border-b border-slate-100">
        <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-3xl font-bold">
          {state.user.name.charAt(0)}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{state.user.name}</h1>
          <p className="text-slate-500">{state.user.email}</p>
        </div>
      </div>

      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        <Package size={20} /> Historia zamówień
      </h2>

      {!state.user.orders || state.user.orders.length === 0 ? (
        <p className="text-slate-500 italic">Brak zamówień w historii.</p>
      ) : (
        <div className="space-y-4">
          {state.user.orders.map(order => (
            <div key={order.id} className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded-full uppercase tracking-wider">
                    {order.status}
                  </span>
                  <p className="text-sm text-slate-500 mt-2">ID: {order.id}</p>
                  <p className="text-xs text-slate-400">{new Date(order.date).toLocaleDateString()}</p>
                </div>
                <span className="text-xl font-bold text-slate-900">{order.total.toFixed(2)} zł</span>
              </div>
              <div className="space-y-2 border-t border-slate-100 pt-4">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm text-slate-600">
                    <span>{item.quantity}x {item.product.name}</span>
                    <span>{(item.product.price * item.quantity).toFixed(2)} zł</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const Notifications = () => {
  const { state, dispatch } = useContext(AppContext);

  return (
    <div className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2">
      {state.notifications.map(n => (
        <div 
          key={n.id}
          onAnimationEnd={() => setTimeout(() => dispatch({ type: ACTIONS.HIDE_NOTIFICATION, payload: n.id }), 3000)}
          className={`px-4 py-3 rounded-lg shadow-lg text-white font-medium flex items-center gap-2 animate-in slide-in-from-right fade-in duration-300 ${
            n.type === 'error' ? 'bg-red-500' : 'bg-slate-900'
          }`}
        >
          {n.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          {n.message}
        </div>
      ))}
    </div>
  );
};

// --- MAIN APP LAYOUT ---

export default function App() {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [view, setView] = useState('home');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Wszystkie');

  useEffect(() => {
    const handler = (e) => setView(e.detail);
    window.addEventListener('navigate', handler);
    return () => window.removeEventListener('navigate', handler);
  }, []);

  const filteredProducts = PRODUCTS.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'Wszystkie' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = ['Wszystkie', ...new Set(PRODUCTS.map(p => p.category))];

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      <div className="min-h-screen bg-white font-sans text-slate-800 pb-20">
        
        {/* Navbar */}
        <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
            <div className="flex items-center gap-8">
              <h1 
                className="text-2xl font-black tracking-tighter text-indigo-600 cursor-pointer flex items-center gap-2"
                onClick={() => setView('home')}
              >
                <div className="w-6 h-6 bg-indigo-600 rounded-md transform rotate-45"></div>
                LUMINA
              </h1>
              
              <div className="hidden md:flex gap-6 text-sm font-medium text-slate-600">
                <button onClick={() => setView('home')} className="hover:text-indigo-600 transition-colors">Sklep</button>
                <button className="hover:text-indigo-600 transition-colors">O nas</button>
                <button className="hover:text-indigo-600 transition-colors">Kontakt</button>
              </div>
            </div>

            <div className="flex-1 max-w-md hidden md:block">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                <input 
                  type="text"
                  placeholder="Szukaj produktów..." 
                  className="w-full bg-slate-100 border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              {state.user ? (
                <button 
                  onClick={() => setView('profile')}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-slate-100 text-sm font-medium"
                >
                  <div className="w-6 h-6 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs">
                    {state.user.name.charAt(0)}
                  </div>
                  <span className="hidden sm:inline">{state.user.name.split(' ')[0]}</span>
                </button>
              ) : (
                <button 
                  onClick={() => dispatch({ type: ACTIONS.SET_USER, payload: { id: 'demo', name: 'Demo User', email: 'demo@lumina.com', orders: [] } })}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-slate-100 text-sm font-medium text-slate-600"
                >
                  <LogIn size={18} />
                  <span className="hidden sm:inline">Zaloguj</span>
                </button>
              )}

              <button 
                className="relative p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-700"
                onClick={() => dispatch({ type: ACTIONS.TOGGLE_CART })}
              >
                <ShoppingBag size={22} />
                {state.cart.length > 0 && (
                  <span className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white">
                    {state.cart.reduce((a, b) => a + b.quantity, 0)}
                  </span>
                )}
              </button>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main>
          {view === 'home' && (
            <>
              {/* Hero Banner */}
              <div className="bg-slate-900 text-white py-20 px-4 mb-12 overflow-hidden relative">
                <div className="absolute inset-0 bg-indigo-600/20" />
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500 rounded-full blur-[100px] opacity-50" />
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-500 rounded-full blur-[100px] opacity-30" />
                
                <div className="max-w-7xl mx-auto relative z-10 text-center flex flex-col items-center justify-center">
                  <div className="max-w-3xl mx-auto">
                    <h2 className="text-5xl md:text-6xl font-black mb-6 tracking-tight leading-tight">
                      Technologia <br />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Jutra.</span>
                    </h2>
                    <p className="text-lg text-slate-300 mb-8 max-w-lg mx-auto">
                      Odkryj wyselekcjonowaną kolekcję sprzętu premium. Od audiofilskich słuchawek po najnowsze stacje robocze.
                    </p>
                    <Button onClick={() => document.getElementById('products').scrollIntoView({ behavior: 'smooth' })}
                      className='mx-auto'>
                      Zobacz Kolekcję
                    </Button>
                  </div>
                </div>
              </div>

              {/* Product Grid */}
              <div id="products" className="max-w-7xl mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                  <h3 className="text-2xl font-bold text-slate-900">Polecane Produkty</h3>
                  
                  <div className="flex overflow-x-auto pb-2 gap-2 w-full md:w-auto no-scrollbar">
                    {categories.map(cat => (
                      <button 
                        key={cat}
                        onClick={() => setCategoryFilter(cat)}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                          categoryFilter === cat 
                            ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20' 
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {filteredProducts.length === 0 ? (
                  <div className="text-center py-20">
                    <Filter className="mx-auto text-slate-300 mb-4" size={48} />
                    <p className="text-slate-500">Nie znaleziono produktów spełniających kryteria.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                    {filteredProducts.map(product => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {view === 'checkout' && <CheckoutView />}
          {view === 'profile' && <UserProfile />}
        </main>

        <CartSidebar />
        <Notifications />
      </div>
    </AppContext.Provider>
  );
}
import { createContext, useContext } from 'react';

const CartRefreshContext = createContext({
    reloadCart: () => { },
});

export const CartRefreshProvider = ({ reloadCart, children }) => (
    <CartRefreshContext.Provider value={{ reloadCart }}>
        {children}
    </CartRefreshContext.Provider>
);

export const useCartRefresh = () => useContext(CartRefreshContext);
import { createContext, useContext } from 'react';

const CartRefreshContext = createContext({
    refreshCart: () => { },
});

export const CartRefreshProvider = ({ refreshCart, children }) => (
    <CartRefreshContext.Provider value={{ refreshCart }}>
        {children}
    </CartRefreshContext.Provider>
);

export const useCartRefresh = () => useContext(CartRefreshContext);
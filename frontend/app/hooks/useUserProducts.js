import { useState, useEffect, useCallback } from 'react';
import apiService from '../api/ApiService';
import AdminApiService from '../api/AdminApiService';

export default function useUserProducts() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedFilter, setSelectedFilter] = useState('');

    const loadProducts = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiService.getProducts(page);
            console.log((response?.data));
            setProducts([...response?.data?.products || []]);
            setTotalPages(response?.data?.totalPages || 1);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const loadPopularProducts = async () => {
        try {
            setLoading(true);
            const response = await AdminApiService.getPopularProducts();
            setProducts(response?.data?.products || []);
            setTotalPages(response?.data?.totalPages || 1);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const refreshProducts = async () => {
        setPage(1);
        await loadProducts();
    };

    useEffect(() => {
        loadProducts();
    }, [page]);

    return {
        products,
        loading,
        error,
        page,
        totalPages,
        setPage,
        selectedFilter,
        setSelectedFilter,
        loadProducts,
        loadPopularProducts,
        refreshProducts,
    };
}

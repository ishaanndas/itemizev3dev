import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Product = "ap" | "cash";

interface ProductContextType {
  product: Product;
  setProduct: (p: Product) => void;
}

const ProductContext = createContext<ProductContextType>({
  product: "ap",
  setProduct: () => {},
});

const STORAGE_KEY = "itemize.activeProduct";

export function ProductProvider({ children }: { children: ReactNode }) {
  const [product, setProductState] = useState<Product>(() => {
    if (typeof window === "undefined") return "ap";
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === "cash" ? "cash" : "ap";
  });

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, product);
  }, [product]);

  const setProduct = (p: Product) => setProductState(p);

  return (
    <ProductContext.Provider value={{ product, setProduct }}>
      {children}
    </ProductContext.Provider>
  );
}

export const useProduct = () => useContext(ProductContext);

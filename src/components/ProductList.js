import React, { useEffect, useState } from "react";
import ProductItem from "./ProductItem";
import ProductListingModal from "./ProductListingModal";
import axios from "axios";
import { closestCorners, DndContext } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

const ProductList = () => {
  const [isModelOpen, setIsModelOpen] = useState(false);
  const [productsData, setProductsData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loader, setLoader] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([{}]);

  const addNewProduct = () => {
    setSelectedProducts([...selectedProducts, {}]);
  };

  const openModal = () => {
    setIsModelOpen(true);
  };

  const closeModal = () => {
    setIsModelOpen(false);
  };

  const addProduct = () => {
    const checkedProducts = productsData.filter((product) => {
      // Check if the product itself is checked or if any of its variants is checked
      const isVariantChecked = product.variants?.some(
        (variant) => variant.is_checked
      );
      return product.is_checked || isVariantChecked;
    });
    setSelectedProducts(checkedProducts);
    setIsModelOpen(false);
  };

  const removeProduct = (productId) => {
    setSelectedProducts((prevProducts) => {
      const updatedProducts = prevProducts.filter(
        (product) => product.id !== productId
      );

      return updatedProducts;
    });
  };

  const removeVariant = (productId, variantId) => {
    setSelectedProducts((prevProducts) => {
      return prevProducts.map((product) => {
        if (product.id === productId) {
          const updatedVariants = product.variants.map((variant) => {
            if (variant.id === variantId) {
              variant.is_checked = false;
            }
            return variant;
          });

          return {
            ...product,
            variants: updatedVariants,
          };
        }
        return product;
      });
    });
  };

  const fetchProductsData = async () => {
    setLoader(true);
    try {
      console.log("start fetching");
      const response = await axios.get(
        `https://stageapi.monkcommerce.app/task/products/search?search=${searchQuery}`,
        { headers: { "x-api-key": "72njgfa948d9aS7gs5" } }
      );
      const modifiedData = response?.data.map((product) => ({
        ...product,
        is_checked: false,
        indeterminate: false,
        variants: product.variants.map((variant) => ({
          ...variant,
          is_checked: false,
        })),
      }));
      console.log("resp: ", modifiedData);
      setProductsData(modifiedData);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoader(false);
    }
  };

  useEffect(() => {
    fetchProductsData();
  }, [searchQuery]);

  return (
    <div className="products-container">
      <h2 className="product-list-heading">
        Add Bundle Products (Max. 4 Products)
      </h2>
      <div className="bundle-info">
        <svg
          className="info-icon"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="rgba(242,178,21,1)"
        >
          <path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM11 11V17H13V11H11ZM11 7V9H13V7H11Z"></path>
        </svg>
        <p className="bundle-info-text">
          Offer Bundle will be shown to the customer whenever any of the bundle
          products are added to the cart.
        </p>
      </div>

      <DndContext collisionDetection={closestCorners}>
        <SortableContext
          items={selectedProducts}
          strategy={verticalListSortingStrategy}
        >
          <div className="products-list-container">
            {selectedProducts?.map((product, index) => (
              <ProductItem
                id={product.id}
                key={product?.id}
                openModal={openModal}
                product={product}
                removeProduct={removeProduct}
                removeVariant={removeVariant}
                isVariant={false}
                index={index}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      <div
        style={{ display: "flex", width: "100%", justifyContent: "flex-end" }}
      >
        <button className="add-product-btn" onClick={addNewProduct}>
          Add Product
        </button>
      </div>

      <ProductListingModal
        isOpen={isModelOpen}
        onClose={closeModal}
        productsData={productsData}
        setProductsData={setProductsData}
        selectedProducts={selectedProducts}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        loader={loader}
        addProduct={addProduct}
      />
    </div>
  );
};

export default ProductList;

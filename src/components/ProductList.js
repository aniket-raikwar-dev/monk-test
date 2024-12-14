import React, { useState } from "react";
import ProductItem from "./ProductItem";
import ProductListingModal from "./ProductListingModal";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

const ProductList = () => {
  const [isModelOpen, setIsModelOpen] = useState(false);
  const [productsData, setProductsData] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([{ id: 1 }]);
  const [productCount, setProductCount] = useState(0);

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    if (active.id !== over.id) {
      setSelectedProducts((items) => {
        const activeProduct = items.find((item) =>
          item.variants?.some((variant) => variant.id === active.id)
        );

        if (activeProduct) {
          // Handle variant reordering
          const updatedProducts = items.map((product) => {
            if (product.id === activeProduct.id) {
              const oldIndex = product.variants.findIndex(
                (variant) => variant.id === active.id
              );
              const newIndex = product.variants.findIndex(
                (variant) => variant.id === over.id
              );

              const updatedVariants = arrayMove(
                product.variants,
                oldIndex,
                newIndex
              );

              return { ...product, variants: updatedVariants };
            }
            return product;
          });

          return updatedProducts;
        } else {
          // Handle product reordering
          const oldIndex = items.findIndex((item) => item.id === active.id);
          const newIndex = items.findIndex((item) => item.id === over.id);

          return arrayMove(items, oldIndex, newIndex);
        }
      });
    }
  };

  const addNewProduct = () => {
    const newProductId = selectedProducts.length + 1;
    setSelectedProducts([...selectedProducts, { id: newProductId }]);
  };

  const openModal = () => {
    setIsModelOpen(true);
  };

  const closeModal = () => {
    setIsModelOpen(false);
  };


  const updateMainPageProducts = (data) => {
    const selectedProducts = data.length === 0 ? productsData : data;
    const checkedProducts = selectedProducts?.filter((product) => {
      const isVariantChecked = product.variants?.some(
        (variant) => variant.is_checked
      );
      return product.is_checked || isVariantChecked;
    });
    setSelectedProducts(checkedProducts);
    setIsModelOpen(false);
  };

  const updateProductSelection = (productId, isRemove) => {
    let count = productCount;
    const updatedProducts = productsData.map((product) => {
      if (product.id === productId) {
        const is_checked = !product.is_checked;
        if (is_checked) {
          setStoreSelectedProducts((prevSelected) => [
            ...prevSelected,
            { ...product, is_checked },
          ]);
          count++;
        } else {
          count--;
          setStoreSelectedProducts((prevSelected) =>
            prevSelected.filter((p) => p.id !== productId)
          );
        }
        return {
          ...product,
          is_checked,
          variants: product.variants.map((variant) => ({
            ...variant,
            is_checked,
          })),
        };
      }
      return product;
    });

    setProductsData(updatedProducts);
    setProductCount(count);

    if (isRemove) {
      updateMainPageProducts(updatedProducts);
    }
  };

  const updateProductVariantSelection = (productId, variantId, isRemove) => {
    let count = productCount;
    const updatedProducts = productsData.map((product) => {
      if (product.id === productId) {
        const updatedVariants = product.variants.map((variant) => {
          if (variant.id === variantId) {
            return { ...variant, is_checked: !variant.is_checked };
          }
          return variant;
        });

        const allChecked = updatedVariants.every((v) => v.is_checked);
        const someChecked = updatedVariants.some((v) => v.is_checked);

        if (allChecked) count++;
        if (!allChecked && !someChecked) count--;

        return {
          ...product,
          is_checked: allChecked,
          indeterminate: !allChecked && someChecked,
          variants: updatedVariants,
        };
      }
      return product;
    });
    setProductsData(updatedProducts);
    setProductCount(count);

    if (isRemove) {
      updateMainPageProducts(updatedProducts);
    }
  };

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

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={selectedProducts}
          strategy={verticalListSortingStrategy}
        >
          <div className="products-list-container">
            {selectedProducts?.map((product, index) => (
              <ProductItem
                key={product?.id}
                id={product?.id}
                openModal={openModal}
                product={product}
                isVariant={false}
                index={index}
                handleDragEnd={handleDragEnd}
                updateProductSelection={updateProductSelection}
                updateProductVariantSelection={updateProductVariantSelection}
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
        updateProductSelection={updateProductSelection}
        updateProductVariantSelection={updateProductVariantSelection}
        productCount={productCount}
        updateMainPageProducts={updateMainPageProducts}
      />
    </div>
  );
};

export default ProductList;

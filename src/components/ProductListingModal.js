import React, { useState, useEffect } from "react";
import { Modal, Checkbox, Spin } from "antd";
const ProductListingModal = ({
  isOpen,
  onClose,
  productsData,
  setProductsData,
  selectedProducts,
  searchQuery,
  setSearchQuery,
  loader,
  addProduct,
  handleSearchQuery,
}) => {
  const [productCount, setProductCount] = useState(0);

  useEffect(() => {
    let count = 0;
    for (let product of productsData) {
      if (product.is_checked) count++;
    }
    setProductCount(count);
  }, [selectedProducts]);

  const toggleProduct = (productId, variants) => {
    let count = productCount;
    const updatedProducts = productsData.map((product) => {
      if (product.id === productId) {
        const is_checked = !product.is_checked;
        if (is_checked) count++;
        else count--;
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
    // console.log("updated: ", updatedProducts);
    setProductsData(updatedProducts);
    setProductCount(count);
  };

  const toggleVariant = (productId, variantId) => {
    let count = productCount;
    const updatedProducts = productsData.map((product) => {
      if (product.id === productId) {
        const updatedVariants = product.variants.map((variant) => {
          if (variant.id === variantId) {
            console.log("variant: ", variant);
            return { ...variant, is_checked: !variant.is_checked };
          }
          return variant;
        });

        // Determine the parent product's state
        const allChecked = updatedVariants.every((v) => v.is_checked);
        const someChecked = updatedVariants.some((v) => v.is_checked);

        if (allChecked) count++;
        if (!allChecked && !someChecked) count--;

        return {
          ...product,
          is_checked: allChecked,
          indeterminate: !allChecked && someChecked, // Optional: use a custom `indeterminate` property
          variants: updatedVariants,
        };
      }
      return product;
    });
    setProductsData(updatedProducts);
    setProductCount(count);
  };

  return (
    <Modal
      title="Add Products"
      open={isOpen}
      onCancel={onClose}
      footer={
        <div className="modal-footer">
          <p>{productCount} product selected</p>
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={onClose} className="modal-foot-btn">
              Cancel
            </button>
            <button onClick={addProduct} className="modal-foot-btn add-btn">
              Add
            </button>
          </div>
        </div>
      }
    >
      <div className="search-container">
        <div className="search-box">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M18.031 16.6168L22.3137 20.8995L20.8995 22.3137L16.6168 18.031C15.0769 19.263 13.124 20 11 20C6.032 20 2 15.968 2 11C2 6.032 6.032 2 11 2C15.968 2 20 6.032 20 11C20 13.124 19.263 15.0769 18.031 16.6168ZM16.0247 15.8748C17.2475 14.6146 18 12.8956 18 11C18 7.1325 14.8675 4 11 4C7.1325 4 4 7.1325 4 11C4 14.8675 7.1325 18 11 18C12.8956 18 14.6146 17.2475 15.8748 16.0247L16.0247 15.8748Z"></path>
          </svg>
          <input
            type="text"
            placeholder="Search products"
            value={searchQuery}
            onChange={(e) => handleSearchQuery(e)}
          />
        </div>
      </div>

      <div className="product-items-container">
        {loader ? (
          <Spin className="spin" />
        ) : (
          <>
            {productsData?.map((product) => (
              <div key={product.id}>
                <div className="main-item">
                  <Checkbox
                    onChange={() => toggleProduct(product.id, product.variants)}
                    checked={product.is_checked}
                    indeterminate={product.indeterminate}
                  >
                    {/* <img src={} alt="" /> */}
                    <p>{product.title}</p>
                  </Checkbox>
                </div>
                {product?.variants &&
                  product?.variants?.map((variant) => (
                    <div key={variant?.id} className="sub-item">
                      <Checkbox
                        onChange={() => toggleVariant(product.id, variant.id)}
                        checked={variant.is_checked}
                      >
                        <p>{variant?.title}</p>
                      </Checkbox>
                      <p>₹ {variant?.price}</p>
                    </div>
                  ))}
              </div>
            ))}
          </>
        )}
      </div>
    </Modal>
  );
};

export default ProductListingModal;

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Modal, Checkbox, Spin } from "antd";
import { throttle } from "lodash";
import axios from "axios";

const ProductListingModal = ({
  isOpen,
  onClose,
  productsData,
  setProductsData,
  updateProductSelection,
  updateProductVariantSelection,
  productCount,
  updateMainPageProducts,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [loader, setLoader] = useState(false);
  const productItemsContainerRef = useRef(null);

  const fetchProductsData = async (searchQuery) => {
    setLoader(true);
    try {
      const response = await axios.get(
        `https://stageapi.monkcommerce.app/task/products/search?search=${searchQuery}&limit=10`,
        { headers: { "x-api-key": "72njgfa948d9aS7gs5" } }
      );

      const modifiedData = modifiedAPIData(response?.data);
      setProductsData(modifiedData);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoader(false);
    }
  };

  const modifiedAPIData = (data) => {
    return data.map((product) => ({
      ...product,
      is_checked: false,
      indeterminate: false,
      variants: product.variants.map((variant) => ({
        ...variant,
        is_checked: false,
      })),
    }));
  };

  const handleSearchQuery = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    updateThrottleQuery(query);
  };

  const updateThrottleQuery = useCallback(
    throttle((query) => {
      fetchProductsData(query);
    }, 1000),
    []
  );

  useEffect(() => {
    fetchProductsData(searchQuery);
  }, []);

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
            <button
              onClick={() => updateMainPageProducts([])}
              className="modal-foot-btn add-btn"
            >
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

      <div className="product-items-container" ref={productItemsContainerRef}>
        {loader ? (
          <Spin className="spin" />
        ) : (
          <>
            {productsData?.map((product) => (
              <div key={product.id}>
                <div className="main-item">
                  <Checkbox
                    onChange={() => updateProductSelection(product.id, false)}
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
                        onChange={() =>
                          updateProductVariantSelection(
                            product.id,
                            variant.id,
                            false
                          )
                        }
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

import React, { useState, useEffect, useCallback } from "react";
import { Modal, Checkbox, Spin } from "antd";
import { throttle } from "lodash";
import InfiniteScroll from "react-infinite-scroll-component";
import axios from "axios";

const ProductListingModal = ({
  isOpen,
  onClose,
  productsData,
  setProductsData,
  toggleProductSelection,
  toggleProductVariantSelection,
  productCount,
  addProductToMainPage,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [initialLoader, setInitialLoader] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    hasMore: true,
    isLoadingMore: false,
  });

  const fetchProductsData = async (searchQuery, pageNumber = 1) => {
    if (pagination.isLoadingMore) return;

    if (pageNumber === 1) {
      setInitialLoader(true);
    } else {
      setPagination((prev) => ({ ...prev, isLoadingMore: true }));
    }
    try {
      const response = await axios.get(
        `https://stageapi.monkcommerce.app/task/products/search?search=${searchQuery}&limit=10&page=${pageNumber}`,
        { headers: { "x-api-key": "72njgfa948d9aS7gs5" } }
      );

      const modifiedData = modifiedAPIData(response?.data);
      setProductsData((prevData) =>
        pageNumber === 1 ? modifiedData : [...prevData, ...modifiedData]
      );

      setPagination({
        page: pageNumber,
        hasMore: modifiedData.length === 10,
        isLoadingMore: false,
      });
    } catch (error) {
      console.error("Error fetching products:", error);
      setPagination((prev) => ({
        ...prev,
        hasMore: false,
        isLoadingMore: false,
      }));
    } finally {
      if (pageNumber === 1) {
        setInitialLoader(false);
      }
    }
  };
  
  const loadMoreProducts = () => {
    if (pagination.hasMore && !pagination.isLoadingMore) {
      const nextPage = pagination.page + 1;
      fetchProductsData(searchQuery, nextPage);
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
      setPagination({
        page: 1,
        hasMore: true,
        isLoadingMore: false,
      });
      fetchProductsData(query, 1);
    }, 1000),
    []
  );

  useEffect(() => {
    fetchProductsData(searchQuery, 1);
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
              onClick={addProductToMainPage}
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

      <InfiniteScroll
        dataLength={productsData?.length || 0}
        next={loadMoreProducts}
        hasMore={pagination.hasMore}
        height={470}
        loader={
          <p className="loading-text">
            {pagination.isLoadingMore && !initialLoader
              ? "Loading more products..."
              : null}
          </p>
        }
      >
        {initialLoader ? (
          <Spin className="spin" />
        ) : (
          <div>
            {productsData?.map((product) => (
              <div key={product.id}>
                <div className="main-item">
                  <Checkbox
                    onChange={() => toggleProductSelection(product.id, false)}
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
                          toggleProductVariantSelection(
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
          </div>
        )}
      </InfiniteScroll>
    </Modal>
  );
};

export default ProductListingModal;

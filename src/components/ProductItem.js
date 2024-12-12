import React, { useState } from "react";
import { Select } from "antd";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const ProductItem = ({
  id,
  openModal,
  product,
  removeProduct,
  removeVariant,
  isVariant = false,
  index,
  handleDragEnd,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: "grab",
    outline: "none",
  };

  const [isShowVariant, setIsShowVariant] = useState(false);
  const [isAddDiscount, setIsAddDiscount] = useState(false);
  const [discount, setDiscount] = useState(0);

  const showVariant = () => {
    setIsShowVariant(!isShowVariant);
  };

  const addDiscount = () => {
    setIsAddDiscount(!isAddDiscount);
  };

  return (
    <div
      ref={setNodeRef}
      key={`product-key${index}-${product?.id}`}
      style={style}
      className={isVariant ? "product-nested-box" : "product-box"}
    >
      <div className={isVariant ? "product-nested-item" : "product-item"}>
        <svg
          {...attributes}
          {...listeners}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="#686868"
        >
          <path d="M8.5 7C9.32843 7 10 6.32843 10 5.5C10 4.67157 9.32843 4 8.5 4C7.67157 4 7 4.67157 7 5.5C7 6.32843 7.67157 7 8.5 7ZM8.5 13.5C9.32843 13.5 10 12.8284 10 12C10 11.1716 9.32843 10.5 8.5 10.5C7.67157 10.5 7 11.1716 7 12C7 12.8284 7.67157 13.5 8.5 13.5ZM10 18.5C10 19.3284 9.32843 20 8.5 20C7.67157 20 7 19.3284 7 18.5C7 17.6716 7.67157 17 8.5 17C9.32843 17 10 17.6716 10 18.5ZM15.5 7C16.3284 7 17 6.32843 17 5.5C17 4.67157 16.3284 4 15.5 4C14.6716 4 14 4.67157 14 5.5C14 6.32843 14.6716 7 15.5 7ZM17 12C17 12.8284 16.3284 13.5 15.5 13.5C14.6716 13.5 14 12.8284 14 12C14 11.1716 14.6716 10.5 15.5 10.5C16.3284 10.5 17 11.1716 17 12ZM15.5 20C16.3284 20 17 19.3284 17 18.5C17 17.6716 16.3284 17 15.5 17C14.6716 17 14 17.6716 14 18.5C14 19.3284 14.6716 20 15.5 20Z"></path>
        </svg>
        <p className="product-number">{index + 1}</p>
        <div className="product-name">
          <input
            type="text"
            placeholder="Select Product"
            value={product?.title}
            disabled={true}
          />

          {!isVariant && (
            <svg
              onClick={openModal}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="#007555"
            >
              <path d="M12.8995 6.85453L17.1421 11.0972L7.24264 20.9967H3V16.754L12.8995 6.85453ZM14.3137 5.44032L16.435 3.319C16.8256 2.92848 17.4587 2.92848 17.8492 3.319L20.6777 6.14743C21.0682 6.53795 21.0682 7.17112 20.6777 7.56164L18.5563 9.68296L14.3137 5.44032Z"></path>
            </svg>
          )}
        </div>

        <div className="btn">
          {isAddDiscount ? (
            <div className="discount-box">
              <input
                className="discount-input"
                type="number"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
              />
              <Select
                defaultValue="% off"
                options={[
                  { value: "% off", label: "% off" },
                  { value: "flat off", label: "flat off" },
                ]}
              />
            </div>
          ) : (
            <div className="add-discount-btn" onClick={addDiscount}>
              Add Discount
            </div>
          )}
        </div>

        <div
          onClick={() =>
            isVariant
              ? removeVariant(product?.parentId, product?.id)
              : removeProduct(product?.id)
          }
          className="product-remove"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="#686868"
          >
            <path d="M11.9997 10.5865L16.9495 5.63672L18.3637 7.05093L13.4139 12.0007L18.3637 16.9504L16.9495 18.3646L11.9997 13.4149L7.04996 18.3646L5.63574 16.9504L10.5855 12.0007L5.63574 7.05093L7.04996 5.63672L11.9997 10.5865Z"></path>
          </svg>
        </div>
      </div>

      {product?.variants?.length > 0 && (
        <div>
          <div className="show-variant" onClick={showVariant}>
            {isShowVariant ? "Hide Variants" : "Show Variants"}
          </div>

          {isShowVariant && (
            <SortableContext
              items={product.variants.map((variant) => variant.id)}
              strategy={verticalListSortingStrategy}
            >
              {product.variants.map(
                (variant, index) =>
                  variant.is_checked && (
                    <ProductItem
                      id={variant.id}
                      openModal={openModal}
                      product={{ ...variant, parentId: product.id }}
                      removeProduct={removeProduct}
                      removeVariant={removeVariant}
                      isVariant={true}
                      index={index}
                      handleDragEnd={handleDragEnd}
                    />
                  )
              )}
            </SortableContext>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductItem;

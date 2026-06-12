function CategorySummary() {
  return (
    <div className="category-card">

      <h3>Top Spending Categories</h3>

      <div className="category-row">
        <span>🍔 Food</span>
        <span>₹12,500</span>
      </div>

      <div className="category-row">
        <span>⛽ Fuel</span>
        <span>₹6,400</span>
      </div>

      <div className="category-row">
        <span>🛒 Shopping</span>
        <span>₹8,700</span>
      </div>

      <div className="category-row">
        <span>🎬 Entertainment</span>
        <span>₹4,300</span>
      </div>

    </div>
  );
}

export default CategorySummary;